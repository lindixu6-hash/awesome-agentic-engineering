import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);
const packageJson = JSON.parse(
  fs.readFileSync(path.join(projectRoot, "package.json"), "utf8")
);

test("package metadata points to canonical public project surfaces", () => {
  assert.equal(packageJson.version, "0.18.2");
  assert.equal(
    packageJson.repository.url,
    "git+https://github.com/lindixu6-hash/awesome-agentic-engineering.git"
  );
  assert.equal(
    packageJson.homepage,
    "https://lindixu6-hash.github.io/awesome-agentic-engineering/"
  );
  assert.equal(
    packageJson.bugs.url,
    "https://github.com/lindixu6-hash/awesome-agentic-engineering/issues"
  );
  assert.equal(
    packageJson.funding,
    "https://github.com/sponsors/lindixu6-hash"
  );
  assert.equal(packageJson.publishConfig.access, "public");
});

test("npm tarball includes public contracts and excludes local evidence", () => {
  const output = execFileSync(
    "npm",
    ["pack", "--dry-run", "--json", "--ignore-scripts"],
    {
      cwd: projectRoot,
      encoding: "utf8"
    }
  );
  const [pack] = JSON.parse(output);
  const files = new Set(pack.files.map((file) => file.path));

  for (const requiredPath of [
    "CITATION.cff",
    "LICENSE",
    "README.md",
    "README.zh-CN.md",
    "ROADMAP.md",
    "SECURITY.md",
    "action.yml",
    "bin/agentic-init.js",
    "profiles/readiness-profiles.json",
    "schema/agent-card.schema.json"
  ]) {
    assert.equal(files.has(requiredPath), true, `${requiredPath} must be packed`);
  }

  for (const filePath of files) {
    assert.doesNotMatch(filePath, /^\.evidence\//);
    assert.doesNotMatch(filePath, /^\.github\//);
    assert.doesNotMatch(filePath, /^tests\//);
    assert.doesNotMatch(filePath, /^artifacts\//);
  }
});
