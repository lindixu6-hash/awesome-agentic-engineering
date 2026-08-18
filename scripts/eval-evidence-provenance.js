#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  parseEvalResults,
  validateFixtureReferences
} from "../bin/validate-eval-results.js";
import {
  parseFixtureJsonl
} from "../bin/validate-prompt-injection-fixtures.js";

export const MANIFEST_NAME = "provenance-manifest.json";
export const TRUSTED_INPUTS = [
  "adapters/openai-agents/package-lock.json",
  "adapters/openai-agents/run.js",
  "bin/validate-eval-results.js",
  "evals/prompt-injection/approval-policy.json",
  "evals/prompt-injection/fixtures.jsonl",
  "evals/prompt-injection/tool-permissions.json",
  "schema/eval-result.schema.json"
];

function requiredString(value, name) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${name} must be a non-empty string.`);
  }
  return value;
}

export function sha256File(filePath) {
  const hash = crypto.createHash("sha256");
  hash.update(fs.readFileSync(filePath));
  return hash.digest("hex");
}

function relativeFiles(directory, prefix = "") {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const relativePath = path.posix.join(prefix, entry.name);
    const filePath = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) {
      throw new Error(`Symbolic links are not allowed: ${relativePath}`);
    }
    if (entry.isDirectory()) {
      files.push(...relativeFiles(filePath, relativePath));
      continue;
    }
    if (!entry.isFile()) {
      throw new Error(`Unsupported evidence entry: ${relativePath}`);
    }
    files.push(relativePath);
  }
  return files.sort();
}

function fileRecord(root, relativePath) {
  const filePath = path.join(root, relativePath);
  return {
    path: relativePath,
    size: fs.statSync(filePath).size,
    sha256: sha256File(filePath)
  };
}

function validateMetadata(metadata) {
  return {
    repository: requiredString(metadata.repository, "repository"),
    commit_sha: requiredString(metadata.commit_sha, "commit_sha"),
    ref: requiredString(metadata.ref, "ref"),
    workflow_ref: requiredString(metadata.workflow_ref, "workflow_ref"),
    workflow_sha: requiredString(metadata.workflow_sha, "workflow_sha")
  };
}

function resultSummary(results) {
  return {
    total: results.length,
    passed: results.filter((result) => result.outcome === "pass").length,
    failed: results.filter((result) => result.outcome === "fail").length
  };
}

export function buildManifest(
  evidenceDirectory,
  projectRoot,
  metadata,
  timestamp
) {
  const source = validateMetadata(metadata);
  const fixtures = parseFixtureJsonl(
    fs.readFileSync(
      path.join(projectRoot, "evals/prompt-injection/fixtures.jsonl"),
      "utf8"
    )
  );
  const results = parseEvalResults(
    fs.readFileSync(path.join(evidenceDirectory, "results.jsonl"), "utf8")
  );
  validateFixtureReferences(results, fixtures);

  const evidenceFiles = relativeFiles(evidenceDirectory).filter(
    (relativePath) => relativePath !== MANIFEST_NAME
  );
  const manifest = {
    schema_version: "1.0",
    generated_at: requiredString(timestamp, "timestamp"),
    claim:
      "A trusted verifier observed these exact files from this repository, commit, ref, and workflow identity.",
    source,
    trusted_inputs: TRUSTED_INPUTS.map((relativePath) =>
      fileRecord(projectRoot, relativePath)
    ),
    evidence: evidenceFiles.map((relativePath) =>
      fileRecord(evidenceDirectory, relativePath)
    ),
    results: {
      path: "results.jsonl",
      sha256: sha256File(path.join(evidenceDirectory, "results.jsonl")),
      ...resultSummary(results)
    }
  };
  fs.writeFileSync(
    path.join(evidenceDirectory, MANIFEST_NAME),
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8"
  );
  return manifest;
}

function equalRecords(actual, expected, label) {
  if (actual.length !== expected.length) {
    throw new Error(
      `${label} file count mismatch: ${actual.length} != ${expected.length}.`
    );
  }
  for (let index = 0; index < expected.length; index += 1) {
    const actualRecord = actual[index];
    const expectedRecord = expected[index];
    for (const field of ["path", "size", "sha256"]) {
      if (actualRecord[field] !== expectedRecord[field]) {
        throw new Error(
          `${label} ${expectedRecord.path || index} ${field} mismatch.`
        );
      }
    }
  }
}

function assertSource(actual, expected) {
  const normalized = validateMetadata(expected);
  for (const [field, value] of Object.entries(normalized)) {
    if (actual?.[field] !== value) {
      throw new Error(
        `Source ${field} mismatch: ${actual?.[field] || "missing"} != ${value}.`
      );
    }
  }
}

export function verifyManifest(evidenceDirectory, trustedRoot, expectedSource) {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(evidenceDirectory, MANIFEST_NAME), "utf8")
  );
  if (manifest.schema_version !== "1.0") {
    throw new Error(`Unsupported manifest schema: ${manifest.schema_version}.`);
  }
  assertSource(manifest.source, expectedSource);

  const expectedTrustedInputs = TRUSTED_INPUTS.map((relativePath) =>
    fileRecord(trustedRoot, relativePath)
  );
  equalRecords(
    manifest.trusted_inputs || [],
    expectedTrustedInputs,
    "Trusted input"
  );

  const evidenceFiles = relativeFiles(evidenceDirectory).filter(
    (relativePath) => relativePath !== MANIFEST_NAME
  );
  const expectedEvidence = evidenceFiles.map((relativePath) =>
    fileRecord(evidenceDirectory, relativePath)
  );
  equalRecords(manifest.evidence || [], expectedEvidence, "Evidence");

  const fixtures = parseFixtureJsonl(
    fs.readFileSync(
      path.join(trustedRoot, "evals/prompt-injection/fixtures.jsonl"),
      "utf8"
    )
  );
  const resultsPath = path.join(evidenceDirectory, "results.jsonl");
  const results = parseEvalResults(fs.readFileSync(resultsPath, "utf8"));
  validateFixtureReferences(results, fixtures);
  const expectedResults = {
    path: "results.jsonl",
    sha256: sha256File(resultsPath),
    ...resultSummary(results)
  };
  for (const [field, value] of Object.entries(expectedResults)) {
    if (manifest.results?.[field] !== value) {
      throw new Error(`Result ${field} mismatch.`);
    }
  }
  if (expectedResults.failed > 0) {
    throw new Error(
      `Evidence contains ${expectedResults.failed} failing Eval Result(s).`
    );
  }
  return {
    source: manifest.source,
    evidence_files: expectedEvidence.length,
    results: expectedResults
  };
}

function metadataFromEnvironment(env) {
  return {
    repository: env.PROVENANCE_REPOSITORY,
    commit_sha: env.PROVENANCE_COMMIT_SHA,
    ref: env.PROVENANCE_REF,
    workflow_ref: env.PROVENANCE_WORKFLOW_REF,
    workflow_sha: env.PROVENANCE_WORKFLOW_SHA
  };
}

function usage() {
  return [
    "Usage:",
    "  node scripts/eval-evidence-provenance.js build <evidence-directory> <project-root>",
    "  node scripts/eval-evidence-provenance.js verify <evidence-directory> <trusted-root>",
    "",
    "Required environment:",
    "  PROVENANCE_REPOSITORY, PROVENANCE_COMMIT_SHA, PROVENANCE_REF,",
    "  PROVENANCE_WORKFLOW_REF, PROVENANCE_WORKFLOW_SHA",
    "",
    "Build also accepts SOURCE_DATE_EPOCH for a reproducible timestamp."
  ].join("\n");
}

export function main(argv = process.argv, env = process.env) {
  if (
    argv.includes("-h") ||
    argv.includes("--help") ||
    argv.length !== 5 ||
    !["build", "verify"].includes(argv[2])
  ) {
    console.log(usage());
    return argv.includes("-h") || argv.includes("--help") ? 0 : 1;
  }
  const command = argv[2];
  const targetDirectory = path.resolve(argv[3]);
  const root = path.resolve(argv[4]);
  const metadata = metadataFromEnvironment(env);

  if (command === "build") {
    const epoch = Number(env.SOURCE_DATE_EPOCH);
    const timestamp =
      Number.isFinite(epoch) && epoch > 0
        ? new Date(epoch * 1000).toISOString()
        : new Date().toISOString();
    const manifest = buildManifest(
      targetDirectory,
      root,
      metadata,
      timestamp
    );
    console.log(
      `Built ${MANIFEST_NAME}: ${manifest.evidence.length} evidence file(s), ` +
        `${manifest.results.passed}/${manifest.results.total} pass.`
    );
    return 0;
  }

  const verified = verifyManifest(targetDirectory, root, metadata);
  console.log(
    `Verified ${verified.evidence_files} evidence file(s): ` +
      `${verified.results.passed}/${verified.results.total} pass.`
  );
  return 0;
}

const isCli =
  process.argv[1] &&
  fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);

if (isCli) {
  try {
    process.exitCode = main();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exitCode = 1;
  }
}
