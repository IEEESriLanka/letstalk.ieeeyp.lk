import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import ts from "typescript";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { getPublishedComments, speakerCommentsSchema } from "../src/lib/testimonials.ts";

const comment = { id: "bfbe311a-d7de-4d0e-8f10-81029d11d312", name: " Speaker ", designation: " Engineer ", comment: " A useful conversation. ", imageUrl: "", published: true };

const source = await readFile(new URL("../src/components/site/speaker-comments.tsx", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText
  .replace(/from "([^"]+)"/g, (_, specifier) => `from ${JSON.stringify(specifier === "@/lib/testimonials" ? new URL("../src/lib/testimonials.ts", import.meta.url).href : import.meta.resolve(specifier))}`);
const { SpeakerComments } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);

test("carousel server-renders genuine published comments safely and hides an empty section", () => {
  assert.equal(renderToStaticMarkup(createElement(SpeakerComments, { comments: undefined })), "");
  assert.equal(renderToStaticMarkup(createElement(SpeakerComments, { comments: [{ ...comment, published: false }] })), "");
  const html = renderToStaticMarkup(createElement(SpeakerComments, { comments: [{ ...comment, comment: "<script>alert('test')</script>" }] }));
  assert.match(html, /Speaker/);
  assert.match(html, /Engineer/);
  assert.match(html, /&lt;script&gt;/);
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /rounded-\[5px\]/);
});

test("old, empty, and malformed content cannot break the optional section", () => {
  for (const input of [undefined, null, {}, "bad", [], [null, {}, { ...comment, name: " " }]]) {
    assert.deepEqual(getPublishedComments(input), []);
  }
});
test("only valid published cards display, in admin order, with trimmed text", () => {
  const second = { ...comment, id: "cfbe311a-d7de-4d0e-8f10-81029d11d312", name: "Second" };
  const results = getPublishedComments([comment, { ...second, published: false }, second, comment]);
  assert.deepEqual(results.map((item) => item.name), ["Speaker", "Second"]);
  assert.equal(results[0].comment, "A useful conversation.");
});
test("invalid photos, blank or oversized content, duplicate IDs and excess cards cannot publish", () => {
  for (const input of [
    [{ ...comment, imageUrl: "javascript:alert(1)" }],
    [{ ...comment, imageUrl: "http://example.com/photo.jpg" }],
    [{ ...comment, designation: " " }],
    [{ ...comment, comment: "x".repeat(1201) }],
    [comment, comment],
    Array.from({ length: 31 }, () => comment),
  ]) assert.equal(speakerCommentsSchema.safeParse(input).success, false);
  assert.equal(speakerCommentsSchema.safeParse([]).success, true);
});
