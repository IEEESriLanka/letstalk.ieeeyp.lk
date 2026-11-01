import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import ts from "typescript";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { journeyEvents, journeyWindow } from "../src/lib/journey-events.ts";

const event = { title: "A journey session", description: "Full event description. ".repeat(20), tag: "IEEE", icon: "mic", badge: "Colombo", dateLabel: "2026-01-01" };

test("journey filters valid past events by year and sorts newest first", () => {
  const events = [event, { ...event, dateLabel: "2026-02-30" }, { ...event, dateLabel: "2026-09-01" }, { ...event, dateLabel: "2026-12-20" }, { ...event, dateLabel: "2025-12-01" }, { ...event, dateLabel: "not-a-date" }];
  assert.deepEqual(journeyEvents(events, "2026", "2026-11-01").map((item) => item.dateLabel), ["2026-09-01", "2026-01-01"]);
});

test("navigation renders at most three unique cards and wraps around with the active card centered", () => {
  for (let count = 0; count <= 8; count++) {
    const events = Array.from({ length: count }, (_, index) => index);
    for (let active = 0; active < Math.max(count, 1); active++) {
      const visible = journeyWindow(events, active);
      assert.equal(visible.length, Math.min(3, count));
      assert.equal(new Set(visible.map((item) => item.index)).size, visible.length);
      if (count >= 3) assert.equal(visible[1].index, active);
    }
  }
});

async function compile(path, aliases = {}) {
  const source = await readFile(new URL(path, import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText.replace(/from "([^"]+)"/g, (_, specifier) => `from ${JSON.stringify(aliases[specifier] ?? import.meta.resolve(specifier))}`);
  return `data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`;
}
const dialog = await compile("../src/components/ui/dialog.tsx", { "@/lib/utils": new URL("../src/lib/utils.ts", import.meta.url).href });
const { PastSessions } = await import(await compile("../src/components/site/journey-carousel.tsx", {
  "@/components/ui/dialog": dialog,
  "@/lib/journey-events": new URL("../src/lib/journey-events.ts", import.meta.url).href,
}));

test("journey renders only three cards with images, clipped previews and accessible popup triggers", () => {
  const events = Array.from({ length: 6 }, (_, index) => ({ ...event, title: `Session ${index}`, imageUrl: `https://example.com/${index}.jpg` }));
  const html = renderToStaticMarkup(createElement(PastSessions, { events }));
  assert.equal((html.match(/<article\b/g) ?? []).length, 3);
  assert.equal((html.match(/aria-haspopup="dialog"/g) ?? []).length, 3);
  assert.match(html, /line-clamp-3/);
  assert.match(html, /Read more/);
  assert.match(html, /https:\/\/example.com\/1.jpg/);
  const empty = renderToStaticMarkup(createElement(PastSessions, { events: [] }));
  assert.match(empty, /No past events published/);
  assert.doesNotMatch(empty, /<article\b/);
});
