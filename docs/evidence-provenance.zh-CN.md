# 带 Attestation 的 Eval 证据溯源

[English](evidence-provenance.md) | [简体中文](evidence-provenance.zh-CN.md)

OpenAI Agents SDK Eval 现在拥有相互分离的 Producer 与 Verifier 路径。
Producer 执行 Runtime，并对一个确定性 Bundle 签名。由完整 Commit SHA 锁定的
Reusable Workflow 会下载该 Bundle、验证 GitHub Artifact Attestation、安全解包，
再使用更早的不可变 Verifier 检查绑定源码的 Manifest。

公开证据：

- [带 Attestation 的 Producer/Verifier 运行](https://github.com/lindixu6-hash/awesome-agentic-engineering/actions/runs/32091866197)
- Producer Bundle Artifact：`openai-agents-provenance-bundle`
- Verifier Artifact：`openai-agents-verification-evidence`
- Bundle SHA-256：
  `16baef5ae191903b1d04c1b279ce8673578a74e592af2ddc66466bf2f5f71a76`

## 信任结构

```text
Producer Commit dc540f7
  ├─ 使用 @openai/agents@0.16.1 运行 8 条 Fixture
  ├─ 加载 fail-closed 的工具权限与审批策略 Manifest
  ├─ 生成 34 个证据文件 + provenance-manifest.json
  ├─ 生成确定性 openai-agents-evidence.tar.gz
  ├─ 使用 GitHub OIDC + Sigstore 对 Bundle 签名
  └─ 上传一个 Producer Artifact
                  │
                  ▼
Reusable Verifier 锁定到 Commit 250bebc
  ├─ 检出锁定到 Commit 8efe0c9 的 Verifier 代码
  ├─ 只下载一个名称确定的 Bundle
  ├─ 验证签名 Workflow、Signer SHA、Source SHA/ref 与托管 Runner
  ├─ 证明篡改、错误 Source、错误 Workflow 与重放均无法通过
  ├─ 拒绝不安全的 Archive 路径
  ├─ 验证所有文件 Hash 与 7 个可信输入 Hash
  ├─ 校验全部 Eval Result，并拒绝任何 fail 结果
  └─ 上传 Verification Evidence
```

本次运行中，Producer 无法替换 Verifier 代码。Caller 使用：

```yaml
uses: lindixu6-hash/awesome-agentic-engineering/.github/workflows/verify-eval-evidence.yml@250bebc26eaaa3b027058ee3d68c3e1776aec668
```

该 Reusable Workflow 从以下 Commit 检出 Manifest Verifier：

```text
8efe0c970b1d37e72cac6cc73f96d6e3066309b7
```

两个 Workflow 使用的所有外部 Action 也都锁定到完整 Commit SHA。

## 绑定的值

`provenance-manifest.json` 会绑定：

- 仓库、Commit SHA、Git ref、Workflow ref 与 Workflow SHA；
- 精确的 OpenAI Agents Lockfile 与适配器源码；
- fail-closed 的工具权限 Manifest 与审批策略 Manifest；
- Fixture Pack；
- Eval Result Validator 与 JSON Schema；
- 每个回答、断言、工具 Trace、策略 Trace、Result 与 Summary 文件；
- Result 总数、通过数与失败数。

公开 Manifest 记录了 7 个可信输入、34 个证据文件与 8/8 通过结果。两份权限
策略的 SHA-256 也同时出现在 Runtime Policy Trace 和每条已执行 Tool Trace 中。
它不会删除或改写失败：只要存在任意失败的 Eval Result，Verifier 就会拒绝该
Manifest。

## Attestation 验证

Verifier 会执行以下约束：

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

已验证的证书与透明日志记录会绑定：

- `Attested OpenAI Agents Eval` Workflow 路径；
- Commit 与 Workflow Digest
  `dc540f763ca7efdf3239b2c55a7db0d5ea88a532`；
- `refs/heads/main`；
- GitHub 托管 Runner；
- 公开仓库身份；
- Workflow Run `32091866197`；
- 上述 Bundle Digest；
- Rekor 透明日志时间戳。

## 负向证据

Reusable Verifier 必须观察到以下四次失败：

1. 在已签名 Bundle 末尾追加一个字节，确认 Attestation 验证失败；
2. 使用全零 Source Digest 验证原始 Bundle，确认身份验证失败；
3. 使用另一条 Signer Workflow 路径验证，确认 Workflow 身份验证失败；
4. 先使用原始 Commit 验证永久保留的
   [v0.14.0 已签名 Bundle](https://github.com/lindixu6-hash/awesome-agentic-engineering/releases/download/v0.14.0/openai-agents-evidence.tar.gz)，
   再确认它不能满足当前 Source Digest。

本地测试还会拒绝：

- 任意被修改的证据文件；
- 不一致的 Source Commit；
- 包含失败 Eval Result 的套件。

## 可以证明什么

对于这一次精确运行：具有声明身份的 GitHub 托管 Workflow 对声明的 Bundle
Digest 完成了签名；由 SHA 锁定的 Reusable Verifier 观察到了相同 Bundle、
Source Identity、可信输入、证据 Hash 与 Eval Result。证据还可以证明这次运行的
确定性 Adapter 加载了哪两份精确的工具权限和审批策略文件。

## 不能证明什么

- 它不能证明 Agent、模型、策略或 SDK 普遍安全。
- 它不能证明另一套 Runtime 或生产部署执行了同一权限策略。
- 它不能证明被 Attest 的文件在语义上正确。
- 它不能证明未来运行会得到相同结果。
- 它不能阻止仓库管理员在后续版本修改 Producer Workflow 或 Verifier 引用。
- 生成本次证据时，仓库 `main` 分支没有 Branch Protection。Attestation 能证明
  Workflow 与 Commit 身份，但不能证明独立代码审核或分支治理已强制执行。
- Producer Workflow 仍然决定构建和 Attest 哪些字节。GitHub 签名证书字段与
  透明日志时间戳，比 Producer 可控制的 Predicate Metadata 更可信。
- 这不是 SLSA 等级声明。更强的设计需要把构建与签名迁移到独立治理的
  Reusable Builder。

应把它理解为一条范围严格的 Provenance 声明：**这个可信 Verifier 观察到了来自
这个精确 Workflow 与 Commit 的这些精确 Artifact**。
