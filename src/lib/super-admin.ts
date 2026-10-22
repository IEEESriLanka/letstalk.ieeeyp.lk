export const superAdminEmail = "ieeeletstalksl@gmail.com";

export function isSuperAdmin(role: unknown, email: unknown): boolean {
  return (
    role === "super_admin" && typeof email === "string" && email.toLowerCase() === superAdminEmail
  );
}
