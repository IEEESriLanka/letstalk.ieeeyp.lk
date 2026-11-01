import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { defaultEventsHero, eventsHeroSchema, getEventsHero, getEventsHeroSlides, getEventsHeroDraftSlides, withEventsHeroSlides } from "../src/lib/events-hero.ts";

async function compile(relativePath, aliases = {}) {
  const source = await readFile(new URL(relativePath, import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText
    .replace(/from "([^"]+)"/g, (_, specifier) => `from ${JSON.stringify(aliases[specifier] ?? import.meta.resolve(specifier))}`);
  return `data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`;
}
const { EventsHero } = await import(await compile("../src/components/site/events-hero.tsx", {
  "@/lib/events-hero": new URL("../src/lib/events-hero.ts", import.meta.url).href,
}));

test("older content and invalid optional hero settings render a safe text hero", () => {
  for (const value of [undefined, null, {}, { title: "" }]) {
    assert.deepEqual(getEventsHero(value), defaultEventsHero);
    const html = renderToStaticMarkup(createElement(EventsHero, { content: value }));
    assert.match(html, /Ideas meet opportunity/);
    assert.match(html, /href="#event-list"/);
    assert.doesNotMatch(html, /<img/);
  }
});

test("admin text and ordered photos survive validation and render immediately", () => {
  const content = eventsHeroSchema.parse({ title: "Our new events", description: "Join <our> workshops.", images: ["https://example.com/first.jpg", "https://example.com/second.jpg"] });
  const html = renderToStaticMarkup(createElement(EventsHero, { content }));
  assert.match(html, /Our new events/);
  assert.match(html, /Join &lt;our&gt; workshops/);
  assert.ok(html.indexOf("first.jpg") < html.indexOf("second.jpg"));
  assert.match(html, /Show photo 2/);
});

test("unsafe image URLs, excess photos, blank and oversized text cannot publish", () => {
  for (const changes of [
    { images: ["javascript:alert(1)"] },
    { images: ["http://example.com/photo.jpg"] },
    { images: Array(9).fill("https://example.com/photo.jpg") },
    { title: " " },
    { description: "x".repeat(601) },
  ]) assert.equal(eventsHeroSchema.safeParse({ ...defaultEventsHero, ...changes }).success, false);
});

test("per-photo content stays paired when reordered or removed, with compatible defaults", () => {
  const original = eventsHeroSchema.parse({ ...defaultEventsHero,
    images: ["https://example.com/one.jpg", "https://example.com/two.jpg"],
    imageContent: [{ title: "First talk", description: "First description" }, { title: "Second talk", description: "" }],
  });
  const reversed = withEventsHeroSlides(original, getEventsHeroDraftSlides(original).reverse());
  assert.equal(getEventsHeroSlides(reversed)[0].imageUrl, "https://example.com/two.jpg");
  assert.equal(getEventsHeroSlides(reversed)[0].title, "Second talk");
  assert.equal(getEventsHeroSlides(reversed)[0].description, defaultEventsHero.description);
  const removed = withEventsHeroSlides(reversed, getEventsHeroDraftSlides(reversed).slice(1));
  assert.equal(getEventsHeroSlides(removed)[0].title, "First talk");
  assert.equal(getEventsHeroSlides({ ...defaultEventsHero, images: original.images })[0].title, defaultEventsHero.title);
  const html = renderToStaticMarkup(createElement(EventsHero, { content: original }));
  assert.match(html, /id="events-hero-heading"[^>]*>First talk/);
  assert.match(html, /aria-hidden="true"[^>]*[\s\S]*Second talk/);
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
  assert.match(html, /duration-700/);
});
