import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  buildManifest,
  verifyManifest
} from "../scripts/eval-evidence-provenance.js";
import {
  parseFixtureJsonl
} from "../bin/validate-prompt-injection-fixtures.js";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);
const adapterDependency = path.join(
  projectRoot,
  "adapters/openai-agents/node_modules/@openai/agents/package.json"
);
const fixtures = parseFixtureJsonl(
  fs.readFileSync(
    path.join(projectRoot, "evals/prompt-injection/fixtures.jsonl"),
    "utf8"
  )
);
const metadata = {
  repository: "lindixu6-hash/awesome-agentic-engineering",
  commit_sha: "1111111111111111111111111111111111111111",
  ref: "refs/heads/main",
  workflow_ref:
    "lindixu6-hash/awesome-agentic-engineering/.github/workflows/provenance-eval.yml@refs/heads/main",
  workflow_sha: "1111111111111111111111111111111111111111"
};

async function loadAdapter(t) {
  if (!fs.existsSync(adapterDependency)) {
    t.skip(
      "run npm ci --prefix adapters/openai-agents to execute provenance tests"
    );
    return null;
  }
  return import("../adapters/openai-agents/run.js");
}

async function createEvidence(t, selectedFixtures = fixtures) {
  const adapter = await loadAdapter(t);
  if (!adapter) return null;
  const output = fs.mkdtempSync(path.join(os.tmpdir(), "eval-provenance-"));
  await adapter.runOpenAIAgentsSuite(
    selectedFixtures,
    output,
    "2026-08-17T00:00:00.000Z"
  );
  return output;
}

test("manifest binds trusted inputs, source identity, and complete evidence", async (t) => {
  const output = await createEvidence(t);
  if (!output) return;

  try {
    const manifest = buildManifest(
      output,
      projectRoot,
      metadata,
      "2026-08-17T00:00:00.000Z"
    );
    const verified = verifyManifest(output, projectRoot, metadata);

    assert.equal(manifest.trusted_inputs.length, 7);
    assert.deepEqual(
      manifest.trusted_inputs
        .filter((record) => record.path.endsWith("-policy.json"))
        .map((record) => record.path),
      ["evals/prompt-injection/approval-policy.json"]
    );
    assert.ok(
      manifest.trusted_inputs.some(
        (record) =>
          record.path ===
          "evals/prompt-injection/tool-permissions.json"
      )
    );
    assert.equal(manifest.evidence.length, 34);
    assert.deepEqual(manifest.results, {
      path: "results.jsonl",
      sha256: manifest.results.sha256,
      total: 8,
      passed: 8,
      failed: 0
    });
    assert.equal(verified.evidence_files, 34);
    assert.equal(verified.results.passed, 8);
  } finally {
    fs.rmSync(output, { recursive: true, force: true });
  }
});

test("verifier rejects a modified evidence file", async (t) => {
  const output = await createEvidence(t);
  if (!output) return;

  try {
    buildManifest(
      output,
      projectRoot,
      metadata,
      "2026-08-17T00:00:00.000Z"
    );
    fs.appendFileSync(
      path.join(
        output,
        "cases/pi-direct-issue-comment/response.json"
      ),
      "tampered\n",
      "utf8"
    );

    assert.throws(
      () => verifyManifest(output, projectRoot, metadata),
      /Evidence .* (?:size|sha256) mismatch/
    );
  } finally {
    fs.rmSync(output, { recursive: true, force: true });
  }
});

test("verifier rejects a different source commit identity", async (t) => {
  const output = await createEvidence(t);
  if (!output) return;

  try {
    buildManifest(
      output,
      projectRoot,
      metadata,
      "2026-08-17T00:00:00.000Z"
    );
    assert.throws(
      () =>
        verifyManifest(output, projectRoot, {
          ...metadata,
          commit_sha: "2222222222222222222222222222222222222222"
        }),
      /Source commit_sha mismatch/
    );
  } finally {
    fs.rmSync(output, { recursive: true, force: true });
  }
});

test("verifier preserves and rejects a failing Eval Result", async (t) => {
  const failingFixture = {
    ...fixtures[0],
    expected_outcome: "refuse"
  };
  const output = await createEvidence(t, [failingFixture]);
  if (!output) return;

  try {
    const manifest = buildManifest(
      output,
      projectRoot,
      metadata,
      "2026-08-17T00:00:00.000Z"
    );
    assert.equal(manifest.results.failed, 1);
    assert.throws(
      () => verifyManifest(output, projectRoot, metadata),
      /Evidence contains 1 failing Eval Result/
    );
  } finally {
    fs.rmSync(output, { recursive: true, force: true });
  }
});

test("bilingual provenance docs expose evidence and governance limits", () => {
  const english = fs.readFileSync(
    path.join(projectRoot, "docs/evidence-provenance.md"),
    "utf8"
  );
  const chinese = fs.readFileSync(
    path.join(projectRoot, "docs/evidence-provenance.zh-CN.md"),
    "utf8"
  );

  for (const document of [english, chinese]) {
    assert.match(document, /31981738763/);
    assert.match(
      document,
      /81671c0e9589e65413e13b7ca7a19d3453166ae783cb5ae3feb4b46565256521/
    );
    assert.match(document, /34b12355a27a647adfb5b09578234a19ee076f0f/);
    assert.match(document, /8d4b435f66f58a570b65dd8b4952bf7e1e2dd62f/);
  }
  assert.match(english, /main.*was not protected/is);
  assert.match(english, /not a SLSA level claim/i);
  assert.match(chinese, /main.*没有 Branch Protection/is);
  assert.match(chinese, /不是 SLSA 等级声明/);
  assert.match(english, /evidence-provenance\.zh-CN\.md/);
  assert.match(chinese, /\[English\]\(evidence-provenance\.md\)/);
});
