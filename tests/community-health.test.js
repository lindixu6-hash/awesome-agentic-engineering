import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);

function read(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), "utf8");
}

test("English and Chinese contribution guides expose reciprocal paths", () => {
  const english = read("CONTRIBUTING.md");
  const chinese = read("CONTRIBUTING.zh-CN.md");

  assert.match(english, /CONTRIBUTING\.zh-CN\.md/);
  assert.match(chinese, /\[English\]\(CONTRIBUTING\.md\)/);
  assert.match(english, /Agent Card adoption form/);
  assert.match(chinese, /Agent Card 采用表单/);
  assert.match(english, /runtime-adapter\.yml/);
  assert.match(chinese, /runtime-adapter\.yml/);
  assert.match(english, /issues\/16/);
  assert.match(chinese, /issues\/16/);
  assert.doesNotMatch(english, /issues\/14/);
  assert.doesNotMatch(chinese, /issues\/14/);
  assert.match(english, /English and Simplified Chinese/);
  assert.match(chinese, /中英文同步/);
  assert.match(english, /Do not infer production adoption/);
  assert.match(chinese, /不得根据 Star、CI 状态/);
  assert.match(english, /npm run validate:fixtures/);
  assert.match(chinese, /npm run validate:fixtures/);
});

test("bilingual READMEs route contributors to localized forms and guides", () => {
  const english = read("README.md");
  const chinese = read("README.zh-CN.md");

  assert.match(english, /agent-card-adoption\.yml/);
  assert.match(english, /runtime-adapter\.yml/);
  assert.match(english, /issues\/16/);
  assert.match(english, /CrewAI adapter with delegated-task trust boundaries/);
  assert.match(english, /\[CONTRIBUTING\.md\]\(CONTRIBUTING\.md\)/);
  assert.match(chinese, /agent-card-adoption\.yml/);
  assert.match(chinese, /runtime-adapter\.yml/);
  assert.match(chinese, /issues\/16/);
  assert.match(chinese, /带委派任务信任边界的 CrewAI 适配器/);
  assert.match(chinese, /CONTRIBUTING\.zh-CN\.md/);
});

test("Agent Card adoption form requires public failures and affiliation", () => {
  const form = read(
    ".github/ISSUE_TEMPLATE/agent-card-adoption.yml"
  );

  for (const id of [
    "repository",
    "workflow",
    "profile",
    "workflow_scope",
    "observed_result",
    "evidence",
    "limitations",
    "affiliation",
    "confirmation"
  ]) {
    assert.match(form, new RegExp(`id: ${id}`));
  }
  assert.match(form, /Agent Card adoption \/ Agent Card 采用/);
  assert.match(form, /I did not hide failing gates or launch blockers/);
  assert.match(form, /结构校验可以证明 Agent 安全/);
  assert.match(form, /required: true/g);
});

test("runtime adapter form requires real execution and evidence boundaries", () => {
  const form = read(".github/ISSUE_TEMPLATE/runtime-adapter.yml");

  for (const id of [
    "runtime",
    "repository",
    "license",
    "primitive",
    "offline",
    "trust_boundary",
    "evaluator",
    "artifacts",
    "dependency_isolation",
    "limitations",
    "safety"
  ]) {
    assert.match(form, new RegExp(`id: ${id}`));
  }
  assert.match(form, /Runtime adapter proposal \/ Runtime 适配器提案/);
  assert.match(form, /real orchestration primitive/i);
  assert.match(form, /negative regression will produce a visible fail/);
  assert.match(form, /No live secret, privileged token/);
  assert.match(form, /English and Simplified Chinese/);
});

test("issue configuration routes setup, evidence, and vulnerabilities", () => {
  const config = read(".github/ISSUE_TEMPLATE/config.yml");

  assert.match(config, /blank_issues_enabled: false/);
  assert.match(config, /quickstart\.zh-CN\.md/);
  assert.match(config, /awesome-agentic-engineering\/zh\/guide\//);
  assert.match(config, /security\/policy/);
  assert.match(config, /不要在公开 Issue 中披露可利用漏洞/);
});

test("pull request template keeps evidence, limitations, and bilingual claims", () => {
  const template = read(".github/pull_request_template.md");

  assert.match(template, /Agent Card adoption/);
  assert.match(template, /Runtime adapter/);
  assert.match(template, /Observed evidence is separated from interpretation/);
  assert.match(template, /Failing gates and launch blockers remain visible/);
  assert.match(template, /English and Simplified Chinese/);
  assert.match(template, /## Evidence/);
  assert.match(template, /## Limitations And Remaining Work/);
  assert.match(template, /## 中文摘要/);
});

test("governance triad keeps ownership, citation, and funding boundaries explicit", () => {
  const citation = read("CITATION.cff");
  const codeowners = read(".github/CODEOWNERS");
  const funding = read(".github/FUNDING.yml");
  const english = read("README.md");
  const chinese = read("README.zh-CN.md");

  assert.match(
    citation,
    /title: "Repository-Owned Agent Readiness Contract: Awesome Agentic Engineering"/
  );
  assert.match(citation, /repository-code: "https:\/\/github\.com\/lindixu6-hash\/awesome-agentic-engineering"/);
  assert.match(citation, /prompt injection/);
  assert.match(citation, /evidence provenance/);
  assert.match(citation, /fail-closed release gate/);
  assert.match(citation, /does\s+not certify production safety/);

  assert.match(codeowners, /^\* @lindixu6-hash$/m);
  assert.match(codeowners, /^\/\.github\/ @lindixu6-hash$/m);
  assert.match(codeowners, /does not\s+# bypass branch protection/);

  assert.match(funding, /^github:\s*\n\s+- lindixu6-hash$/m);
  assert.match(funding, /Funding never changes scoring, evidence, review, or inclusion decisions/);

  assert.match(english, /## Governance And Citation/);
  assert.match(english, /do not certify an Agent as production-safe/);
  assert.match(chinese, /## 治理与引用/);
  assert.match(chinese, /不代表 Agent 已通过生产安全认证/);
});
