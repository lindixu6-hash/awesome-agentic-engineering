import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  parseEvalResults,
  validateFixtureReferences
} from "../bin/validate-eval-results.js";
import {
  parseFixtureJsonl
} from "../bin/validate-prompt-injection-fixtures.js";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);
const adapterRoot = path.join(projectRoot, "adapters", "openai-agents");
const fixturePath = path.join(
  projectRoot,
  "evals",
  "prompt-injection",
  "fixtures.jsonl"
);
const fixtures = parseFixtureJsonl(fs.readFileSync(fixturePath, "utf8"));
const dependencyPath = path.join(
  adapterRoot,
  "node_modules",
  "@openai",
  "agents",
  "package.json"
);

async function loadAdapter(t) {
  if (!fs.existsSync(dependencyPath)) {
    t.skip(
      "run npm ci --prefix adapters/openai-agents to execute integration tests"
    );
    return null;
  }
  return import("../adapters/openai-agents/run.js");
}

test("OpenAI Agents adapter pins an isolated SDK and peer dependency", () => {
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(adapterRoot, "package.json"), "utf8")
  );
  const lock = JSON.parse(
    fs.readFileSync(path.join(adapterRoot, "package-lock.json"), "utf8")
  );
  const rootPackage = JSON.parse(
    fs.readFileSync(path.join(projectRoot, "package.json"), "utf8")
  );

  assert.equal(packageJson.dependencies["@openai/agents"], "0.16.1");
  assert.equal(packageJson.dependencies.zod, "4.4.3");
  assert.equal(
    lock.packages["node_modules/@openai/agents"].version,
    "0.16.1"
  );
  assert.equal(lock.packages["node_modules/zod"].version, "4.4.3");
  assert.equal(rootPackage.dependencies, undefined);
  assert.equal(rootPackage.files.includes("adapters"), false);
  assert.ok(
    rootPackage.files.includes("adapters/openai-agents/package-lock.json")
  );
  assert.ok(rootPackage.files.includes("adapters/openai-agents/run.js"));
});

test("authority policy is machine-readable and fails closed", async (t) => {
  const adapter = await loadAdapter(t);
  if (!adapter) return;
  const authority = adapter.loadAuthorityPolicy();

  assert.equal(authority.toolManifest.default_authorization, "deny");
  assert.deepEqual(authority.approval.allowed_effects, ["read_only"]);
  assert.deepEqual(
    [...authority.tools.keys()].sort(),
    ["documented_fallback", "trusted_task_handler"]
  );
  assert.match(authority.toolPermissions.sha256, /^[a-f0-9]{64}$/);
  assert.match(authority.approvalPolicy.sha256, /^[a-f0-9]{64}$/);

  const temporaryRoot = fs.mkdtempSync(
    path.join(os.tmpdir(), "authority-policy-")
  );
  try {
    const policyDirectory = path.join(
      temporaryRoot,
      "evals",
      "prompt-injection"
    );
    fs.mkdirSync(policyDirectory, { recursive: true });
    for (const name of ["tool-permissions.json", "approval-policy.json"]) {
      fs.copyFileSync(
        path.join(projectRoot, "evals", "prompt-injection", name),
        path.join(policyDirectory, name)
      );
    }
    const permissionsPath = path.join(
      policyDirectory,
      "tool-permissions.json"
    );
    const permissions = JSON.parse(
      fs.readFileSync(permissionsPath, "utf8")
    );
    permissions.default_authorization = "allow";
    fs.writeFileSync(
      permissionsPath,
      `${JSON.stringify(permissions, null, 2)}\n`,
      "utf8"
    );

    assert.throws(
      () => adapter.loadAuthorityPolicy(temporaryRoot),
      /Invalid tool-permission manifest boundary/
    );
  } finally {
    fs.rmSync(temporaryRoot, { recursive: true, force: true });
  }
});

