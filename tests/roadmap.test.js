import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);
const roadmap = fs.readFileSync(path.join(projectRoot, "ROADMAP.md"), "utf8");
const readme = fs.readFileSync(path.join(projectRoot, "README.md"), "utf8");
const chineseReadme = fs.readFileSync(
  path.join(projectRoot, "README.zh-CN.md"),
  "utf8"
);

test("roadmap marks shipped versions through v0.18.3 as completed", () => {
  for (const version of [
    "v0.1",
    "v0.2",
    "v0.3",
    "v0.4",
    "v0.5",
    "v0.6",
    "v0.7",
    "v0.8",
    "v0.9",
    "v0.10",
    "v0.11",
    "v0.12",
    "v0.13",
    "v0.14",
    "v0.15",
    "v0.16",
    "v0.17",
    "v0.18",
    "v0.18.1",
    "v0.18.2",
    "v0.18.3"
  ]) {
    assert.match(roadmap, new RegExp(`### ${version.replace(".", "\\.")}`));
  }
  assert.doesNotMatch(roadmap, /- \[ \]/);
});

test("completed eval result contract is no longer listed as future work", () => {
  const currentRoadmap = roadmap.split("## Current Priorities")[1] || "";
  const futureEnglish = readme.split("## Roadmap")[1] || "";
  const futureChinese = chineseReadme.split("## 后续路线")[1] || "";

  assert.doesNotMatch(currentRoadmap, /issues\/11/);
  assert.doesNotMatch(futureEnglish, /issues\/11/);
  assert.doesNotMatch(futureChinese, /issues\/11/);
});

test("completed risk profiles are no longer listed as future work", () => {
  const currentRoadmap = roadmap.split("## Current Priorities")[1] || "";
  const futureEnglish = readme.split("## Roadmap")[1] || "";
  const futureChinese = chineseReadme.split("## 后续路线")[1] || "";

  assert.doesNotMatch(currentRoadmap, /issues\/12/);
  assert.doesNotMatch(futureEnglish, /issues\/12/);
  assert.doesNotMatch(futureChinese, /issues\/12/);
});

test("completed product surfaces are not listed as future README work", () => {
  const futureEnglish = readme.split("## Roadmap")[1] || "";
  const futureChinese = chineseReadme.split("## 后续路线")[1] || "";

  assert.doesNotMatch(futureEnglish, /Add a web scorecard playground/);
  assert.doesNotMatch(futureEnglish, /Add production-readiness badges/);
  assert.doesNotMatch(futureChinese, /增加网页评分器/);
  assert.doesNotMatch(futureChinese, /增加生产就绪 badge/);
});

test("completed second runtime is no longer listed as future work", () => {
  const currentRoadmap = roadmap.split("## Current Priorities")[1] || "";
  const futureEnglish = readme.split("## Roadmap")[1] || "";
  const futureChinese = chineseReadme.split("## 后续路线")[1] || "";

  assert.doesNotMatch(currentRoadmap, /issues\/14/);
  assert.doesNotMatch(futureEnglish, /issues\/14/);
  assert.doesNotMatch(futureChinese, /issues\/14/);
  assert.match(roadmap, /### v0\.13: OpenAI Agents SDK runtime adapter/);
});
