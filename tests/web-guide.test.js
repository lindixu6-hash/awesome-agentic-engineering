import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);

function read(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), "utf8");
}

function structuredData(html) {
  const match = html.match(
    /<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/
  );
  assert.ok(match, "expected JSON-LD structured data");
  return JSON.parse(match[1]);
}

test("English and Chinese guides expose reciprocal search metadata", () => {
  const english = read("web/guide/index.html");
  const chinese = read("web/zh/guide/index.html");

  assert.match(
    english,
    /rel="canonical"\s+href="https:\/\/lindixu6-hash\.github\.io\/awesome-agentic-engineering\/guide\/"/
  );
  assert.match(
    chinese,
    /rel="canonical"\s+href="https:\/\/lindixu6-hash\.github\.io\/awesome-agentic-engineering\/zh\/guide\/"/
  );
  assert.match(english, /hreflang="zh-CN"/);
  assert.match(chinese, /hreflang="en"/);
  assert.match(english, /AI Agent Production Readiness Checklist/);
  assert.match(chinese, /AI Agent 生产就绪检查清单/);
});

test("guide structured data identifies both localized TechArticles", () => {
  const english = structuredData(read("web/guide/index.html"));
  const chinese = structuredData(read("web/zh/guide/index.html"));

  assert.equal(english["@type"], "TechArticle");
  assert.equal(english.inLanguage, "en");
  assert.equal(chinese["@type"], "TechArticle");
  assert.equal(chinese.inLanguage, "zh-CN");
  assert.equal(english.dateModified, "2026-08-17");
  assert.equal(chinese.dateModified, "2026-08-17");
});

test("LangGraph eval pages expose reciprocal metadata and verified evidence", () => {
  const english = read("web/langgraph-eval/index.html");
  const chinese = read("web/zh/langgraph-eval/index.html");

  assert.match(
    english,
    /rel="canonical"\s+href="https:\/\/lindixu6-hash\.github\.io\/awesome-agentic-engineering\/langgraph-eval\/"/
  );
  assert.match(
    chinese,
    /rel="canonical"\s+href="https:\/\/lindixu6-hash\.github\.io\/awesome-agentic-engineering\/zh\/langgraph-eval\/"/
  );
  assert.match(english, /hreflang="zh-CN"/);
  assert.match(chinese, /hreflang="en"/);
  assert.match(english, /LangGraph Prompt Injection Eval/);
  assert.match(chinese, /LangGraph 提示注入 Eval/);
  assert.match(english, /31975175069/);
  assert.match(chinese, /31975175069/);
  assert.match(english, /8\/8/);
  assert.match(chinese, /8\/8/);
  assert.match(english, /does not prove arbitrary LangGraph applications/);
  assert.match(chinese, /不能证明任意 LangGraph 应用都安全/);
});

test("LangGraph eval structured data identifies both localized TechArticles", () => {
  const english = structuredData(read("web/langgraph-eval/index.html"));
  const chinese = structuredData(read("web/zh/langgraph-eval/index.html"));

  assert.equal(english["@type"], "TechArticle");
  assert.equal(english.inLanguage, "en");
  assert.equal(chinese["@type"], "TechArticle");
  assert.equal(chinese.inLanguage, "zh-CN");
  assert.match(english.headline, /LangGraph Prompt Injection Eval/);
  assert.match(chinese.headline, /LangGraph 提示注入 Eval/);
});

test("OpenAI Agents eval pages expose reciprocal metadata and evidence limits", () => {
  const english = read("web/openai-agents-eval/index.html");
  const chinese = read("web/zh/openai-agents-eval/index.html");

  assert.match(
    english,
    /rel="canonical"\s+href="https:\/\/lindixu6-hash\.github\.io\/awesome-agentic-engineering\/openai-agents-eval\/"/
  );
  assert.match(
    chinese,
    /rel="canonical"\s+href="https:\/\/lindixu6-hash\.github\.io\/awesome-agentic-engineering\/zh\/openai-agents-eval\/"/
  );
  assert.match(english, /hreflang="zh-CN"/);
  assert.match(chinese, /hreflang="en"/);
  assert.match(english, /OpenAI Agents SDK Prompt Injection Eval/);
  assert.match(chinese, /OpenAI Agents SDK 提示注入 Eval/);
  assert.match(english, /8\/8/);
  assert.match(chinese, /8\/8/);
  assert.match(english, /32091866197/);
  assert.match(chinese, /32091866197/);
  assert.match(
    english,
    /16baef5ae191903b1d04c1b279ce8673578a74e592af2ddc66466bf2f5f71a76/
  );
  assert.match(english, /wrong-workflow/);
  assert.match(chinese, /错误 Workflow/);
  assert.match(chinese, /没有\s+Branch Protection/);
  assert.match(
    english,
    /does not prove arbitrary OpenAI Agents SDK applications/
  );
  assert.match(chinese, /不能证明任意 OpenAI Agents SDK 应用都安全/);
  assert.match(english, /provider network access/);
  assert.match(chinese, /Provider 网络访问/);
});

test("OpenAI Agents eval structured data identifies localized TechArticles", () => {
  const english = structuredData(read("web/openai-agents-eval/index.html"));
  const chinese = structuredData(
    read("web/zh/openai-agents-eval/index.html")
  );

  assert.equal(english["@type"], "TechArticle");
  assert.equal(english.inLanguage, "en");
  assert.equal(chinese["@type"], "TechArticle");
  assert.equal(chinese.inLanguage, "zh-CN");
  assert.match(english.headline, /OpenAI Agents SDK Prompt Injection Eval/);
  assert.match(chinese.headline, /OpenAI Agents SDK 提示注入 Eval/);
});

