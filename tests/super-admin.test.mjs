import assert from "node:assert/strict";
import test from "node:test";
import { isSuperAdmin, superAdminEmail } from "../src/lib/super-admin.ts";

test("only the designated owner with the super-admin role can manage accounts", () => {
  assert.equal(isSuperAdmin("super_admin", superAdminEmail), true);
  assert.equal(isSuperAdmin("super_admin", superAdminEmail.toUpperCase()), true);
  for (const role of ["admin", "editor", "user", undefined, null]) {
    assert.equal(isSuperAdmin(role, superAdminEmail), false);
  }
  for (const email of [undefined, null, "", "other@example.com", ` ${superAdminEmail}`, `${superAdminEmail}.evil`]) {
    assert.equal(isSuperAdmin("super_admin", email), false);
  }
});

test("editable metadata cannot substitute for the persisted role and Auth email", () => {
  assert.equal(isSuperAdmin({ role: "super_admin" }, superAdminEmail), false);
  assert.equal(isSuperAdmin("super_admin", { email: superAdminEmail }), false);
});
