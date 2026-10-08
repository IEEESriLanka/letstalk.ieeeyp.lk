import { createServerFn } from "@tanstack/react-start";

const credentialsSchema = (input: unknown) => {
  if (!input || typeof input !== "object" || !("accessToken" in input)) {
    throw new Error("Your session has expired. Please sign in again.");
  }
  const accessToken = String(input.accessToken ?? "");
  if (!accessToken || accessToken.length > 10_000) {
    throw new Error("Your session has expired. Please sign in again.");
  }
  return { ...input, accessToken };
};

export const listAdminAccountsSecurely = createServerFn({ method: "POST" })
  .validator(credentialsSchema)
  .handler(async ({ data }) => {
    const { listAdminAccounts } = await import("./admin-accounts.server");
    return listAdminAccounts(data.accessToken);
  });

export const createAdminAccountSecurely = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const data = credentialsSchema(input);
    if (!("email" in data) || !("password" in data) || !("role" in data)) {
      throw new Error("Enter an email, password, and role.");
    }
    const email = String(data.email).trim().toLowerCase();
    const password = String(data.password);
    const role = String(data.role);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a valid email address.");
    if (password.length < 8 || password.length > 128)
      throw new Error("Use a password between 8 and 128 characters.");
    if (role !== "admin" && role !== "editor") throw new Error("Choose a valid role.");
    return { accessToken: data.accessToken, email, password, role };
  })
  .handler(async ({ data }) => {
    const { createAdminAccount } = await import("./admin-accounts.server");
    return createAdminAccount(data.accessToken, {
      email: data.email,
      password: data.password,
      role: data.role as "admin" | "editor",
    });
  });

export const deleteAdminAccountSecurely = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const data = credentialsSchema(input);
    if (!("id" in data)) throw new Error("Choose an admin account.");
    return { accessToken: data.accessToken, id: String(data.id) };
  })
  .handler(async ({ data }) => {
    const { deleteAdminAccount } = await import("./admin-accounts.server");
    return deleteAdminAccount(data.accessToken, data.id);
  });
