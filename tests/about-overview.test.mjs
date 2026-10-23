import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

test("About Us renders edited heading and introduction from content", async () => {
  const source = await readFile(new URL("../src/components/site/about-overview.tsx", import.meta.url), "utf8");
  // Mock decorative dependencies; render the real component with saved CMS values.
  globalThis.__aboutOverviewTest = { React };
  try {
    const isolated = source.replace(/^import .*;\r?\n/gm, "");
    const compiled = ts.transpileModule(`
      const { React } = globalThis.__aboutOverviewTest;
      const ArrowRight = () => null;
      const useReducedMotion = () => true;
      const motion = new Proxy({}, { get: (_, tag) => ({ children }) => React.createElement(tag, null, children) });
      ${isolated}
    `, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.React } }).outputText;
    const { AboutOverview } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
    const about = { eyebrow: "Updated eyebrow", title: "Updated heading", highlightedWords: "Updated highlight", accentWords: "Updated accent", copy: "Updated introduction from admin." };
    const render = (content) => renderToStaticMarkup(React.createElement(AboutOverview, { content }));
    const html = render(about);
    for (const value of Object.values(about)) assert.ok(html.includes(value), `Missing edited content: ${value}`);
    assert.ok(!html.includes("Since 2017"));
    const updatedHtml = render({ ...about, copy: "Second saved introduction." });
    assert.ok(updatedHtml.includes("Second saved introduction."));
    assert.ok(!updatedHtml.includes(about.copy));
  } finally {
    delete globalThis.__aboutOverviewTest;
  }
});
