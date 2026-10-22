import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import ts from "typescript";
import { isSuperAdmin, superAdminEmail } from "../src/lib/super-admin.ts";

// Exercise the actual server functions with a fake Supabase transport. No
// production users or credentials are touched by these tests.
const source = await readFile(new URL("../src/lib/admin-accounts.server.ts", import.meta.url), "utf8");
let fixtureId = 0;
async function fixture({ role = "super_admin", email = superAdminEmail, confirmed = true, targetRole = "admin", authenticated = true, authError = null } = {}) {
  const writes = [];
  let lookups = 0;
  const client = {
    auth: {
      getUser: async () => ({ data: { user: authenticated ? { id: "owner", email, email_confirmed_at: confirmed ? "2026-01-01" : null } : null }, error: authError }),
      admin: {
        deleteUser: async (id) => { writes.push(["deleteUser", id]); return { error: null }; },
        createUser: async () => { writes.push(["createUser"]); return { data: { user: { id: "new-user", email: "new@example.com" } }, error: null }; },
      },
    },
    from: () => {
      lookups++;
      const query = {
        select: () => query, eq: () => query, neq: () => query,
        maybeSingle: async () => ({ data: { role }, error: null }),
        single: async () => ({ data: { id: "member", user_id: "other-user", role: targetRole }, error: null }),
        update: (value) => { writes.push(["update", value]); return query; },
        delete: () => { writes.push(["deleteMembership"]); return query; },
        insert: (value) => { writes.push(["insert", value]); return query; },
      };
      return query;
    },
  };
  const key = `__adminTest${fixtureId++}`;
  globalThis[key] = { createClient: () => client, isSuperAdmin, superAdminEmail };
  const mocked = source.replace(/import .*? from "@supabase\/supabase-js";/, `const { createClient } = globalThis.${key};`)
    .replace(/import .*? from "\.\/super-admin";/, `const { isSuperAdmin, superAdminEmail } = globalThis.${key};`);
  const compiled = ts.transpileModule(mocked, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
  const oldUrl = process.env.SUPABASE_URL;
  const oldKey = process.env.SUPABASE_SECRET_KEY;
  process.env.SUPABASE_URL = "https://example.test";
  process.env.SUPABASE_SECRET_KEY = "test-only";
  const api = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
  return { api, writes, lookups: () => lookups, cleanup: () => {
    delete globalThis[key];
    if (oldUrl === undefined) delete process.env.SUPABASE_URL; else process.env.SUPABASE_URL = oldUrl;
    if (oldKey === undefined) delete process.env.SUPABASE_SECRET_KEY; else process.env.SUPABASE_SECRET_KEY = oldKey;
  } };
}

test("server rejects non-owner, ordinary, unconfirmed and unauthenticated callers", async () => {
  for (const options of [{ role: "admin" }, { role: "editor" }, { email: "other@example.com" }, { confirmed: false }, { authenticated: false }]) {
    const f = await fixture(options);
    try {
      await assert.rejects(() => f.api.listAdminAccounts("token"));
      await assert.rejects(() => f.api.createAdminAccount("token", { email: "new@example.com", password: "temporary-test-password", role: "admin" }));
      await assert.rejects(() => f.api.deleteAdminAccount("token", "member"));
      await assert.rejects(() => f.api.updateAdminRole("token", "member", "editor"));
      assert.deepEqual(f.writes, []);
    } finally { f.cleanup(); }
  }
});
test("even the owner cannot delete or demote the super admin", async () => {
  const f = await fixture({ targetRole: "super_admin" });
  try {
    await assert.rejects(() => f.api.deleteAdminAccount("token", "protected"), /cannot be removed/);
    await assert.rejects(() => f.api.updateAdminRole("token", "protected", "editor"), /cannot be changed/);
    assert.deepEqual(f.writes, []);
  } finally { f.cleanup(); }
});
test("owner can change an ordinary member role and remove their account", async () => {
  const f = await fixture();
  try {
    await f.api.updateAdminRole("token", "member", "editor");
    await f.api.deleteAdminAccount("token", "member");
    assert.deepEqual(f.writes, [["update", { role: "editor" }], ["deleteUser", "other-user"], ["deleteMembership"]]);
  } finally { f.cleanup(); }
});
test("server rejects super-admin provisioning and invalid role changes", async () => {
  const f = await fixture();
  try {
    await assert.rejects(() => f.api.createAdminAccount("token", { email: superAdminEmail, password: "temporary-test-password", role: "admin" }), /protected/);
    await assert.rejects(() => f.api.createAdminAccount("token", { email: "new@example.com", password: "temporary-test-password", role: "super_admin" }));
    await assert.rejects(() => f.api.updateAdminRole("token", "member", "super_admin"));
    assert.deepEqual(f.writes, []);
  } finally { f.cleanup(); }
});

test("invalid server keys and service outages are not reported as expired sessions", async () => {
  for (const [authError, expected] of [
    [{ status: 401, message: "Unregistered API key" }, /credentials need updating/],
    [{ status: 503, message: "Service unavailable" }, /Unable to connect/],
    [{ status: 0, message: "fetch failed" }, /Unable to connect/],
    [{ status: 401, message: "JWT expired" }, /session has expired/],
  ]) {
    const f = await fixture({ authError });
    try {
      await assert.rejects(() => f.api.listAdminAccounts("token"), expected);
      assert.deepEqual(f.writes, []);
    } finally { f.cleanup(); }
  }
});
