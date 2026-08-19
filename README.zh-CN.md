# Awesome Agentic Engineering：AI Agent 生产就绪门禁

[English](README.md) | [简体中文](README.zh-CN.md)

[![CI](https://github.com/lindixu6-hash/awesome-agentic-engineering/actions/workflows/ci.yml/badge.svg)](https://github.com/lindixu6-hash/awesome-agentic-engineering/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/lindixu6-hash/awesome-agentic-engineering?style=flat-square)](https://github.com/lindixu6-hash/awesome-agentic-engineering/releases/latest)
[![License](https://img.shields.io/github/license/lindixu6-hash/awesome-agentic-engineering?style=flat-square)](LICENSE)
[![使用此模板](https://img.shields.io/badge/使用此仓库-创建模板-0969da?style=flat-square)](https://github.com/new?template_name=awesome-agentic-engineering&template_owner=lindixu6-hash)

这不是另一份资源清单，而是一套可执行的 AI Agent 评分卡与 GitHub Actions
上线门禁。

[![将 AI Agent 从 0/20 评到生产候选](assets/readiness-scorecard-demo.gif)](https://lindixu6-hash.github.io/awesome-agentic-engineering/)

大多数 AI Agent demo 能惊艳 5 分钟，但很难进入生产。真正的问题通常不是模型不够强，而是目标模糊、工具权限过大、记忆漂移、没有评估、成本失控、提示注入、失败不可见。

这个仓库的目标是帮助开发者把 Agent 做到可测试、可审查、可部署、可观测、可迭代。

## 为什么值得 star

- 你正在做 Agent，需要生产就绪检查清单。
- 你需要 Agent 规格、eval、上线评审模板。
- 你想把真实失败模式变成回归测试。
- 你需要审查 MCP server、工具权限或 Agent 工作流。

## 适合谁

如果你正在做这些东西，这个仓库适合你：

- Coding Agent
- Research Agent
- 客服 Agent
- 企业内部流程 Agent
- MCP 工具
- 带规划、工具调用、记忆、多步骤执行的 LLM 应用

建议先看：

- [Agent Card](templates/agent-card.md)：定义 Agent 做什么、不做什么、怎么安全失败。
- [Agent Card JSON Schema](https://lindixu6-hash.github.io/awesome-agentic-engineering/schema/agent-card.schema.json)：
  在编辑器与 CI 中校验仓库自有 Card。外部采用应遵循
  [Schema 版本锁定指南](schema/README.zh-CN.md)。
- [Eval Plan](templates/eval-plan.md)：把 Agent 行为变成可测试场景。
- [提示注入评估数据集](evals/prompt-injection/README.zh-CN.md)：用 8 个直接注入、
  间接注入、数据外泄和良性对照用例测试 Agent。
- [Eval Result 契约](evals/prompt-injection/results/README.zh-CN.md)：对照已知
  Fixture 记录实际动作、违规与 Trace 证据。
- [可执行参考适配器](adapters/reference-runtime/README.zh-CN.md)：通过分离的可信/
  不可信通道运行全部 8 条 Fixture，并保留生成的结果、断言与 Trace。
- [LangGraph.js 适配器](adapters/langgraph/README.zh-CN.md)：通过锁定的外部
  `StateGraph` Runtime 执行同一契约，并保留节点级证据。也可以直接阅读
  [在线 LangGraph 提示注入 Eval 指南](https://lindixu6-hash.github.io/awesome-agentic-engineering/zh/langgraph-eval/)。
- [OpenAI Agents SDK 适配器](adapters/openai-agents/README.zh-CN.md)：
  通过真实 `Agent` 与离线自定义 Model 的 `Runner.run()` 循环执行同一契约，
  包含经 Zod 校验的只读工具调用与禁用 Provider 网络后的测试。也可以阅读
  [在线 OpenAI Agents SDK 提示注入 Eval 指南](https://lindixu6-hash.github.io/awesome-agentic-engineering/zh/openai-agents-eval/)。
- [带 Attestation 的证据溯源](docs/evidence-provenance.zh-CN.md)：分离
  Producer 与 SHA 锁定的 Verifier Job，绑定源码、权限策略与证据 Digest，
  验证 GitHub/Sigstore 身份，并拒绝篡改、错误 Workflow 与旧 Attestation
  重放。
- [风险分级 Profile](profiles/README.zh-CN.md)：针对只读、仅草稿与状态变更
  Agent 使用不同的总分、分项、工具影响、审批和阻塞项门禁。
- [Launch Checklist](templates/launch-checklist.md)：上线前做一次生产就绪检查。
- [Failure Modes](docs/failure-modes.md)：常见生产失败模式。
- [生产事故案例](docs/production-incidents.zh-CN.md)：将有来源的公开案例转成回归测试。
- [MCP Safety Checklist](docs/mcp-safety-checklist.md)：给 Agent 接入工具服务器前的安全检查。
- [Star Growth Playbook](docs/star-growth-playbook.md)：长期真实增长打法。

Agent Card 示例：

- [Coding Agent](examples/coding-agent.card.json)
- [Research Agent](examples/research-agent.card.json)
- [Support Agent](examples/support-agent.card.json)
- [运维分诊 Agent](examples/operations-agent.card.json)
- [只读文档研究 Agent](examples/read-only-agent.card.json)

## 五分钟接入 CI 门禁

无需 clone，一条命令生成 fail-closed 的 Agent Card 与工作流：

```bash
npm exec --yes \
  --package=github:lindixu6-hash/awesome-agentic-engineering#v0 \
  -- agentic-init \
  --profile draft-only \
  --name "Support Drafting Agent"
```

第一次运行会刻意以 `0/20` 和一个上线 blocker 失败。替换所有 TODO、关联证据并
如实评分后，才能删除 blocker。除非显式传入 `--force`，命令不会覆盖已有文件。
没有 Node.js 时，可以直接下载 fail-closed 的
[draft-only Agent Card](https://lindixu6-hash.github.io/awesome-agentic-engineering/starters/draft-only/agent-card.json)
和
[工作流](https://lindixu6-hash.github.io/awesome-agentic-engineering/starters/draft-only/agent-readiness.yml)。
三个 Profile 的完整流程见[中文五分钟 Quickstart](docs/quickstart.zh-CN.md)。

## 快速评分

直接打开[在线评分器](https://lindixu6-hash.github.io/awesome-agentic-engineering/)，
生成可复现、可分享的评分链接，也可以在本地运行零依赖 CLI。
每项分数需要什么证据，见
[10 项生产就绪门槛指南](https://lindixu6-hash.github.io/awesome-agentic-engineering/zh/guide/)。
AI 文档工具可以从
[适合 LLM 读取的项目索引](https://lindixu6-hash.github.io/awesome-agentic-engineering/llms.txt)
开始。

用零依赖 CLI 检查一个 Agent Card JSON：

```bash
node bin/agentic-score.js examples/coding-agent.card.json
```

无需 clone，直接从 GitHub 运行：

```bash
npm exec --yes --package=github:lindixu6-hash/awesome-agentic-engineering#v0 -- agentic-score agent-card.json
```

预期输出：

```text
Issue-to-PR Coding Agent v0.1

Score: 16/20
Rating: limited beta
```

clone 后也可以直接运行：

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
npm test
```

使用同一份 Agent Card 生成可直接放进 README 的徽章：

```bash
node bin/agentic-badge.js examples/coding-agent.card.json
```

```markdown
![Agent production readiness](https://img.shields.io/badge/agent%20readiness-16%2F20%20limited%20beta-287a50?style=flat-square)
```

在 CI 中把仓库作为上线门禁：

```yaml
- uses: lindixu6-hash/awesome-agentic-engineering@v0
  with:
    card: agent-card.json
    min-score: "15"
    fail-below: "true"
    fail-on-blockers: "true"
```

为保持向后兼容，`fail-on-blockers` 需要显式开启。开启后，即使总分达标，
只要 `launch_blockers` 非空，门禁仍会失败。

当单一分数门槛过于宽泛时，可以显式启用风险分级门禁：

```yaml
- uses: lindixu6-hash/awesome-agentic-engineering@v0
  with:
    card: agent-card.json
    profile: "state-changing"
```

不设置 `profile` 时，现有分数和阻塞项参数完全保持原行为。具体威胁模型与边界见
[风险分级生产就绪 Profile](profiles/README.zh-CN.md)。

Action 会输出 `score`、`rating`、`badge`、`passed`、`blocker-count`、
`blockers`，以及相关的 `profile` 与 `profile-passed`，并在工作流摘要中分别展示
分数、Profile 与阻塞项门禁。

## 已采用

- [Content OS Pipeline](https://github.com/lindixu6-hash/ai-content-workflow-skills)
  使用10/20作为人机协作内容Agent的CI门槛，当前真实得分为12/20（`prototype`）。
  [main 工作流](https://github.com/lindixu6-hash/ai-content-workflow-skills/actions/runs/31974318431)
  同时运行严格阻塞项与 `draft-only` Profile 审计，明确暴露 12/14 总分差距、
  1/2 工具权限差距和 3 个未解决的上线阻塞项，不让兼容门槛通过掩盖真实技术债。

## 外部验证

- [EvalRepro #31](https://github.com/seva9523/EvalRepro/pull/31) 独立复现了
  `v0.15.0` 到 `v0.16.0` 的 8 文件版本契约。其标准 Python 测试矩阵和公开
  源码复现工作流均通过，并准确检测到 3 个预期的生成工作流变化。这是公开
  设计伙伴验证，不代表采用或背书。

## 外部定位评审

- [awesome-ai-security-tools #52](https://github.com/scadastrangelove/awesome-ai-security-tools/pull/52)
  已将本项目合并至其 1k+ Star Watchlist（观察名单）。维护者随后在主分支
  收紧描述：本项目是更广义的、自声明的 Agent 生产就绪门禁，不是安全扫描器
  或强制控制；项目仍很新、采用很少，唯一列出的使用方也由作者本人维护。
  这是观察名单收录与外部定位评审，不代表采用、认证或背书。

发布到 GitHub 后，可以这样检查 star：

```bash
node bin/star-watch.js owner/repo --state .star-watch.json --target 1000 --text
```

仓库内置的 [Star Watch 工作流](.github/workflows/star-watch.yml) 每天执行同一检查，
并将快照保存为 GitHub Actions artifact。

## 生产级 Agent 评分卡

每项 0-2 分。

| 维度 | 0 分 | 1 分 | 2 分 |
| --- | --- | --- | --- |
| 目标清晰度 | 只有模糊 prompt | 有任务定义 | 有任务、用户和成功指标 |
| 工具权限 | 几乎无限制 | 有部分限制 | 最小权限原则 |
| 记忆 | 隐式或混乱 | 有基础状态 | 有范围、可检查、可删除 |
| 评估 | 没有 | 人工样例 | 可重复场景测试 |
| 失败处理 | 崩溃或隐藏错误 | 基础重试 | 明确降级和恢复路径 |
| 安全 | 未考虑 | 基础过滤 | 测过提示注入和数据边界 |
| 可观测性 | 没日志 | 有请求日志 | 有 trace、成本、延迟、结果 |
| 成本控制 | 不知道成本 | 有估算 | 有预算、告警和限制 |
| 人工审核 | 没有 | 可选审核 | 高风险动作强制审核 |
| 文档 | 只有 demo | 有安装说明 | 有安装、架构、威胁模型和案例 |

参考解释：

- 0-7：只能算 demo
- 8-14：原型
- 15-18：有限 beta
- 19-20：生产候选

## 核心原则

### 1. 窄 Agent，强流程

不要一开始就做通用 Agent。先做一个边界明确、能判断成败的流程。

好的例子：

- 给定 GitHub issue，生成 patch 并提交带测试的 PR。
- 给定客服工单，收集账户上下文并起草回复，等待人工确认。

弱的例子：

- 做一个自主软件工程师。
- 自动处理所有客户运营。

### 2. 工具调用必须像合约

每个工具都应该有：

- 明确用途
- 输入输出结构
- 权限边界
- 错误约定
- 日志行为

如果工具会修改外部状态，至少要有：

- 人工确认
- dry-run 模式
- 可逆操作
- 明确白名单

### 3. 先评估，再自治

提高 Agent 自治程度之前，先写场景测试。

好的 eval 应覆盖：

- 正常任务
- 模糊任务
- 缺失数据
- 工具失败
- 恶意指令
- 高成本请求
- 长任务

### 4. 记忆必须有边界

Agent 记忆应该可审查、可删除、有范围。

避免：

- 什么都塞进全局记忆
- 用户看不到的隐藏状态
- 永久保存但无法删除

优先：

- 项目级记忆
- 用户确认过的事实
- 有过期时间的摘要
- 带来源链接的记录

## 典型失败模式

### 静默失败

Agent 看起来回答得很自信，但跳过了关键步骤。

缓解方式：

- 使用 checklist
- 记录工具调用
- 要求结论必须带证据
- 定义 done means

### 工具滥用

Agent 过度调用昂贵或危险工具。

缓解方式：

- 限速
- 工具预算
- 权限分级
- 默认 dry-run

### 记忆漂移

Agent 不断积累过时或错误假设。

缓解方式：

- 定期审查记忆
- 设置过期时间
- 记录来源
- 只保存用户确认事实

### 提示注入

外部内容诱导 Agent 忽略规则、泄露数据或执行危险操作。

缓解方式：

- 把外部内容当作不可信数据
- 区分系统指令和外部资料
- 高风险动作走人工确认
- 用对抗样例测试

## 后续路线

- 增加带公开 CI 证据的外部采用项目。
- 将独立采用项目暴露的失败转成可复用 Profile、Fixture 与回归案例。

已交付版本与当前优先级见证据驱动的 [ROADMAP.md](ROADMAP.md)。

## 发布

GitHub 仓库发布设置见 [PUBLICATION.md](PUBLICATION.md)。

## 贡献

欢迎提交：

- 真实生产失败案例
- Agent 架构 before/after
- 常见工作流 eval 数据
- 安全测试样例
- 成本控制模式
- MCP server 审查清单
- [Help wanted：带委派任务信任边界的 CrewAI 适配器](https://github.com/lindixu6-hash/awesome-agentic-engineering/issues/16)
- [公开 Agent Card 采用证据](https://github.com/lindixu6-hash/awesome-agentic-engineering/issues/new?template=agent-card-adoption.yml)
- [可执行 Runtime 适配器提案](https://github.com/lindixu6-hash/awesome-agentic-engineering/issues/new?template=runtime-adapter.yml)

请先阅读[中文贡献指南](CONTRIBUTING.zh-CN.md)。

## 治理与引用

- [CODEOWNERS](.github/CODEOWNERS) 标明仓库评审责任人，但不能绕过 CI、
  证据要求或独立评审。
- [CITATION.cff](CITATION.cff) 为 **Repository-Owned Agent Readiness
  Contract** 提供引用元数据。引用时应固定 Release 或 Commit，确保被评估
  合约可复现。
- [GitHub Sponsors](https://github.com/sponsors/lindixu6-hash) 是仓库声明的
  唯一资助渠道。资助不会影响评分、证据、评审或收录决定。

非目标：这些治理文件不代表 Agent 已通过生产安全认证，不会把自报证据变成
独立验证，也不会将资助设为参与条件。