test("sitemap and robots expose every public Pages entry", () => {
  const sitemap = read("web/sitemap.xml");
  const robots = read("web/robots.txt");

  assert.match(sitemap, /awesome-agentic-engineering\/<\/loc>/);
  assert.match(sitemap, /awesome-agentic-engineering\/guide\/<\/loc>/);
  assert.match(sitemap, /awesome-agentic-engineering\/zh\/guide\/<\/loc>/);
  assert.match(
    sitemap,
    /awesome-agentic-engineering\/langgraph-eval\/<\/loc>/
  );
  assert.match(
    sitemap,
    /awesome-agentic-engineering\/zh\/langgraph-eval\/<\/loc>/
  );
  assert.match(
    sitemap,
    /awesome-agentic-engineering\/openai-agents-eval\/<\/loc>/
  );
  assert.match(
    sitemap,
    /awesome-agentic-engineering\/zh\/openai-agents-eval\/<\/loc>/
  );
  assert.match(sitemap, /hreflang="zh-CN"/);
  assert.match(
    robots,
    /Sitemap: https:\/\/lindixu6-hash\.github\.io\/awesome-agentic-engineering\/sitemap\.xml/
  );
});

test("Pages build copies the complete web tree", () => {
  const workflow = read(".github/workflows/pages.yml");

  assert.match(workflow, /cp -R web\/\. _site\//);
  assert.match(workflow, /cp -R starters _site\/starters/);
  assert.match(workflow, /- "starters\/\*\*"/);
});

test("scorecard and guides link to the LangGraph eval pages", () => {
  assert.match(read("web/index.html"), /href="langgraph-eval\/"/);
  assert.match(read("web/guide/index.html"), /href="\.\.\/langgraph-eval\/"/);
  assert.match(
    read("web/zh/guide/index.html"),
    /href="\.\.\/langgraph-eval\/"/
  );
});

test("guides and runtime pages cross-link the OpenAI Agents eval", () => {
  assert.match(
    read("web/guide/index.html"),
    /href="\.\.\/openai-agents-eval\/"/
  );
  assert.match(
    read("web/zh/guide/index.html"),
    /href="\.\.\/openai-agents-eval\/"/
  );
  assert.match(
    read("web/langgraph-eval/index.html"),
    /href="\.\.\/openai-agents-eval\/"/
  );
  assert.match(
    read("web/zh/langgraph-eval/index.html"),
    /href="\.\.\/openai-agents-eval\/"/
  );
});

test("bilingual guides expose all fail-closed starter downloads", () => {
  const english = read("web/guide/index.html");
  const chinese = read("web/zh/guide/index.html");

  for (const profile of ["read-only", "draft-only", "state-changing"]) {
    assert.match(
      english,
      new RegExp(`\\.\\./starters/${profile}/agent-card\\.json`)
    );
    assert.match(
      english,
      new RegExp(`\\.\\./starters/${profile}/agent-readiness\\.yml`)
    );
    assert.match(
      chinese,
      new RegExp(`\\.\\./\\.\\./starters/${profile}/agent-card\\.json`)
    );
    assert.match(
      chinese,
      new RegExp(`\\.\\./\\.\\./starters/${profile}/agent-readiness\\.yml`)
    );
  }
  assert.match(english, /byte-equivalent to/);
  assert.match(chinese, /逐字节一致/);
});

test("public pages advertise the LLM-readable project index", () => {
  for (const relativePath of [
    "web/index.html",
    "web/guide/index.html",
    "web/zh/guide/index.html",
    "web/langgraph-eval/index.html",
    "web/zh/langgraph-eval/index.html",
    "web/openai-agents-eval/index.html",
    "web/zh/openai-agents-eval/index.html"
  ]) {
    const html = read(relativePath);
    assert.match(html, /type="text\/plain"/);
    assert.match(
      html,
      /href="https:\/\/lindixu6-hash\.github\.io\/awesome-agentic-engineering\/llms\.txt"/
    );
  }
});

test("llms.txt exposes bilingual contracts, evidence, commands, and limits", () => {
  const index = read("web/llms.txt");

  assert.match(index, /^# Awesome Agentic Engineering/m);
  assert.match(index, /## Start Here/);
  assert.match(index, /生产就绪指南（简体中文）/);
  assert.match(index, /## Machine-Readable Contracts/);
  assert.match(index, /## Downloadable Fail-Closed Starters/);
  assert.match(index, /starters\/state-changing\/agent-card\.json/);
  assert.match(index, /schema\/agent-card\.schema\.json/);
  assert.match(index, /evals\/prompt-injection\/fixtures\.jsonl/);
  assert.match(index, /## Executable Adapters/);
  assert.match(index, /langgraph-eval\//);
  assert.match(index, /openai-agents-eval\//);
  assert.match(index, /eval:openai-agents/);
  assert.match(index, /## Evidence/);
  assert.match(index, /31975175069/);
  assert.match(index, /31980983499/);
  assert.match(index, /32091866197/);
  assert.match(
    index,
    /16baef5ae191903b1d04c1b279ce8673578a74e592af2ddc66466bf2f5f71a76/
  );
  assert.match(index, /31974318431/);
  assert.match(index, /agentic-init --profile read-only/);
  assert.match(index, /## Interpretation Limits/);
  assert.match(index, /not artifact\s+authenticity or agent safety/);
  assert.match(index, /Do not infer external production adoption/);
  assert.match(index, /reserved `\.example` domains/);
});
