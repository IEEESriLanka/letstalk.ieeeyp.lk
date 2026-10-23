import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import ts from "typescript";
import { z } from "zod";

// Run the real submission flow with fake transports: no live messages or emails.
const source = await readFile(new URL("../src/lib/content-store.ts", import.meta.url), "utf8");
const input = { name: " Visitor ", email: " visitor@example.com ", topic: "Partnership", message: "Hello <team>\nLet's talk." };
let sequence = 0;
async function fixture({ databaseError = null, emailStatus = 200, configured = true } = {}) {
  const writes = [];
  const emails = [];
  const key = `__contactTest${sequence++}`;
  globalThis[key] = {
    z,
    createClient: () => ({ from: (table) => ({ insert: async (row) => {
      writes.push({ table, row });
      return { error: databaseError };
    } }) }),
    fetch: async (url, options) => {
      emails.push({ url, ...options, body: JSON.parse(options.body) });
      return new Response('{}', { status: emailStatus });
    },
    process: { env: { SUPABASE_URL: "https://example.test", VITE_SUPABASE_PUBLISHABLE_KEY: "test-key", ...(configured ? { RESEND_API_KEY: "test-only", RESEND_FROM_EMAIL: "LETs Talk <contact@example.com>" } : {}) } },
  };
  const mocked = source
    .replace(/import .*? from "@supabase\/supabase-js";/, `const { createClient, fetch, process, z } = globalThis.${key};`)
    .replace(/import .*? from "zod";/, "")
    .replace(/import .*? from "\.\/site-content";/, "const defaultSiteContent = {};");
  const compiled = ts.transpileModule(mocked, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
  const api = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
  return { api, writes, emails, cleanup: () => delete globalThis[key] };
}

test("stores an unread inbox message with a UUID, then emails the team with visitor Reply-To", async () => {
  const f = await fixture();
  try {
    assert.deepEqual(await f.api.addContactMessage(input), { ok: true, emailSent: true });
    assert.equal(f.writes[0].table, "contact_messages");
    assert.match(f.writes[0].row.id, /^[0-9a-f-]{36}$/);
    assert.equal(f.writes[0].row.name, "Visitor");
    assert.equal(f.emails[0].body.reply_to, "visitor@example.com");
    assert.deepEqual(f.emails[0].body.to, ["ieeeletstalksl@gmail.com"]);
    assert.match(f.emails[0].body.html, /&lt;team&gt;<br \/>/);
    assert.equal(f.emails[0].body.from, "LETs Talk <contact@example.com>");
  } finally { f.cleanup(); }
});

test("does not send an email when saving fails, and hides database details", async () => {
  const f = await fixture({ databaseError: { code: "42501", message: "private detail" } });
  try {
    await assert.rejects(f.api.addContactMessage(input), /Your message could not be saved/);
    assert.equal(f.emails.length, 0);
  } finally { f.cleanup(); }
});

test("preserves the saved message when email is unconfigured or the provider fails", async () => {
  for (const options of [{ configured: false }, { emailStatus: 503 }]) {
    const f = await fixture(options);
    try {
      assert.deepEqual(await f.api.addContactMessage(input), { ok: true, emailSent: false });
      assert.equal(f.writes.length, 1);
    } finally { f.cleanup(); }
  }
});

test("rejects blank, oversized, invalid-email and header-injection submissions before writing", async () => {
  const f = await fixture();
  try {
    for (const invalid of [{ name: "  " }, { email: "bad" }, { topic: "Bad\r\nSubject" }, { message: " " }, { message: "x".repeat(3001) }]) {
      await assert.rejects(f.api.addContactMessage({ ...input, ...invalid }));
    }
    assert.equal(f.writes.length, 0);
    assert.equal(f.emails.length, 0);
  } finally { f.cleanup(); }
});
