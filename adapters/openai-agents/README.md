# OpenAI Agents SDK Eval Adapter

[English](README.md) | [简体中文](README.zh-CN.md)

This adapter runs the prompt-injection fixture pack through a real
[`@openai/agents`](https://github.com/openai/openai-agents-js)
`Agent` and `Runner.run()` loop, then emits the repository's v0.7 Eval Result
contract.

It pins OpenAI Agents SDK `0.16.1` and Zod `4.4.3` in an isolated subpackage.
The root score, badge, fixture, result, and initialization CLIs remain
zero-dependency.

## Runtime Path

Each fixture enters the SDK through two separate surfaces:

- `fixture.trusted_instruction` becomes the Agent's trusted instructions;
- source-labeled `fixture.untrusted_content` becomes a user input item with an
  explicit `untrusted` channel.

A public custom `Model` implementation classifies only the untrusted envelope
and returns normalized SDK output. It never receives the expected fixture
outcome.

For allowed work, the Model emits a function call and the SDK performs a real
second turn:

```text
user message
→ custom Model
→ function_call
→ Runner executes a Zod-validated read-only tool
→ function_call_result
→ custom Model
→ structured final output
```

Refusal and escalation cases end after one model turn and make no tool call.
The benign 503 control uses `documented_fallback` exactly once. OpenAI tracing
is disabled, and no provider client, API key, or model endpoint is used.

Before constructing the Agent, the adapter loads two machine-readable
authority inputs:

- [`tool-permissions.json`](../../evals/prompt-injection/tool-permissions.json)
  denies undeclared tools and declares both exposed tools read-only, without
  network, secret, or persistent-write access;
- [`approval-policy.json`](../../evals/prompt-injection/approval-policy.json)
  allows only read-only effects and denies draft or external-state effects.

Malformed or expanded policy fails closed. Their SHA-256 digests are recorded
in the policy trace and every tool trace. The attested provenance manifest
also binds both files as trusted inputs.

The external evaluator runs only after `Runner.run()` returns. It compares the
observed decision with the fixture contract and writes response, assertion,
tool-trace, policy-trace, Eval Result, and summary artifacts.

## Install And Run

```bash
npm ci --prefix adapters/openai-agents --ignore-scripts

SOURCE_DATE_EPOCH=1786924800 \
  node adapters/openai-agents/run.js \
  evals/prompt-injection/fixtures.jsonl \
  artifacts/openai-agents-eval
```

Validate generated results:

```bash
node bin/validate-eval-results.js \
  artifacts/openai-agents-eval/results.jsonl \
  --fixtures evals/prompt-injection/fixtures.jsonl
```

CI installs the pinned subpackage, runs all eight fixtures, validates results
with the public `@v0` CLI, and uploads `openai-agents-eval-evidence`. Inspect
the [public evidence run](https://github.com/lindixu6-hash/awesome-agentic-engineering/actions/runs/31980983499).
The separate
[attested producer/verifier path](../../docs/evidence-provenance.md)
binds the runtime evidence to source, workflow, and artifact digests.

## What This Proves

- A real SDK `Agent` and `Runner.run()` executed every fixture.
- Allowed cases traversed the SDK function-call loop and produced a tool result.
- Trusted instructions and source-labeled untrusted content reached the custom
  Model as separate request fields.
- Refusal and escalation cases made no tool call.
- The evaluator generated results from observed Runner output and traces.
- A forced expected/observed mismatch produces a failing Eval Result.
- The suite completes when provider network access is replaced with a function
  that always throws.

## What This Does Not Prove

- It does not benchmark an LLM. The custom Model is deterministic.
- It does not prove arbitrary OpenAI Agents SDK applications are secure.
- It does not test semantic attacks outside the declared policy patterns.
- It does not test hosted tools, handoffs, sessions, streaming, or provider
  transport behavior.
- It does not prove a production deployment keeps its evaluator outside the
  Agent-controlled workspace.
- It proves which authority files this deterministic adapter loaded, not that
  another runtime or production deployment enforces the same policy.
- It does not transfer these results to Content OS or another adopter.

The runner uses no API key, network tool, secret, privileged token, external
egress endpoint, or unsafe payload. This is deterministic integration evidence
for one declared trust boundary, not a general SDK safety certification.
