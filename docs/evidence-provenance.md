# Attested Eval Evidence Provenance

[English](evidence-provenance.md) | [简体中文](evidence-provenance.zh-CN.md)

The OpenAI Agents SDK eval has a separate producer and verifier path. The
producer executes the runtime and signs one deterministic bundle. A reusable
workflow pinned by commit SHA downloads that bundle, verifies its GitHub
artifact attestation, safely extracts it, and evaluates its source-bound
manifest with an older immutable verifier.

Public evidence:

- [Attested producer/verifier run](https://github.com/lindixu6-hash/awesome-agentic-engineering/actions/runs/32091866197)
- Producer bundle artifact: `openai-agents-provenance-bundle`
- Verifier artifact: `openai-agents-verification-evidence`
- Bundle SHA-256:
  `16baef5ae191903b1d04c1b279ce8673578a74e592af2ddc66466bf2f5f71a76`

## Trust Layout

```text
producer commit dc540f7
  ├─ runs @openai/agents@0.16.1 against 8 fixtures
  ├─ loads fail-closed tool-permission and approval-policy manifests
  ├─ creates 34 evidence files + provenance-manifest.json
  ├─ creates deterministic openai-agents-evidence.tar.gz
  ├─ signs the bundle with GitHub OIDC + Sigstore
  └─ uploads one producer artifact
                  │
                  ▼
reusable verifier pinned to commit 250bebc
  ├─ checks out verifier code pinned to commit 8efe0c9
  ├─ downloads exactly one expected bundle
  ├─ verifies signer workflow, signer SHA, source SHA/ref, and hosted runner
  ├─ proves tamper, wrong source, wrong workflow, and replay all fail
  ├─ rejects unsafe archive paths
  ├─ verifies every file hash and seven trusted-input hashes
  ├─ validates all Eval Results and rejects any fail result
  └─ uploads verification evidence
```

The producer cannot replace verifier code during this run. The caller uses:

```yaml
uses: lindixu6-hash/awesome-agentic-engineering/.github/workflows/verify-eval-evidence.yml@250bebc26eaaa3b027058ee3d68c3e1776aec668
```

That reusable workflow checks out the manifest verifier from:

```text
8efe0c970b1d37e72cac6cc73f96d6e3066309b7
```

All external Actions in both workflows are also pinned to full commit SHAs.

## Bound Values

`provenance-manifest.json` binds:

- repository, commit SHA, Git ref, workflow ref, and workflow SHA;
- the exact OpenAI Agents lockfile and adapter source;
- the fail-closed tool-permission and approval-policy manifests;
- the fixture pack;
- the Eval Result validator and JSON Schema;
- every response, assertion, tool trace, policy trace, result, and summary
  file;
- total, passing, and failing result counts.

The published manifest records seven trusted inputs, 34 evidence files, and
8/8 passing results. The authority-policy SHA-256 digests also appear in the
runtime policy trace and each executed tool trace. The manifest does not
discard or rewrite failures: the verifier rejects a manifest that contains
any failing Eval Result.

## Attestation Verification

The verifier enforces:

```bash
gh attestation verify openai-agents-evidence.tar.gz \
  --repo lindixu6-hash/awesome-agentic-engineering \
  --signer-workflow \
    github.com/lindixu6-hash/awesome-agentic-engineering/.github/workflows/provenance-eval.yml \
  --signer-digest dc540f763ca7efdf3239b2c55a7db0d5ea88a532 \
  --source-digest dc540f763ca7efdf3239b2c55a7db0d5ea88a532 \
  --source-ref refs/heads/main \
  --deny-self-hosted-runners
```

The verified certificate and transparency-log record bind:

- the `Attested OpenAI Agents Eval` workflow path;
- commit and workflow digest
  `dc540f763ca7efdf3239b2c55a7db0d5ea88a532`;
- `refs/heads/main`;
- a GitHub-hosted runner;
- the public repository identity;
- workflow run `32091866197`;
- the bundle digest above;
- a Rekor transparency-log timestamp.

## Negative Evidence

The reusable verifier must observe all four failures:

1. append one byte to the signed bundle and confirm attestation verification
   fails;
2. verify the original bundle against an all-zero source digest and confirm
   identity verification fails;
3. verify against a different signer workflow path and confirm workflow
   identity verification fails;
4. first validate the preserved
   [v0.14.0 signed bundle](https://github.com/lindixu6-hash/awesome-agentic-engineering/releases/download/v0.14.0/openai-agents-evidence.tar.gz)
   against its original commit, then confirm it cannot satisfy the current
   source digest.

Local tests also reject:

- any changed evidence file;
- a mismatched source commit;
- a suite containing a failing Eval Result.

## What This Proves

For this exact run, a GitHub-hosted workflow with the declared identity signed
the declared bundle digest, and a SHA-pinned reusable verifier observed the
same bundle, source identity, trusted inputs, evidence hashes, and Eval
Results. The evidence also proves which exact tool-permission and
approval-policy files the deterministic adapter loaded for this run.

## What This Does Not Prove

- It does not prove the Agent, model, policy, or SDK is generally safe.
- It does not prove another runtime or deployment enforces the same authority
  policy.
- It does not prove the attested files are semantically correct.
- It does not prove future runs produce the same result.
- It does not prevent a repository administrator from changing a later
  producer workflow or verifier reference.
- The repository's `main` branch was not protected when this evidence was
  generated. The attestation proves workflow and commit identity, not
  independent code review or branch-governance enforcement.
- The producer workflow still chooses which bytes to build and attest.
  GitHub-signed certificate fields and transparency timestamps are stronger
  than producer-controlled predicate metadata.
- This is not a SLSA level claim. A stronger design would move the build and
  signing operation into an independently governed reusable builder.

Treat this as a narrow provenance statement: **this trusted verifier observed
these exact artifacts from this exact workflow and commit**.
