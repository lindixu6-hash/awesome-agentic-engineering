import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);
const uploadArtifactSha = "043fb46d1a93c77aae656e7c1c64a875d1fc6a0a";

function readWorkflow(name) {
  return fs.readFileSync(
    path.join(projectRoot, ".github", "workflows", name),
    "utf8"
  );
}

test("Star Watch preserves its hidden JSON snapshot in the artifact", () => {
  const workflow = readWorkflow("star-watch.yml");

  assert.match(
    workflow,
    new RegExp(`uses: actions/upload-artifact@${uploadArtifactSha}`)
  );
  assert.match(workflow, /include-hidden-files: true/);
  assert.match(workflow, /path: \|\n\s+\.star-watch\.json\n\s+star-watch\.txt/);
});

test("Star Watch keeps the scheduled 1000-star monitor enabled", () => {
  const workflow = readWorkflow("star-watch.yml");

  assert.match(workflow, /cron: "17 1 \* \* \*"/);
  assert.match(workflow, /workflow_dispatch:/);
  assert.match(workflow, /--target 1000/);
});

test("Action manifest exposes independent score and blocker gates", () => {
  const manifest = fs.readFileSync(path.join(projectRoot, "action.yml"), "utf8");

  assert.match(manifest, /fail-below:/);
  assert.match(manifest, /fail-on-blockers:/);
  assert.match(manifest, /profile:/);
  assert.match(manifest, /default: "false"/);
  assert.match(manifest, /blocker-count:/);
  assert.match(manifest, /blockers:/);
  assert.match(manifest, /passed:/);
  assert.match(manifest, /profile-passed:/);
});

test("CI validates local and published eval result contracts", () => {
  const workflow = readWorkflow("ci.yml");

  assert.match(workflow, /npm run validate:results/);
  assert.match(workflow, /agentic-validate-results/);
  assert.match(workflow, /--fixtures evals\/prompt-injection\/fixtures\.jsonl/);
});

test("CI parses every community YAML form", () => {
  const workflow = readWorkflow("ci.yml");

  assert.match(workflow, /name: Validate community YAML/);
  assert.match(workflow, /require "yaml"/);
  assert.match(workflow, /ISSUE_TEMPLATE\/\*\.\{yml,yaml\}/);
  assert.match(workflow, /\.github\/dependabot\.yml/);
  assert.match(workflow, /YAML\.safe_load/);
});