test("real Agent and Runner preserve trust boundaries for every fixture", async (t) => {
  const adapter = await loadAdapter(t);
  if (!adapter) return;

  for (const fixture of fixtures) {
    const run = await adapter.runOpenAIAgentsAgent(fixture);
    const continued =
      run.decision === "allow" || run.decision === "ignore_and_continue";

    assert.equal(run.trustedInstruction, fixture.trusted_instruction);
    assert.equal(run.untrustedSource, fixture.untrusted_content.source);
    assert.equal(run.untrustedContent, fixture.untrusted_content.content);
    assert.equal(run.decision, fixture.expected_outcome);
    assert.ok(
      run.modelCalls.every(
        (call) =>
          call.system_instructions === fixture.trusted_instruction &&
          call.untrusted_source === fixture.untrusted_content.source
      )
    );
    assert.ok(
      run.policyTrace.some(
        (event) =>
          event.channel === "trusted" &&
          event.event === "trusted_instruction_received"
      )
    );
    assert.ok(
      run.policyTrace.some(
        (event) =>
          event.channel === "untrusted" &&
          event.source === fixture.untrusted_content.source
      )
    );
    const authorityEvent = run.policyTrace.find(
      (event) => event.event === "authority_policy_loaded"
    );
    assert.deepEqual(
      authorityEvent.tool_permissions,
      run.authorityPolicy.toolPermissions
    );
    assert.deepEqual(
      authorityEvent.approval_policy,
      run.authorityPolicy.approvalPolicy
    );
    assert.equal(run.modelCalls.length, continued ? 2 : 1);
    assert.equal(
      run.historyItemTypes.includes("function_call_result"),
      continued
    );
    assert.equal(run.toolTrace.length, continued ? 1 : 0);
    assert.ok(
      run.toolTrace.every(
        (event) =>
          event.effect === "read_only" &&
          event.authorization === "allowed" &&
          event.tool_permissions_sha256 ===
            run.authorityPolicy.toolPermissions.sha256 &&
          event.approval_policy_sha256 ===
            run.authorityPolicy.approvalPolicy.sha256
      )
    );
  }
});

test("custom Model path completes with provider network disabled", async (t) => {
  const adapter = await loadAdapter(t);
  if (!adapter) return;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    throw new Error("Provider network access is forbidden in this test.");
  };

  try {
    const run = await adapter.runOpenAIAgentsAgent(fixtures[0]);
    assert.equal(run.decision, fixtures[0].expected_outcome);
    assert.equal(run.modelCalls.length, 2);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("OpenAI Agents suite emits valid results and complete evidence", async (t) => {
  const adapter = await loadAdapter(t);
  if (!adapter) return;
  const output = fs.mkdtempSync(
    path.join(os.tmpdir(), "openai-agents-eval-")
  );

  try {
    const results = await adapter.runOpenAIAgentsSuite(
      fixtures,
      output,
      "2026-08-17T00:00:00.000Z"
    );
    const parsed = parseEvalResults(
      fs.readFileSync(path.join(output, "results.jsonl"), "utf8")
    );
    validateFixtureReferences(parsed, fixtures);

    assert.equal(results.length, 8);
    assert.ok(parsed.every((result) => result.outcome === "pass"));
    for (const result of parsed) {
      for (const reference of [
        ...result.evidence_references,
        ...result.tool_trace_references,
        ...result.policy_trace_references
      ]) {
        assert.equal(fs.existsSync(path.join(output, reference)), true);
      }
    }

    const summary = JSON.parse(
      fs.readFileSync(path.join(output, "summary.json"), "utf8")
    );
    assert.equal(summary.runtime, "@openai/agents@0.16.1");
    assert.equal(summary.orchestration, "Agent + Runner.run()");
    assert.deepEqual(
      [summary.total, summary.passed, summary.failed],
      [8, 8, 0]
    );
  } finally {
    fs.rmSync(output, { recursive: true, force: true });
  }
});

test("OpenAI Agents evaluator preserves observed failures", async (t) => {
  const adapter = await loadAdapter(t);
  if (!adapter) return;
  const fixture = { ...fixtures[0], expected_outcome: "refuse" };
  const run = await adapter.runOpenAIAgentsAgent(fixture);
  const result = adapter.evaluateOpenAIAgentsRun(
    fixture,
    run,
    "2026-08-17T00:00:00.000Z"
  );

  assert.equal(run.decision, "ignore_and_continue");
  assert.equal(result.outcome, "fail");
});

test("bilingual OpenAI Agents docs state integration evidence limits", () => {
  const english = fs.readFileSync(
    path.join(adapterRoot, "README.md"),
    "utf8"
  );
  const chinese = fs.readFileSync(
    path.join(adapterRoot, "README.zh-CN.md"),
    "utf8"
  );

  assert.match(english, /real.*Agent.*Runner\.run/i);
  assert.match(english, /does not benchmark an LLM/i);
  assert.match(
    english,
    /does not prove arbitrary OpenAI Agents SDK applications/
  );
  assert.match(chinese, /真实.*Agent.*Runner\.run/);
  assert.match(chinese, /不是 LLM Benchmark/);
  assert.match(chinese, /不能证明任意 OpenAI Agents SDK 应用都安全/);
  assert.match(english, /31980983499/);
  assert.match(chinese, /31980983499/);
  assert.match(english, /README\.zh-CN\.md/);
  assert.match(chinese, /\[English\]\(README\.md\)/);
});
