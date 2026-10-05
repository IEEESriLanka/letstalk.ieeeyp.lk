import { supabase } from "@/lib/supabase";
import type { AdminUser } from "@/types/database";

export type AdminAccess =
  | { ok: true; admin: AdminUser }
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

export async function requestAdminAccess(input: {
  email: string;
  password: string;
  fullName: string;
  reason: string;
}) {
  const { data: signUp, error: signUpError } = await supabase.auth.signUp({
    email: input.email.trim().toLowerCase(),
    password: input.password,
  });
  if (signUpError) throw new Error(signUpError.message);
  if (!signUp.user) throw new Error("Unable to create the login account.");

  const { error } = await supabase.from("admin_access_requests").insert({
    user_id: signUp.user.id,
    email: input.email.trim().toLowerCase(),
    full_name: input.fullName.trim(),
    reason: input.reason.trim(),
  });
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

  return { ok: true, admin: data };
}
