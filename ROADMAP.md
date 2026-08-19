# Roadmap

This roadmap tracks shipped, verifiable artifacts rather than aspirational
feature counts.

## Shipped

### v0.1: Scorecard foundation

- [x] 20-point production-readiness scorecard
- [x] Agent Card, Eval Plan, and Launch Checklist templates
- [x] Machine-readable Agent Card schema
- [x] Zero-dependency score CLI

### v0.2: Public product surface

- [x] English and Chinese README
- [x] Bilingual web scorecard with shareable URLs and JSON export
- [x] README badge generator
- [x] Node 24 GitHub Action readiness gate
- [x] Source-linked production incident library
- [x] MCP server safety checklist

### v0.3: Explicit release blockers

- [x] Independent score and launch-blocker gates
- [x] Combined pass result and machine-readable blocker outputs
- [x] Public `@v0` smoke tests
- [x] First external adopter on a separate repository

### v0.4: Prompt-injection fixtures

- [x] Eight framework-neutral JSONL fixtures
- [x] Direct, indirect, tool-output, exfiltration, and benign-control coverage
- [x] JSON Schema and zero-dependency fixture validator
- [x] English and Chinese fixture documentation

### v0.5: Non-coding Agent example

- [x] Human-approved operations triage Agent Card
- [x] Read-only diagnosis separated from state-changing tools
- [x] Approval required for external messages, deletes, and production changes

### v0.6: CI trust-boundary regression

- [x] Sixth bilingual, source-linked vulnerability case
- [x] Gemini CLI workspace-trust and allowlist regressions
- [x] Automated structure and impact-boundary checks

### v0.7: Machine-readable eval results

- [x] Framework-neutral Eval Result JSON Schema
- [x] Zero-dependency validator for JSON, JSON arrays, and JSONL
- [x] Fixture-reference, duplicate-ID, and result-consistency checks
- [x] Inert pass/fail examples and English/Chinese adapter guidance

### v0.8: Risk-tiered readiness profiles

- [x] Read-only, draft-only, and state-changing machine-readable profiles
- [x] Total and per-area minimums, tool-effect boundaries, and approval rules
- [x] Profile-specific launch-blocker policies
- [x] Opt-in, backward-compatible GitHub Action support
- [x] English and Chinese threat-model guidance with one example per profile

### v0.9: Executable reference eval adapter

- [x] Separate trusted-instruction and source-labeled untrusted-content channels
- [x] Execute all eight malicious and benign fixtures
- [x] Generate v0.7 results, assertions, responses, and tool/policy traces
- [x] Validate generated results with public `@v0` in CI
- [x] Retain complete evidence as a CI artifact
- [x] English and Chinese scope, trust-boundary, and limitation guidance

### v0.10: LangGraph.js runtime adapter

- [x] Pin LangGraph.js in an isolated, reproducible subpackage
- [x] Execute all fixtures through a real two-node `StateGraph`
- [x] Preserve trusted and untrusted values as separate graph-state fields
- [x] Emit node-linked results, assertions, and tool/policy traces
- [x] Validate results with public `@v0` and retain a dedicated CI artifact
- [x] Keep root CLIs zero-dependency and document limits in English and Chinese

### v0.11: Fail-closed project initializer

- [x] Zero-dependency `agentic-init` CLI
- [x] Read-only, draft-only, and state-changing starter cards
- [x] Generated GitHub Actions workflow pinned to public `@v0`
- [x] Zero scores, TODO fields, and an explicit starter blocker by default
- [x] Atomic overwrite protection with explicit `--force`
- [x] English and Chinese five-minute quickstarts

### v0.12: No-install Starter downloads

- [x] Downloadable Agent Card and GitHub Actions workflow for every risk profile
- [x] Byte-equivalence checks against `agentic-init` output
- [x] GitHub Pages hosting with direct JSON and YAML downloads
- [x] English and Chinese README, Quickstart, and web-guide entry points
- [x] LLM-readable Starter links and npm package inclusion

