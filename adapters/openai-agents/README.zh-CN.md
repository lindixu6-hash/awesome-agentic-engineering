# OpenAI Agents SDK Eval 适配器

[English](README.md) | [简体中文](README.zh-CN.md)

该适配器通过真实的
[`@openai/agents`](https://github.com/openai/openai-agents-js)
`Agent` 与 `Runner.run()` 循环运行提示注入 Fixture Pack，再生成本仓库 v0.7
Eval Result 契约。

OpenAI Agents SDK `0.16.1` 与 Zod `4.4.3` 被锁定在独立子包中。根目录的评分、
Badge、Fixture、Result 与初始化 CLI 仍保持零依赖。

## Runtime 路径

每条 Fixture 通过两个独立入口进入 SDK：

- `fixture.trusted_instruction` 成为 Agent 的可信 Instructions；
- 带来源标签的 `fixture.untrusted_content` 成为显式标记为 `untrusted` 的用户
  Input Item。

公共自定义 `Model` 实现只对不可信 Envelope 分类，再返回标准化 SDK Output。
它不会收到 Fixture 的预期结果。

对于允许继续的工作，Model 会发出 Function Call，SDK 随后真实执行第二轮：

```text
用户消息
→ 自定义 Model
→ function_call
→ Runner 执行经 Zod 校验的只读工具
→ function_call_result
→ 自定义 Model
→ 结构化最终输出
```

拒绝和升级案例会在一轮 Model 调用后结束，不会调用工具。良性 503 对照只运行
一次 `documented_fallback`。OpenAI Tracing 被关闭，全程不使用 Provider Client、
API Key 或模型 Endpoint。

在构造 Agent 前，Adapter 会加载两份机器可读的权限输入：

- [`tool-permissions.json`](../../evals/prompt-injection/tool-permissions.json)
  默认拒绝未声明工具，并声明两个已暴露工具均为只读，不具备网络、Secret 或持久
  写入权限；
- [`approval-policy.json`](../../evals/prompt-injection/approval-policy.json)
  只允许只读影响，并拒绝草稿或外部状态变更。

策略格式损坏或权限扩大时会 fail closed。两份文件的 SHA-256 会写入 Policy Trace
和每条 Tool Trace，带 Attestation 的 Provenance Manifest 也会将它们作为可信
输入绑定。

外部 Evaluator 只在 `Runner.run()` 返回后运行。它比较观察到的决策与 Fixture
契约，再写入回答、断言、工具 Trace、策略 Trace、Eval Result 与 Summary。

## 安装与运行

```bash
npm ci --prefix adapters/openai-agents --ignore-scripts

SOURCE_DATE_EPOCH=1786924800 \
  node adapters/openai-agents/run.js \
  evals/prompt-injection/fixtures.jsonl \
  artifacts/openai-agents-eval
```

校验生成结果：

```bash
node bin/validate-eval-results.js \
  artifacts/openai-agents-eval/results.jsonl \
  --fixtures evals/prompt-injection/fixtures.jsonl
```

CI 会安装锁定的子包、运行全部 8 条 Fixture、使用公开 `@v0` CLI 校验结果，并
上传 `openai-agents-eval-evidence`。可以检查
[公开证据运行](https://github.com/lindixu6-hash/awesome-agentic-engineering/actions/runs/31980983499)。
独立的
[带 Attestation 的 Producer/Verifier 路径](../../docs/evidence-provenance.zh-CN.md)
会将 Runtime 证据绑定到源码、Workflow 与 Artifact Digest。

## 可以证明什么

- 每条 Fixture 都由真实 SDK `Agent` 与 `Runner.run()` 执行。
- 允许继续的案例经过 SDK Function Call 循环并产生 Tool Result。
- 可信 Instructions 与带来源标签的不可信内容以独立 Request 字段到达自定义
  Model。
- 拒绝与升级案例不会调用工具。
- Evaluator 根据观察到的 Runner Output 与 Trace 生成结果。
- 强制制造预期/实际不一致时会生成失败的 Eval Result。
- 即使把 Provider 网络访问替换为永远抛错的函数，套件仍能完成。

## 不能证明什么

- 它不是 LLM Benchmark。自定义 Model 是确定性的。
- 它不能证明任意 OpenAI Agents SDK 应用都安全。
- 它不测试声明策略模式之外的语义攻击。
- 它不测试 Hosted Tool、Handoff、Session、Streaming 或 Provider Transport。
- 它不能证明生产部署将 Evaluator 保持在 Agent 可写工作区之外。
- 它能证明这个确定性 Adapter 加载了哪些权限文件，但不能证明另一套 Runtime 或
  生产部署执行了同一策略。
- 它不会把结果转移给 Content OS 或其他采用项目。

Runner 不使用 API Key、网络工具、Secret、特权 Token、外部 Egress Endpoint
或危险 Payload。这是针对一条明确 Trust Boundary 的确定性集成证据，不是 SDK
通用安全认证。
