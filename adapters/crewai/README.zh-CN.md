# CrewAI 委派任务 Eval 适配器

[English](README.md) | [简体中文](README.zh-CN.md)

本适配器使用固定版本 CrewAI `1.15.16`，通过真实的 `Agent`、
`Task.context` 与 `Crew.kickoff()` 执行全部 8 条提示注入 fixture。它位于隔离的
Python 3.12 `uv` 项目中，不会给根目录 Node.js CLI 增加依赖。

## 运行时路径

每条 fixture 都会经过两个角色与两个 CrewAI Task：

```text
带来源标签的不可信内容
-> Untrusted Content Intake Agent
-> 紧凑不可信 envelope
-> Task.context 委派
-> Delegated Trust Boundary Worker
-> 可选 CrewAI BaseTool Action/Observation
-> 观测到的决策
-> 外部 evaluator
```

Intake Task 将原始内容放入 base64 编码的紧凑 envelope。Worker Task 在另一条
独立 marker 中携带可信任务指令。CrewAI 通过 `Task.context` 附加 Intake 输出；
确定性 `BaseLLM` 必须分别恢复两类值，并保留不可信 channel 标签。

策略型文本与有界 503 fallback 会通过以下两个合成工具之一，真实执行 CrewAI
Action/Observation 回路：

- `trusted_task_handler`
- `documented_fallback`

两个工具都声明为只读，禁止网络与 secret 访问，也不做持久化写入。拒绝与升级
场景不会调用工具。

Evaluator 仅在 `Crew.kickoff()` 返回后运行。Crew 可控制的输出不会收到 fixture
预期结果。

## 安装与运行

```bash
uv sync --project adapters/crewai --frozen --python 3.12

mkdir -p .crewai-home/data .crewai-home/cache .crewai-home/libuuid
HOME="$PWD/.crewai-home" \
XDG_DATA_HOME="$PWD/.crewai-home/data" \
XDG_CACHE_HOME="$PWD/.crewai-home/cache" \
LIBUUID_CLOCK_FILE="$PWD/.crewai-home/libuuid/clock.txt" \
CREWAI_DISABLE_TELEMETRY=true \
CREWAI_TRACING_ENABLED=false \
OTEL_SDK_DISABLED=true \
SOURCE_DATE_EPOCH=1786924800 \
uv run --project adapters/crewai --frozen \
  python adapters/crewai/run.py \
  evals/prompt-injection/fixtures.jsonl \
  artifacts/crewai-eval
```

验证结果：

```bash
node bin/validate-eval-results.js \
  artifacts/crewai-eval/results.jsonl \
  --fixtures evals/prompt-injection/fixtures.jsonl
```

运行适配器测试：

```bash
HOME="$PWD/.crewai-home" \
XDG_DATA_HOME="$PWD/.crewai-home/data" \
XDG_CACHE_HOME="$PWD/.crewai-home/cache" \
LIBUUID_CLOCK_FILE="$PWD/.crewai-home/libuuid/clock.txt" \
CREWAI_DISABLE_TELEMETRY=true \
CREWAI_TRACING_ENABLED=false \
OTEL_SDK_DISABLED=true \
uv run --project adapters/crewai --frozen pytest
```

显式 HOME、XDG 与 libuuid 路径可防止运行时写入用户常规应用数据目录。测试会把
Python socket 连接入口替换为立即失败的函数。

## 证据

每条 case 包含：

- `response.json`
- `assertions.json`
- `runtime-path.json`
- `tool-trace.json`
- `policy-trace.json`

Suite 还会输出 `results.jsonl` 与 `summary.json`。Runtime-path 证据记录两个 Agent
角色、两个 Task 名称、每次确定性 LLM 调用、Task 输出与网络尝试。CI 使用公开
`@v0` 校验结果合约，并保留独立 `crewai-eval-evidence` artifact。

## 能证明什么

- CrewAI `Agent`、`Task.context` 与 `Crew.kickoff()` 对每条 fixture 都真实执行。
- 带来源标签的内容经过跨 Agent Task handoff 后仍保持不可信。
- 允许调用工具的场景真实经过 CrewAI BaseTool Action/Observation 回路。
- Provider 网络入口已禁用，未使用 API key。
- Crew 输出之外的 evaluator 会把故意错误的观测结果保留为失败 Eval Result。

## 不能证明什么

- 这不是 LLM Benchmark。
- 不能证明任意 CrewAI 应用都安全。
- 当前测试的是顺序 `Task.context` 委派，不覆盖 hierarchical manager 委派、
  MCP、A2A、memory、planning 或托管 provider transport。
- 确定性分类器只覆盖已声明 fixture 的策略模式。
- 固定 CrewAI 环境会解析出 141 个包；隔离和 lockfile 让该成本可复现，但不会
  让依赖面变小。
- 这不代表 CrewAI 采用、背书、认证或生产安全结论。