### v0.13: OpenAI Agents SDK runtime adapter

- [x] Pin OpenAI Agents SDK and Zod in an isolated reproducible subpackage
- [x] Execute all fixtures through a real `Agent` and `Runner.run()` loop
- [x] Exercise SDK-managed, Zod-validated read-only function calls
- [x] Complete with provider network access disabled and no API key
- [x] Emit results, assertions, responses, and tool/policy traces
- [x] Retain CI evidence and validate results with public `@v0`
- [x] Publish English and Chinese technical guides with explicit limitations

### v0.14: Attested evidence provenance

- [x] Bind source, workflow, trusted inputs, and every evidence file in a manifest
- [x] Split runtime production from SHA-pinned reusable verification
- [x] Sign the deterministic evidence bundle with GitHub OIDC and Sigstore
- [x] Verify signer workflow, signer/source digest, ref, and hosted runner
- [x] Reject modified bundles, wrong source identity, and failing Eval Results
- [x] Publish complete English and Chinese provenance boundaries

### v0.15: Public schema distribution

- [x] Replace the Agent Card placeholder identity with a canonical Pages URL
- [x] Publish all four JSON Schemas through GitHub Pages
- [x] Add canonical `$schema` declarations to generated and downloadable cards
- [x] Make web scorecard exports schema-valid and fail closed by default
- [x] Document mutable canonical and immutable release URLs in English and Chinese

### v0.16: Starter workflow supply-chain hardening

- [x] Pin `actions/checkout` in every generated workflow to a reviewed commit SHA
- [x] Keep downloadable workflows byte-equivalent to initializer output
- [x] Test that generated workflows cannot regress to a mutable checkout tag
- [x] Document the third-party SHA pin and the deliberate moving `@v0` channel
- [x] Preserve the same guidance in English and Simplified Chinese

### v0.17: Repository workflow supply-chain hardening

- [x] Pin every third-party Action in CI, Pages, and Star Watch to a full SHA
- [x] Preserve local actions and the deliberate public `@v0` compatibility probes
- [x] Add a repository-wide regression that rejects mutable third-party Action tags
- [x] Configure weekly Dependabot updates, excluding attestation-bound major upgrades
- [x] Document update and trust boundaries in English and Simplified Chinese

### v0.18: Runtime authority provenance

- [x] Load fail-closed tool-permission and approval-policy manifests at runtime
- [x] Bind both authority-policy digests into policy traces, tool traces, and
      the signed provenance manifest
- [x] Preserve a valid v0.14 bundle as a replay fixture with its original
      attestation
- [x] Reject a wrong workflow identity and replay of an older valid attestation
- [x] Keep the verifier workflow and verifier code on separate immutable commits
- [x] Document that repository governance and semantic safety remain unproven

### v0.18.1: Governance and citation baseline

- [x] Publish CFF 1.2 citation metadata for the repository-owned readiness
      contract
- [x] Declare repository-wide and subsystem review ownership with CODEOWNERS
- [x] Declare the sole funding channel without changing scoring, review, or
      inclusion decisions
- [x] Preserve explicit non-goals for certification and independent validation
- [x] Add regression coverage for governance ownership and claim boundaries

### v0.18.2: npm distribution contract

- [x] Declare canonical repository, homepage, issue, funding, and public-access
      package metadata
- [x] Include citation, security, and roadmap boundaries in the package
- [x] Verify the exact npm tarball manifest without publishing
- [x] Exclude local evidence, tests, workflows, and worktree-only files
- [x] Keep npm publication blocked until an authenticated owner performs it

## Current Priorities

- Add source-linked incidents only when they introduce a distinct control or
  regression, not to inflate a case count.
- Add external adopters with public CI evidence.

## Contribution Principles

High-value contributions should:

- produce a reusable artifact, test, or source-linked case;
- separate observed evidence from interpretation;
- keep launch blockers and limitations visible;
- include English and Chinese navigation when adding a user-facing workflow;
- avoid fabricated benchmarks, unsafe payload execution, and engagement
  exchange.
