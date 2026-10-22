import { createClient } from "@supabase/supabase-js";
import { isSuperAdmin, superAdminEmail } from "./super-admin";

type AdminRole = "admin" | "editor";

function getAdminClient() {
  const url = process.env["SUPABASE_URL"] || process.env["VITE_SUPABASE_URL"];
  const key = process.env["SUPABASE_SECRET_KEY"] || process.env["SUPABASE_SERVICE_ROLE_KEY"];
  if (!url || !key) throw new Error("Server Supabase credentials are not configured.");
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function requireSuperAdmin(accessToken: string) {
  const supabase = getAdminClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(accessToken);
  if (authError) {
    // A bad server key or an unavailable Auth service says nothing about the
    // caller's session. Only rejected user tokens should trigger a re-login.
    if (/api.?key|unregistered/i.test(authError.message))
      throw new Error(
        "Account management is unavailable. The server's Supabase credentials need updating.",
      );
    if (authError.status !== 401 && authError.status !== 403)
      throw new Error("Unable to connect to the account service. Please try again.");
    throw new Error("Your session has expired. Please sign in again.");
  }
  if (!user) throw new Error("Your session has expired. Please sign in again.");
  const { data: admin, error } = await supabase
    .from("admin_users")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) throw new Error("Unable to verify administrator access.");
  if (!isSuperAdmin(admin?.role, user.email) || !user.email_confirmed_at)
    throw new Error("Only the super admin can manage CMS accounts.");
  return { supabase, user };
}

export async function listAdminAccounts(accessToken: string) {
  const { supabase } = await requireSuperAdmin(accessToken);
  const { data: memberships, error } = await supabase
    .from("admin_users")
    .select("id,user_id,role,created_at")
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);

  const users = new Map<
    string,
    { email: string; name: string; last_sign_in_at: string | null; active: boolean }
  >();
  for (let page = 1; ; page += 1) {
    const { data, error: usersError } = await supabase.auth.admin.listUsers({
      page,
      perPage: 1000,
    });
    if (usersError) throw new Error(usersError.message);
    for (const user of data.users) {
      users.set(user.id, {
        email: user.email ?? "Unknown email",
        name: String(
          user.user_metadata?.["full_name"] ||
            user.user_metadata?.["name"] ||
            user.email?.split("@")[0] ||
            "CMS member",
        ),
        last_sign_in_at: user.last_sign_in_at ?? null,
        active: !user.banned_until || new Date(user.banned_until).getTime() < Date.now(),
      });
    }
    if (data.users.length < 1000) break;
  }
  return (memberships ?? []).map((membership) => ({
    ...membership,
    email: users.get(membership.user_id)?.email ?? "Auth user unavailable",
    name: users.get(membership.user_id)?.name ?? "CMS member",
    last_sign_in_at: users.get(membership.user_id)?.last_sign_in_at ?? null,
    active: users.get(membership.user_id)?.active ?? false,
  }));
}

export async function createAdminAccount(
  accessToken: string,
  input: { email: string; password: string; role: AdminRole },
) {
  if (input.role !== "admin" && input.role !== "editor")
    throw new Error("Choose an admin or editor role.");
  if (input.email.trim().toLowerCase() === superAdminEmail)
    throw new Error("The protected super-admin account cannot be recreated here.");
  const { supabase } = await requireSuperAdmin(accessToken);
  const { data, error } = await supabase.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
  });
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error("Supabase did not return the new user.");

  const { data: membership, error: insertError } = await supabase
    .from("admin_users")
    .insert({ user_id: data.user.id, role: input.role })
    .select("id,user_id,role,created_at")
    .single();
  if (insertError) {
    await supabase.auth.admin.deleteUser(data.user.id);
    throw new Error(insertError.message);
  }
  return {
    ...membership,
    email: data.user.email ?? input.email,
    name: data.user.email?.split("@")[0] ?? "CMS member",
    last_sign_in_at: null,
    active: true,
  };
}

export async function updateAdminRole(accessToken: string, id: string, role: AdminRole) {
  const { supabase } = await requireSuperAdmin(accessToken);
  if (role !== "admin" && role !== "editor") throw new Error("Choose an admin or editor role.");
  const { data: membership, error } = await supabase
    .from("admin_users")
    .select("user_id,role")
    .eq("id", id)
    .single();
  if (error) throw new Error(error.message);
  if (membership.role === "super_admin")
    throw new Error("The super-admin account cannot be changed.");
  const { data, error: updateError } = await supabase
    .from("admin_users")
    .update({ role })
    .eq("id", id)
    .neq("role", "super_admin")
    .select("id")
    .single();
  if (updateError || !data)
    throw new Error(updateError?.message ?? "Unable to update this account.");
}

export async function deleteAdminAccount(accessToken: string, id: string) {
  const { supabase, user: currentUser } = await requireSuperAdmin(accessToken);
  const { data: membership, error: lookupError } = await supabase
    .from("admin_users")
    .select("user_id,role")
    .eq("id", id)
    .single();
  if (lookupError) throw new Error(lookupError.message);
  if (membership.role === "super_admin")
    throw new Error("The super-admin account cannot be removed.");
  if (membership.user_id === currentUser.id)
    throw new Error("You cannot remove your own admin account.");

  const { error: deleteError } = await supabase.auth.admin.deleteUser(membership.user_id);
  if (deleteError) throw new Error(deleteError.message);
  const { error } = await supabase.from("admin_users").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
