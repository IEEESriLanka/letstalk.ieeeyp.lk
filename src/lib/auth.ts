import { supabase } from "@/lib/supabase";
import type { AdminUser } from "@/types/database";

export type AdminAccess =
  | {
      ok: true;
      admin: AdminUser;
      identity: { name: string; email: string };
    }
  | { ok: false; reason: "not-authenticated" | "not-admin"; message: string };

export async function signInAdmin(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error("Unable to sign in with those credentials.");
  return data;
}

export async function signOutAdmin() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

export async function getAdminAccess(): Promise<AdminAccess> {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session?.user) {
    return {
      ok: false,
      reason: "not-authenticated",
      message: "Please sign in to continue.",
    };
  }

  const { data, error } = await supabase
    .from("admin_users")
    .select("id,user_id,role,created_at")
    .eq("user_id", session.user.id)
    .maybeSingle<AdminUser>();

  if (error || !data) {
    await supabase.auth.signOut();
    return {
      ok: false,
      reason: "not-admin",
      message: "Your account is authenticated, but you do not have administrator access.",
    };
  }

  const metadata = session.user.user_metadata;
  const displayName =
    (typeof metadata.full_name === "string" && metadata.full_name.trim()) ||
    (typeof metadata.name === "string" && metadata.name.trim()) ||
    session.user.email?.split("@")[0] ||
    "Administrator";

  return {
    ok: true,
    admin: data,
    identity: { name: displayName, email: session.user.email ?? "" },
  };
}
