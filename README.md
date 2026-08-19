# Awesome Agentic Engineering: Production Readiness Gate

[English](README.md) | [简体中文](README.zh-CN.md)

[![CI](https://github.com/lindixu6-hash/awesome-agentic-engineering/actions/workflows/ci.yml/badge.svg)](https://github.com/lindixu6-hash/awesome-agentic-engineering/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/lindixu6-hash/awesome-agentic-engineering?style=flat-square)](https://github.com/lindixu6-hash/awesome-agentic-engineering/releases/latest)
[![License](https://img.shields.io/github/license/lindixu6-hash/awesome-agentic-engineering?style=flat-square)](LICENSE)
[![Use This Template](https://img.shields.io/badge/use_this-template-0969da?style=flat-square)](https://github.com/new?template_name=awesome-agentic-engineering&template_owner=lindixu6-hash)

Not another resource list: an executable AI agent readiness scorecard and
GitHub Actions gate for shipping systems that survive real users.

[![Score an AI agent from 0/20 to production candidate](assets/readiness-scorecard-demo.gif)](https://lindixu6-hash.github.io/awesome-agentic-engineering/)

Most AI agent demos look impressive for five minutes. Production agents fail in quieter ways: vague goals, brittle tool use, memory drift, hidden costs, missing evals, prompt injection, and no recovery path.

This repository is a practical field guide for building agents that can be tested, reviewed, deployed, monitored, and improved.

## Why Star This

- You are building agents and want a production-readiness checklist.
- You need templates for agent specs, eval plans, and launch reviews.
- You want concrete failure modes to turn into regression tests.
- You review MCP servers, tool permissions, or agent workflows.

## Start Here

Use this repo if you are building:

- Coding agents
- Research agents
- Customer support agents
- Internal workflow agents
- MCP-based tools
- LLM apps with planning, tool use, memory, or multi-step execution

Use these first:

- [Agent Card](templates/agent-card.md): define what the agent does, what it must never do, and how it fails safely.
- [Agent Card JSON Schema](https://lindixu6-hash.github.io/awesome-agentic-engineering/schema/agent-card.schema.json):
  validate repository-owned cards in editors and CI. External adopters should
  follow the [schema pinning guide](schema/README.md).
- [Eval Plan](templates/eval-plan.md): turn agent behavior into testable scenarios.
- [Prompt Injection Fixtures](evals/prompt-injection/README.md): run eight direct,
  indirect, exfiltration, and benign-control cases against your agent.
- [Eval Result Contract](evals/prompt-injection/results/README.md): record
  observed actions, violations, and trace evidence against known fixtures.
- [Executable Reference Adapter](adapters/reference-runtime/README.md): run all
  eight fixtures through separated trusted/untrusted channels and retain
  generated results, assertions, and traces.
- [LangGraph.js Adapter](adapters/langgraph/README.md): execute the same
  contract through a pinned external `StateGraph` runtime with node-linked
  evidence. Read the
  [live LangGraph prompt-injection eval guide](https://lindixu6-hash.github.io/awesome-agentic-engineering/langgraph-eval/).
- [OpenAI Agents SDK Adapter](adapters/openai-agents/README.md): execute the
  contract through a real `Agent` and offline custom-Model `Runner.run()` loop,
  including Zod-validated read-only tool calls and provider-network-disabled
  tests. Read the
  [live OpenAI Agents SDK prompt-injection eval guide](https://lindixu6-hash.github.io/awesome-agentic-engineering/openai-agents-eval/).
- [CrewAI Adapter](adapters/crewai/README.md): execute the contract through
  real `Agent`, `Task.context`, and `Crew.kickoff()` paths, preserving
  source-labeled untrusted content across an inter-Agent task handoff and
  exercising CrewAI's read-only BaseTool Action/Observation loop offline.
- [Attested Evidence Provenance](docs/evidence-provenance.md): separate
  production and SHA-pinned verification jobs, bind source, authority-policy,
  and evidence digests, verify GitHub/Sigstore identity, and reject tamper,
  wrong-workflow, and older-attestation replay attempts.
- [Risk-Tiered Profiles](profiles/README.md): apply different total, per-area,
  tool-effect, approval, and blocker gates to read-only, draft-only, and
  state-changing Agents.
- [Launch Checklist](templates/launch-checklist.md): review readiness before showing the agent to real users.
- [Failure Modes](docs/failure-modes.md): common ways production agents break.
- [Production Incidents](docs/production-incidents.md): source-linked cases
  converted into regression tests.
- [MCP Safety Checklist](docs/mcp-safety-checklist.md): review tool servers before giving agents access.
- [Star Growth Playbook](docs/star-growth-playbook.md): ethical launch and maintenance loop.

Example Agent Cards:

- [Coding agent](examples/coding-agent.card.json)
- [Research agent](examples/research-agent.card.json)
- [Support agent](examples/support-agent.card.json)
- [Operations triage agent](examples/operations-agent.card.json)
- [Read-only documentation agent](examples/read-only-agent.card.json)

## Five-Minute CI Gate

Generate a fail-closed Agent Card and workflow without cloning:

```bash
npm exec --yes \
  --package=github:lindixu6-hash/awesome-agentic-engineering#v0 \
  -- agentic-init \
  --profile draft-only \
  --name "Support Drafting Agent"
```

The first run intentionally fails at `0/20` with one launch blocker. Replace
the TODOs, attach evidence, and set honest scores before removing it. Existing
files are never overwritten unless `--force` is explicit. Without Node.js,
download the fail-closed
[draft-only Agent Card](https://lindixu6-hash.github.io/awesome-agentic-engineering/starters/draft-only/agent-card.json)
and
[workflow](https://lindixu6-hash.github.io/awesome-agentic-engineering/starters/draft-only/agent-readiness.yml).
See the [five-minute quickstart](docs/quickstart.md) for all three profiles.

## Quick Score

Try the [web scorecard](https://lindixu6-hash.github.io/awesome-agentic-engineering/),
share a reproducible score URL, or run the zero-dependency CLI locally.
For the evidence behind each score, read the
[10-gate production readiness guide](https://lindixu6-hash.github.io/awesome-agentic-engineering/guide/).
AI documentation tools can start from the
[LLM-readable project index](https://lindixu6-hash.github.io/awesome-agentic-engineering/llms.txt).

Run the zero-dependency scorecard CLI against an Agent Card JSON file:

```bash
node bin/agentic-score.js examples/coding-agent.card.json
```

Run it without cloning the repository:

```bash
npm exec --yes --package=github:lindixu6-hash/awesome-agentic-engineering#v0 -- agentic-score agent-card.json
```

Expected output:

```text
Issue-to-PR Coding Agent v0.1

Score: 16/20
Rating: limited beta
```

You can also use the npm scripts after cloning:

```bash
npm run score
npm run badge
npm run validate:fixtures
npm run validate:results
npm run eval:reference
npm run install:langgraph
npm run eval:langgraph
npm run install:openai-agents
npm run eval:openai-agents
npm run install:crewai
npm run test:crewai
npm run eval:crewai
npm test
```

Generate a README-ready badge from the same Agent Card:

```bash
node bin/agentic-badge.js examples/coding-agent.card.json
```

```markdown
![Agent production readiness](https://img.shields.io/badge/agent%20readiness-16%2F20%20limited%20beta-287a50?style=flat-square)
```

Use the repository as a CI release gate:

```yaml
- uses: lindixu6-hash/awesome-agentic-engineering@v0
  with:
    card: agent-card.json
    min-score: "15"
    fail-below: "true"
    fail-on-blockers: "true"
```

`fail-on-blockers` is opt-in for backward compatibility. When enabled, any
non-empty `launch_blockers` array fails the gate even if the score passes.

Opt into a risk-tiered gate when a single score threshold is too broad:

```yaml
- uses: lindixu6-hash/awesome-agentic-engineering@v0
  with:
    card: agent-card.json
    profile: "state-changing"
```

Without `profile`, all existing score and blocker inputs keep their original
behavior. Profile rationale and boundaries are documented in
[Risk-Tiered Readiness Profiles](profiles/README.md).

The Action writes `score`, `rating`, `badge`, `passed`, `blocker-count`, and
`blockers` outputs, plus `profile` and `profile-passed` when relevant. The
workflow summary reports the score, profile, and launch blocker gates
separately.

## Used By

- [Content OS Pipeline](https://github.com/lindixu6-hash/ai-content-workflow-skills)
  gates its human-in-the-loop content agent at 10/20 and currently scores
  12/20 (`prototype`). Its
  [main workflow](https://github.com/lindixu6-hash/ai-content-workflow-skills/actions/runs/31974318431)
  also runs the strict blocker audit and `draft-only` risk profile. It exposes
  a 12/14 profile score gap, a 1/2 tool-permission gap, and three unresolved
  launch blockers without hiding them behind the passing compatibility score.

## External Validation

- [EvalRepro #31](https://github.com/seva9523/EvalRepro/pull/31) independently
  reproduced the pinned `v0.15.0` to `v0.16.0` eight-file release contract. Its
  standard Python matrix and public-source workflow passed while detecting
  exactly the three intended generated-workflow changes. This is public
  design-partner validation, not adoption or endorsement.

## External Positioning Review

- [awesome-ai-security-tools #52](https://github.com/scadastrangelove/awesome-ai-security-tools/pull/52)
  merged this project into its 1k+ Star Watchlist. The maintainer then narrowed
  the entry on `main`: this is a broader, self-declared agent-readiness gate,
  not a security scanner or enforcement control; the project is new, adoption
  is minimal, and its only listed consumer is author-operated. This is
  Watchlist inclusion and external positioning review, not adoption,
  certification, or endorsement.

After publishing on GitHub, check repository stars:

```bash
node bin/star-watch.js owner/repo --state .star-watch.json --target 1000 --text
```

The scheduled [Star Watch workflow](.github/workflows/star-watch.yml) runs the
same check daily and stores its snapshot as a workflow artifact.

## Production Agent Scorecard

Score each item from 0 to 2.

| Area | 0 | 1 | 2 |
| --- | --- | --- | --- |
| Goal clarity | Vague prompt | Defined task | Defined task, users, and success metric |
| Tool permissions | Unlimited | Some restrictions | Least-privilege tool access |
| Memory | Implicit or messy | Basic state | Scoped, inspectable, erasable memory |
| Evals | None | Manual examples | Repeatable scenario tests |
| Failure handling | Crashes or hides errors | Basic retry | Clear fallback and user recovery |
| Security | Not considered | Basic filtering | Prompt injection and data boundaries tested |
| Observability | Logs missing | Request logs | Trace, cost, latency, and outcome tracking |
| Cost control | Unknown | Estimated | Budgeted with alerts and limits |
| Human review | None | Optional review | Required review for risky actions |
| Documentation | Demo only | Setup guide | Setup, architecture, threat model, and examples |

Suggested interpretation:

- 0-7: demo only
- 8-14: prototype
- 15-18: limited beta
- 19-20: production candidate

## Core Patterns

### 1. Narrow Agent, Strong Workflow

Do not start with a general agent. Start with a narrow workflow where success can be judged.

Good:

- "Given a GitHub issue, propose a patch and open a pull request with tests."
- "Given a support ticket, gather account context and draft a reply for human review."

Weak:

- "Be an autonomous software engineer."
- "Handle all customer operations."

### 2. Tool Use As A Contract

Every tool should have:

- A clear purpose
- Input and output schema
- Permission boundary
- Error contract
- Logging behavior

If a tool can modify external state, require one of:

- Human approval
- Dry-run mode
- Reversible operation
- Narrow allowlist

### 3. Evals Before Autonomy

Before increasing autonomy, write scenario tests.

Good evals include:

- Normal task
- Ambiguous task
- Missing data
- Tool failure
- Malicious instruction
- Cost-heavy request
- Long-running task

### 4. Memory With Expiration

Agent memory should be scoped and reviewable.

Avoid:

- Global memory for everything
- Hidden state users cannot inspect
- Permanent memory without deletion

Prefer:

- Project memory
- User-approved facts
- Expiring summaries
- Source-linked notes

### 5. Human Review For Irreversible Actions

Require human review for:

- Money movement
- Public posting
- Deleting data
- Sending external messages
- Security-sensitive changes
- Production deployments

## Failure Modes

### Silent Failure

The agent returns a confident answer while skipping a required step.

Mitigation:

- Use checklists
- Log tool calls
- Require evidence for claims
- Add "done means" criteria

### Tool Abuse

The agent calls expensive or dangerous tools too often.

Mitigation:

- Rate limits
- Tool budgets
- Permission tiers
- Dry-run defaults

### Memory Drift

The agent accumulates stale or wrong assumptions.

Mitigation:

- Memory review
- Expiration
- Source links
- User-confirmed facts only

### Prompt Injection

External content tells the agent to ignore rules, reveal data, or perform unsafe actions.

Mitigation:

- Treat external content as untrusted
- Separate instructions from data
- Add action approval
- Test with adversarial fixtures

### Cost Explosion

The agent loops, over-searches, or uses large models unnecessarily.

Mitigation:

- Per-task budget
- Max tool calls
- Model routing
- Early stop criteria

## Repository Structure

```text
assets/
  scorecard.svg
bin/
  agentic-score.js
docs/
  failure-modes.md
  mcp-safety-checklist.md
  star-growth-playbook.md
evals/
  prompt-injection/
    fixtures.jsonl
    README.md
examples/
  coding-agent.card.json
  support-agent.card.json
schema/
  agent-card.schema.json
templates/
  agent-card.md
  eval-plan.md
  launch-checklist.md
launch/
  14-day-plan.md
social/
  launch-posts.md
  hn-post.md
README.zh-CN.md
CONTRIBUTING.md
```

## Contribution Ideas

High-value contributions:

- Real production failure stories
- Before/after agent architectures
- Eval datasets for common workflows
- Security test cases
- Cost control patterns
- MCP server review checklists
- Agent UX examples
- [Help wanted: CrewAI adapter with delegated-task trust boundaries](https://github.com/lindixu6-hash/awesome-agentic-engineering/issues/16)
- [Public Agent Card adoption evidence](https://github.com/lindixu6-hash/awesome-agentic-engineering/issues/new?template=agent-card-adoption.yml)
- [Executable runtime adapter proposals](https://github.com/lindixu6-hash/awesome-agentic-engineering/issues/new?template=runtime-adapter.yml)

Please read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting.

## Governance And Citation

- [CODEOWNERS](.github/CODEOWNERS) identifies repository review ownership. It
  does not bypass CI, evidence requirements, or independent review.
- [CITATION.cff](CITATION.cff) provides citation metadata for the
  **Repository-Owned Agent Readiness Contract**. Cite a pinned release or
  commit so the evaluated contract remains reproducible.
- [GitHub Sponsors](https://github.com/sponsors/lindixu6-hash) is the only
  repository-declared funding channel. Funding never changes scoring,
  evidence, review, or inclusion decisions.

Non-goals: these governance files do not certify an Agent as production-safe,
convert self-reported evidence into independent validation, or make funding a
condition for participation.

## Roadmap

- Add external adopters with public CI evidence.
- Convert independent adopter failures into reusable profiles, fixtures, and
  regression cases.

See the evidence-based [ROADMAP.md](ROADMAP.md) for shipped versions and current
priorities.

## Publication

Repository setup notes live in [PUBLICATION.md](PUBLICATION.md).

If GitHub CLI is authenticated, publish with:

```bash
scripts/publish-github.sh
```

## License

MIT.