test("every third-party workflow action is pinned to a full commit SHA", () => {
  const workflowDirectory = path.join(projectRoot, ".github", "workflows");
  const workflowFiles = fs
    .readdirSync(workflowDirectory)
    .filter((name) => /\.ya?ml$/.test(name));

  for (const name of workflowFiles) {
    const workflow = readWorkflow(name);
    for (const match of workflow.matchAll(
      /^\s*(?:-\s*)?uses:\s*([^\s#]+)/gm
    )) {
      const target = match[1];
      if (target.startsWith("./")) continue;

      const separator = target.lastIndexOf("@");
      assert.notEqual(separator, -1, `${name}: missing action ref: ${target}`);
      const action = target.slice(0, separator);
      const ref = target.slice(separator + 1);

      if (action.startsWith("lindixu6-hash/awesome-agentic-engineering")) {
        assert.match(
          ref,
          /^(?:v0|[0-9a-f]{40})$/,
          `${name}: unexpected self-reference: ${target}`
        );
        continue;
      }

      assert.match(
        ref,
        /^[0-9a-f]{40}$/,
        `${name}: third-party action must use a full commit SHA: ${target}`
      );
    }
  }
});

test("Dependabot maintains pinned GitHub Actions references", () => {
  const config = fs.readFileSync(
    path.join(projectRoot, ".github", "dependabot.yml"),
    "utf8"
  );

  assert.match(config, /package-ecosystem: github-actions/);
  assert.match(config, /directory: "\/"/);
  assert.match(config, /interval: weekly/);
  assert.match(config, /open-pull-requests-limit: 5/);
  assert.match(
    config,
    /dependency-name: actions\/checkout[\s\S]*version-update:semver-major/
  );
  assert.match(
    config,
    /dependency-name: actions\/setup-node[\s\S]*version-update:semver-major/
  );
});

test("CI verifies generated starters fail closed", () => {
  const workflow = readWorkflow("ci.yml");

  assert.match(workflow, /bin\/agentic-init\.js/);
  assert.match(workflow, /card: \.tmp-init\/agent-card\.json/);
  assert.match(workflow, /id: starter-gate/);
  assert.match(workflow, /test "\$STEP_OUTCOME" = "failure"/);
  assert.match(workflow, /test "\$SCORE" = "0"/);
  assert.match(workflow, /test "\$PROFILE_PASSED" = "false"/);
  assert.match(workflow, /test "\$BLOCKER_COUNT" = "1"/);
});

test("CI smoke tests the published v0 initializer", () => {
  const workflow = readWorkflow("ci.yml");

  assert.match(workflow, /name: Test published v0 initializer/);
  assert.match(workflow, /agentic-init/);
  assert.match(
    workflow,
    /--package=github:lindixu6-hash\/awesome-agentic-engineering#v0/
  );
  assert.match(workflow, /card\.risk_profile !== "read-only"/);
  assert.match(workflow, /card\.launch_blockers\.length !== 1/);
});

test("CI exercises the local risk-profile gate", () => {
  const workflow = readWorkflow("ci.yml");

  assert.match(workflow, /card: examples\/read-only-agent\.card\.json/);
  assert.match(workflow, /profile: "read-only"/);
});

test("CI verifies the published v0 risk-profile outputs", () => {
  const workflow = readWorkflow("ci.yml");

  assert.match(
    workflow,
    /uses: lindixu6-hash\/awesome-agentic-engineering@v0/
  );
  assert.match(workflow, /PROFILE_NAME:/);
  assert.match(workflow, /PROFILE_PASSED:/);
  assert.match(workflow, /test "\$PROFILE_NAME" = "read-only"/);
  assert.match(workflow, /test "\$PROFILE_PASSED" = "true"/);
});

test("CI executes and retains provenance-aware reference eval results", () => {
  const workflow = readWorkflow("ci.yml");

  assert.match(workflow, /npm run eval:reference/);
  assert.match(
    workflow,
    /agentic-validate-results artifacts\/reference-eval\/results\.jsonl/
  );
  assert.match(
    workflow,
    new RegExp(`uses: actions/upload-artifact@${uploadArtifactSha}`)
  );
  assert.match(workflow, /name: reference-eval-evidence/);
  assert.match(workflow, /path: artifacts\/reference-eval/);
});

test("CI installs LangGraph and retains external-runtime eval evidence", () => {
  const workflow = readWorkflow("ci.yml");

  assert.match(workflow, /npm run install:langgraph/);
  assert.match(workflow, /npm run eval:langgraph/);
  assert.match(
    workflow,
    /agentic-validate-results artifacts\/langgraph-eval\/results\.jsonl/
  );
  assert.match(workflow, /name: langgraph-eval-evidence/);
  assert.match(workflow, /path: artifacts\/langgraph-eval/);
});

test("CI installs OpenAI Agents and retains offline Runner evidence", () => {
  const workflow = readWorkflow("ci.yml");

  assert.match(workflow, /npm run install:openai-agents/);
  assert.match(workflow, /npm run eval:openai-agents/);
  assert.match(
    workflow,
    /agentic-validate-results \\\n\s+artifacts\/openai-agents-eval\/results\.jsonl/
  );
  assert.match(
    workflow,
    new RegExp(`uses: actions/upload-artifact@${uploadArtifactSha}`)
  );
  assert.match(workflow, /name: openai-agents-eval-evidence/);
  assert.match(workflow, /path: artifacts\/openai-agents-eval/);
});

test("CI runs and retains the isolated CrewAI delegation evidence", () => {
  const workflow = readWorkflow("ci.yml");

  assert.match(
    workflow,
    /actions\/setup-python@ece7cb06caefa5fff74198d8649806c4678c61a1/
  );
  assert.match(
    workflow,
    /astral-sh\/setup-uv@37802adc94f370d6bfd71619e3f0bf239e1f3b78/
  );
  assert.match(workflow, /python-version: "3\.12"/);
  assert.match(workflow, /version: "0\.11\.33"/);
  assert.match(workflow, /LIBUUID_CLOCK_FILE:/);
  assert.match(workflow, /npm run install:crewai/);
  assert.match(workflow, /npm run test:crewai/);
  assert.match(workflow, /npm run eval:crewai/);
  assert.match(
    workflow,
    /agentic-validate-results \\\n\s+artifacts\/crewai-eval\/results\.jsonl/
  );
  assert.match(workflow, /name: crewai-eval-evidence/);
  assert.match(workflow, /path: artifacts\/crewai-eval/);
});

test("reusable verifier pins code, actions, identity, and negative checks", () => {
  const workflow = readWorkflow("verify-eval-evidence.yml");

  assert.match(workflow, /workflow_call:/);
  assert.match(
    workflow,
    /ref: 8efe0c970b1d37e72cac6cc73f96d6e3066309b7/
  );
  assert.match(
    workflow,
    /actions\/checkout@fbc6f3992d24b796d5a048ff273f7fcc4a7b6c09/
  );
  assert.match(
    workflow,
    /actions\/download-artifact@3e5f45b2cfb9172054b4087a40e8e0b5a5461e7c/
  );
  assert.match(
    workflow,
    /actions\/upload-artifact@043fb46d1a93c77aae656e7c1c64a875d1fc6a0a/
  );
  assert.match(workflow, /--signer-workflow/);
  assert.match(workflow, /--signer-digest "\$GITHUB_SHA"/);
  assert.match(workflow, /--source-digest "\$GITHUB_SHA"/);
  assert.match(workflow, /--source-ref "\$GITHUB_REF"/);
  assert.match(workflow, /--deny-self-hosted-runners/);
  assert.match(workflow, /Tampered bundle unexpectedly verified/);
  assert.match(workflow, /Wrong source digest unexpectedly verified/);
  assert.match(workflow, /Wrong workflow identity unexpectedly verified/);
  assert.match(workflow, /Older valid attestation unexpectedly replayed/);
  assert.match(workflow, /gh release download v0\.14\.0/);
  assert.match(
    workflow,
    /81671c0e9589e65413e13b7ca7a19d3453166ae783cb5ae3feb4b46565256521/
  );
  assert.match(workflow, /eval-evidence-provenance\.js/);
  assert.doesNotMatch(workflow, /uses: [^\n]+@v\d/);
});

test("producer attests one bundle before calling immutable verifier", () => {
  const workflow = readWorkflow("provenance-eval.yml");

  assert.match(workflow, /github\.ref == 'refs\/heads\/main'/);
  assert.match(workflow, /attestations: write/);
  assert.match(workflow, /id-token: write/);
  assert.match(workflow, /eval-evidence-provenance\.js \\\n\s+build/);
  assert.match(
    workflow,
    /awesome-agentic-engineering#ceaaaa58373c5603b4a28d3d650787a2117e533b/
  );
  assert.match(workflow, /--sort=name/);
  assert.match(workflow, /openai-agents-evidence\.tar\.gz/);
  assert.match(
    workflow,
    /evals\/prompt-injection\/tool-permissions\.json/
  );
  assert.match(
    workflow,
    /evals\/prompt-injection\/approval-policy\.json/
  );
  assert.match(
    workflow,
    /actions\/attest@1e69f48acb82d1966a394da916b4c1698aa569d6/
  );
  assert.match(workflow, /needs: produce/);
  assert.match(
    workflow,
    /verify-eval-evidence\.yml@250bebc26eaaa3b027058ee3d68c3e1776aec668/
  );
  assert.doesNotMatch(workflow, /uses: [^\n]+@v\d/);
});

test("release workflow builds and attests the exact package contract", () => {
  const workflow = readWorkflow("release-artifacts.yml");

  assert.match(workflow, /tags:\n\s+- "v\*\.\*\.\*"/);
  assert.doesNotMatch(workflow, /tags:\n\s+- "v\*"\s*$/m);
  assert.match(workflow, /persist-credentials: false/);
  assert.match(workflow, /expected_ref="refs\/tags\/v\$\{package_version\}"/);
  assert.match(workflow, /npm test/);
  assert.match(workflow, /name: Build verified CrewAI evidence/);
  assert.match(workflow, /npm run install:crewai/);
  assert.match(workflow, /npm run test:crewai/);
  assert.match(workflow, /npm run eval:crewai/);
  assert.match(workflow, /crewai-eval\/results\.jsonl/);
  assert.match(workflow, /find artifacts\/crewai-eval\/cases/);
  assert.match(
    workflow,
    /jq -s '\[\.\[\]\.network_attempts \| length\] \| add'/
  );
  assert.match(workflow, /crewai-eval-evidence\.tar\.gz/);
  assert.match(workflow, /--sort=name/);
  assert.match(workflow, /--mtime="@1786924800"/);
  assert.match(workflow, /npm pack --ignore-scripts --pack-destination release/);
  assert.match(workflow, /npm sbom --sbom-format=cyclonedx/);
  assert.match(workflow, /cd release/);
  assert.match(
    workflow,
    /sha256sum \.\/\*\.tgz \.\/\*\.tar\.gz \.\/\*\.json > SHA256SUMS/
  );
  assert.match(workflow, /sha256sum --check SHA256SUMS/);
  assert.match(workflow, /attestations: write/);
  assert.match(workflow, /id-token: write/);
  assert.match(
    workflow,
    /build:[\s\S]*permissions:[\s\S]*contents: read[\s\S]*publish:/
  );
  assert.match(
    workflow,
    /publish:\n\s+if: github\.event_name == 'push'[\s\S]*permissions:[\s\S]*contents: write/
  );
  assert.match(
    workflow,
    /actions\/attest@1e69f48acb82d1966a394da916b4c1698aa569d6/
  );
  assert.match(
    workflow,
    /actions\/upload-artifact@043fb46d1a93c77aae656e7c1c64a875d1fc6a0a/
  );
  assert.match(workflow, /retention-days: 90/);
  assert.match(workflow, /name: Publish durable release assets/);
  assert.match(workflow, /name: Verify durable release download/);
  assert.match(
    workflow,
    /if: github\.event_name == 'push'[\s\S]*gh release upload "\$GITHUB_REF_NAME"/
  );
  assert.match(workflow, /gh release download "\$GITHUB_REF_NAME"/);
  assert.match(workflow, /cmp "\$source" "release-download\/\$file"/);
  assert.doesNotMatch(
    workflow,
    /if: github\.event_name == 'workflow_dispatch'[\s\S]*gh release upload/
  );
  assert.doesNotMatch(workflow, /npm publish/);
});
