import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);
const adapterRoot = path.join(projectRoot, "adapters", "crewai");

test("CrewAI adapter pins an isolated Python runtime and lockfile", () => {
  const pyproject = fs.readFileSync(
    path.join(adapterRoot, "pyproject.toml"),
    "utf8"
  );
  const lock = fs.readFileSync(path.join(adapterRoot, "uv.lock"), "utf8");
  const rootPackage = JSON.parse(
    fs.readFileSync(path.join(projectRoot, "package.json"), "utf8")
  );

  assert.match(pyproject, /requires-python = ">=3\.12,<3\.13"/);
  assert.match(pyproject, /"crewai==1\.15\.16"/);
  assert.match(pyproject, /"pytest==8\.4\.2"/);
  assert.match(lock, /requires-python = "==3\.12\.\*"/);
  assert.match(lock, /name = "crewai"\nversion = "1\.15\.16"/);
  assert.equal(rootPackage.dependencies, undefined);
  for (const file of [
    "adapters/crewai/pyproject.toml",
    "adapters/crewai/uv.lock",
    "adapters/crewai/run.py",
    "adapters/crewai/README.md",
    "adapters/crewai/README.zh-CN.md"
  ]) {
    assert.equal(rootPackage.files.includes(file), true, `${file} must be packed`);
  }
});

test("CrewAI runner declares real delegation and fail-closed network boundaries", () => {
  const runner = fs.readFileSync(path.join(adapterRoot, "run.py"), "utf8");

  assert.match(runner, /from crewai import Agent, Crew, Process, Task/);
  assert.match(runner, /context=\[intake_task\]/);
  assert.match(runner, /result = crew\.kickoff\(\)/);
  assert.match(runner, /class ReadOnlyEvidenceTool\(BaseTool\)/);
  assert.match(runner, /socket\.create_connection = blocked_create_connection/);
  assert.match(runner, /socket\.socket\.connect = blocked_connect/);
  assert.match(runner, /"network_attempts": network_attempts/);
  assert.match(runner, /def evaluate_crewai_run/);
  assert.doesNotMatch(runner, /expected_outcome.*DeterministicCrewAILLM/);
});

test("bilingual CrewAI docs state evidence and dependency limits", () => {
  const english = fs.readFileSync(path.join(adapterRoot, "README.md"), "utf8");
  const chinese = fs.readFileSync(
    path.join(adapterRoot, "README.zh-CN.md"),
    "utf8"
  );

  assert.match(english, /real `Agent`, `Task\.context`, and `Crew\.kickoff\(\)`/);
  assert.match(english, /not an LLM benchmark/i);
  assert.match(english, /does not prove arbitrary CrewAI applications are secure/);
  assert.match(english, /resolves 141 packages/);
  assert.match(chinese, /真实的 `Agent`、\s*`Task\.context` 与 `Crew\.kickoff\(\)`/);
  assert.match(chinese, /不是 LLM Benchmark/);
  assert.match(chinese, /不能证明任意 CrewAI 应用都安全/);
  assert.match(chinese, /141 个包/);
  assert.match(english, /README\.zh-CN\.md/);
  assert.match(chinese, /\[English\]\(README\.md\)/);
});
