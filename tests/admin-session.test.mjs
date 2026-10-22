import assert from "node:assert/strict";
import test from "node:test";
import { adminSessionExpiredMessage, withAdminSession } from "../src/lib/admin-session.ts";

function fixture({
  expires_at = Math.floor(Date.now() / 1000) + 3600,
  session = true,
  refreshError = null,
} = {}) {
  let refreshes = 0;
  return {
    auth: {
      getSession: async () => ({
        data: { session: session ? { access_token: "original", expires_at } : null },
        error: null,
      }),
      refreshSession: async () => {
        refreshes++;
        return {
          data: { session: refreshError ? null : { access_token: "refreshed" } },
          error: refreshError,
        };
      },
    },
    refreshes: () => refreshes,
  };
}
test("valid sessions load accounts without a refresh", async () => {
  const f = fixture();
  assert.equal(await withAdminSession(f.auth, async (token) => token), "original");
  assert.equal(f.refreshes(), 0);
});
test("tokens near expiry are refreshed before calling the server", async () => {
  const f = fixture({ expires_at: Math.floor(Date.now() / 1000) + 20 });
  assert.equal(await withAdminSession(f.auth, async (token) => token), "refreshed");
  assert.equal(f.refreshes(), 1);
});
test("a rejected token refreshes and retries exactly once", async () => {
  const f = fixture();
  const calls = [];
  const result = await withAdminSession(f.auth, async (token) => {
    calls.push(token);
    if (token === "original") throw new Error(adminSessionExpiredMessage);
    return ["member"];
  });
  assert.deepEqual(result, ["member"]);
  assert.deepEqual(calls, ["original", "refreshed"]);
  assert.equal(f.refreshes(), 1);
});
test("network, configuration and operation errors do not retry mutations", async () => {
  for (const message of [
    "Unable to connect to the account service.",
    "Server credentials need updating.",
    "Account already exists.",
    "Only the super admin can manage CMS accounts.",
  ]) {
    const f = fixture();
    let calls = 0;
    await assert.rejects(
      () =>
        withAdminSession(f.auth, async () => {
          calls++;
          throw new Error(message);
        }),
      { message },
    );
    assert.equal(calls, 1);
    assert.equal(f.refreshes(), 0);
  }
});
test("unrecoverable sessions stop without looping or making account changes", async () => {
  for (const options of [{ session: false }, { refreshError: new Error("Refresh rejected") }, {}]) {
    const f = fixture(options);
    let calls = 0;
    await assert.rejects(
      () =>
        withAdminSession(f.auth, async () => {
          calls++;
          throw new Error(adminSessionExpiredMessage);
        }),
      { message: adminSessionExpiredMessage },
    );
    assert.ok(f.refreshes() <= 1);
    assert.ok(calls <= 2);
  }
});
