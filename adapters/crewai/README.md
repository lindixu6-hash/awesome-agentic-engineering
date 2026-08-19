# CrewAI Delegated-Task Eval Adapter

[English](README.md) | [简体中文](README.zh-CN.md)

This adapter runs all eight prompt-injection fixtures through pinned CrewAI
`1.15.16` using real `Agent`, `Task.context`, and `Crew.kickoff()` execution.
It is isolated in a Python 3.12 `uv` project so the root Node.js CLIs remain
zero-dependency.

## Runtime Path

Every fixture crosses two roles and two CrewAI tasks:

```text
source-labeled untrusted content
-> Untrusted Content Intake Agent
-> compact untrusted envelope
-> Task.context delegation
-> Delegated Trust Boundary Worker
-> optional CrewAI BaseTool Action/Observation
-> observed decision
-> external evaluator
```

The intake task base64-encodes the original content inside a compact envelope.
The worker task carries the trusted instruction in a separate encoded marker.
CrewAI appends the intake output through `Task.context`; the worker's
deterministic `BaseLLM` must recover both values independently and preserves the
untrusted channel label.

Policy-like content and the bounded 503 fallback execute real CrewAI
Action/Observation loops through one of two synthetic tools:

- `trusted_task_handler`
- `documented_fallback`

Both tools declare read-only effect, deny network and secret access, and make no
persistent write. Refusal and escalation cases make no tool call.

The evaluator runs after `Crew.kickoff()` returns. Crew-controlled output never
receives the expected fixture outcome.

## Install And Run

```bash
uv sync --project adapters/crewai --frozen --python 3.12

mkdir -p .crewai-home/data .crewai-home/cache .crewai-home/libuuid
HOME="$PWD/.crewai-home" \
XDG_DATA_HOME="$PWD/.crewai-home/data" \
XDG_CACHE_HOME="$PWD/.crewai-home/cache" \
LIBUUID_CLOCK_FILE="$PWD/.crewai-home/libuuid/clock.txt" \
CREWAI_DISABLE_TELEMETRY=true \
CREWAI_TESTING=true \
CREWAI_TRACING_ENABLED=false \
OTEL_SDK_DISABLED=true \
SOURCE_DATE_EPOCH=1786924800 \
uv run --project adapters/crewai --frozen \
  python adapters/crewai/run.py \
  evals/prompt-injection/fixtures.jsonl \
  artifacts/crewai-eval
```

Validate the generated results:

```bash
node bin/validate-eval-results.js \
  artifacts/crewai-eval/results.jsonl \
  --fixtures evals/prompt-injection/fixtures.jsonl
```

Run adapter tests:

```bash
HOME="$PWD/.crewai-home" \
XDG_DATA_HOME="$PWD/.crewai-home/data" \
XDG_CACHE_HOME="$PWD/.crewai-home/cache" \
LIBUUID_CLOCK_FILE="$PWD/.crewai-home/libuuid/clock.txt" \
CREWAI_DISABLE_TELEMETRY=true \
CREWAI_TESTING=true \
CREWAI_TRACING_ENABLED=false \
OTEL_SDK_DISABLED=true \
uv run --project adapters/crewai --frozen pytest
```

The explicit HOME, XDG, and libuuid paths prevent the runtime from writing to
the user's normal application-data directories. `CREWAI_TESTING=true` disables
CrewAI's first-execution trace-consent collection and preference write. Tests
replace Python socket connection entry points with functions that fail
immediately.

## Evidence

Each case contains:

- `response.json`
- `assertions.json`
- `runtime-path.json`
- `tool-trace.json`
- `policy-trace.json`

The suite also emits `results.jsonl` and `summary.json`. Runtime-path evidence
records both Agent roles, both Task names, every deterministic LLM call, task
outputs, and blocked network attempts. CI validates the result contract with
public `@v0` and retains a dedicated `crewai-eval-evidence` artifact.

## What This Proves

- CrewAI `Agent`, `Task.context`, and `Crew.kickoff()` executed every fixture.
- Source-labeled content remained untrusted across an inter-Agent task handoff.
- Allowed tool cases traversed CrewAI's real BaseTool Action/Observation loop.
- Provider network entry points were disabled and no API key was used.
- An evaluator outside Crew output preserves an intentionally wrong observed
  outcome as a failing Eval Result.

## What This Does Not Prove

- This is not an LLM benchmark.
- It does not prove arbitrary CrewAI applications are secure.
- It tests sequential `Task.context` delegation, not hierarchical manager
  delegation, MCP, A2A, memory, planning, or hosted provider transport.
- The deterministic classifier covers only the declared fixture policy
  patterns.
- The pinned CrewAI environment resolves 141 packages; isolation and a lockfile
  make that cost reproducible but do not make the dependency surface small.
- It is not CrewAI adoption, endorsement, certification, or a production-safety
  claim.
