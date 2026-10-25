import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const source = await readFile(new URL("../src/lib/scroll-utils.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;

function fixture({ reduced = false, mounted = true } = {}) {
  const frames = new Map();
  const listeners = new Map();
  const calls = [];
  let sequence = 0;
  const window = {
    scrollY: 200,
    requestAnimationFrame: (callback) => { frames.set(++sequence, callback); return sequence; },
    cancelAnimationFrame: (id) => frames.delete(id),
    addEventListener: (type, callback) => listeners.set(type, callback),
    removeEventListener: (type, callback) => { if (listeners.get(type) === callback) listeners.delete(type); },
    matchMedia: () => ({ matches: reduced }),
    scrollTo: (options) => calls.push(options),
  };
  const context = { exports: {}, window, document: {
    getElementById: (id) => mounted ? { getBoundingClientRect: () => ({ top: id === "contact-content" ? 628 : 500 }) } : null,
    querySelector: () => ({ getBoundingClientRect: () => ({ bottom: 80 }) }),
  } };
  vm.runInNewContext(compiled, context);
  const flush = () => {
    for (let i = 0; frames.size && i < 100; i++) {
      const batch = [...frames.values()];
      frames.clear();
      batch.forEach((callback) => callback());
    }
  };
  return { scroll: context.exports.scrollToHash, calls, frames, listeners, flush };
}

test("scrolls once below the navigation without follow-up corrections", () => {
  const f = fixture(); f.scroll("#events"); f.flush();
  assert.equal(f.calls.length, 1);
  assert.equal(f.calls[0].top, 604);
  assert.equal(f.calls[0].behavior, "smooth");
  assert.equal(f.listeners.size, 0);
});

test("respects reduced motion and explicit instant scrolling", () => {
  for (const reduced of [true, false]) {
    const f = fixture({ reduced }); f.scroll("#events", !reduced ? false : true); f.flush();
    assert.equal(f.calls[0].behavior, "instant");
  }
});

test("Contact Us lands on the content row below the fixed navigation instantly", () => {
  const f = fixture(); f.scroll("#contact", false); f.flush();
  assert.equal(f.calls.length, 1);
  assert.equal(f.calls[0].top, 732);
  assert.equal(f.calls[0].behavior, "instant");
});

test("new navigation supersedes pending work and top reaches page start", () => {
  const f = fixture(); f.scroll("#events"); f.scroll("#top"); f.flush();
  assert.equal(f.calls.length, 1); assert.equal(f.calls[0].top, 0);
});

test("user input and route cleanup cancel a pending navigation", () => {
  for (const action of ["wheel", "touchstart", "keydown", "cleanup"]) {
    const f = fixture(); const cancel = f.scroll("#events");
    if (action === "cleanup") cancel(); else f.listeners.get(action)();
    f.flush(); assert.equal(f.calls.length, 0); assert.equal(f.listeners.size, 0);
  }
});

test("missing targets stop retrying and malformed hashes are ignored", () => {
  const f = fixture({ mounted: false }); f.scroll("#missing"); f.flush();
  assert.equal(f.frames.size, 0); assert.equal(f.listeners.size, 0); assert.equal(f.calls.length, 0);
  f.scroll("#%invalid"); f.flush(); assert.equal(f.calls.length, 0);
});
