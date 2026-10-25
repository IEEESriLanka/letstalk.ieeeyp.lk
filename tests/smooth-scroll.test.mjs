import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const source = await readFile(new URL("../src/components/site/smooth-scroll.tsx", import.meta.url), "utf8");
const compiled = ts.transpileModule(source.replace(/^import .*;\r?\n/gm, ""), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText;

function fixture({ reduced = false, path = "/", locked = false, nested = false } = {}) {
  const listeners = new Map();
  const calls = [];
  const frames = new Map();
  let frameId = 0;
  let time = 1000;
  let cleanup;
  class Element {
    parentElement = null;
    scrollHeight = nested ? 300 : 0;
    clientHeight = 100;
    matches() { return false; }
  }
  const root = { scrollHeight: 3000 };
  const body = {};
  const window = {
    location: { pathname: path }, scrollY: 100, innerHeight: 800,
    matchMedia: () => ({ matches: reduced }),
    addEventListener: (name, callback) => listeners.set(name, callback),
    removeEventListener: (name) => listeners.delete(name),
    scrollTo: (options) => { calls.push(options); window.scrollY = options.top; },
    requestAnimationFrame: (callback) => { frames.set(++frameId, callback); return frameId; },
    cancelAnimationFrame: (id) => frames.delete(id),
  };
  const context = {
    exports: {}, window, document: { body, documentElement: root }, Element,
    performance: { now: () => time },
    getComputedStyle: (element) => ({ overflowY: element === body && locked ? "hidden" : nested && element instanceof Element ? "auto" : "visible" }),
    useLocation: () => path,
    useEffect: (callback) => { cleanup = callback(); },
  };
  vm.runInNewContext(compiled, context);
  context.exports.SmoothScroll();
  let prevented = false;
  const wheel = (overrides = {}) => listeners.get("wheel")?.({
    deltaY: 100, deltaX: 0, deltaMode: 0, cancelable: true,
    target: new Element(), preventDefault: () => { prevented = true; }, ...overrides,
  });
  const step = (milliseconds = 16) => {
    time += milliseconds;
    const callbacks = [...frames.values()];
    frames.clear();
    callbacks.forEach((callback) => callback(time));
  };
  const flush = () => { for (let i = 0; frames.size && i < 200; i++) step(); };
  return { wheel, calls, listeners, frames, step, flush, cleanup: () => cleanup?.(), prevented: () => prevented };
}

test("smooths wheel bursts, clamps to the page, and removes listeners", () => {
  const f = fixture();
  f.wheel(); f.wheel();
  assert.equal(f.frames.size, 1);
  f.step();
  assert.ok(f.calls[0].top > 100 && f.calls[0].top < 200);
  f.flush();
  assert.equal(f.calls.at(-1).top, 300);
  f.wheel({ deltaY: 10000 });
  f.flush();
  assert.equal(f.calls.at(-1).top, 2200);
  assert.equal(f.prevented(), true);
  f.cleanup();
  assert.equal(f.listeners.size, 0);
  assert.equal(f.frames.size, 0);
});

test("reversing the wheel responds immediately and user input cancels animation", () => {
  const f = fixture();
  f.wheel(); f.step();
  const before = f.calls.at(-1).top;
  f.wheel({ deltaY: -100 }); f.step();
  assert.ok(f.calls.at(-1).top < before);
  f.listeners.get("pointerdown")();
  const count = f.calls.length;
  f.flush();
  assert.equal(f.calls.length, count);
  f.wheel();
  f.cleanup();
  assert.equal(f.frames.size, 0);
});

test("preserves reduced motion, admin pages, locked dialogs, and nested scrolling", () => {
  for (const options of [{ reduced: true }, { path: "/admin" }, { locked: true }, { nested: true }]) {
    const f = fixture(options); f.wheel();
    assert.equal(f.calls.length, 0);
    assert.equal(f.prevented(), false);
  }
});

test("leaves trackpad deltas, zoom, horizontal, and handled events native", () => {
  for (const event of [{ deltaY: 5 }, { ctrlKey: true }, { metaKey: true }, { shiftKey: true }, { deltaX: 200 }, { defaultPrevented: true }, { cancelable: false }]) {
    const f = fixture(); f.wheel(event);
    assert.equal(f.calls.length, 0);
    assert.equal(f.prevented(), false);
  }
});
