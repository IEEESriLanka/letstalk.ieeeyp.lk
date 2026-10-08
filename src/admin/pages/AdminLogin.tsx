import { Link } from "@tanstack/react-router";
import { Eye, EyeOff, LockKeyhole, ShieldCheck } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { getAdminAccess, signInAdmin } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [recovering, setRecovering] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    if (new URLSearchParams(window.location.hash.slice(1)).get("type") === "recovery") {
      setRecovering(true);
    }
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setRecovering(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Enter your administrator email and password.");
      return;
    }

    try {
      setLoading(true);
      await signInAdmin(email, password);
      const access = await getAdminAccess();
      if (!access.ok) {
        setError(access.message);
        return;
      }
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get("redirect");
      window.location.href = redirect?.startsWith("/admin") ? redirect : "/admin";
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword() {
    setError("");
    setNotice("");
    if (!email.trim()) {
      setError("Enter your email address first, then choose Forgot password.");
      return;
    }
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/admin/login`,
      });
      if (error) throw error;
      setNotice("If the account exists, a password reset email is on its way.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to submit your access request.");
    } finally {
      setLoading(false);
    }
  }

  async function updatePassword(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setRecovering(false);
      setNewPassword("");
      setNotice("Password updated. Sign in with your new password.");
      await supabase.auth.signOut();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to update password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#07111f] px-4 py-10 text-white">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,.055)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.055)_1px,transparent_1px)] bg-[size:48px_48px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,98,155,.25),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(245,130,32,.16),transparent_26%)]" />

      <section className="relative w-full max-w-lg rounded-[26px] border border-white/10 bg-white/95 p-8 text-slate-950 shadow-2xl backdrop-blur sm:p-10">
        <div className="mb-8 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-md bg-[#00629b] text-white">
            <ShieldCheck className="size-6" />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight">IEEE LETs Talk</h1>
          <p className="mt-1 text-sm font-semibold text-slate-500">Admin Portal</p>
        </div>

        {recovering ? (
          <form onSubmit={updatePassword} className="space-y-5">
            <label className="block">
              <span className="text-base font-semibold text-slate-700">New password</span>
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                autoComplete="new-password"
                minLength={8}
                className="mt-2 h-14 w-full rounded-[22px] border border-slate-200 bg-white px-4 text-base outline-none focus:border-[#00629b] focus:ring-2 focus:ring-[#00629b]/15"
                required
              />
            </label>
            {error ? (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                {error}
              </div>
            ) : null}
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-[22px] bg-[#00629b] text-base font-bold text-white disabled:opacity-60"
            >
              {loading ? "Updating..." : "Update password"}
            </button>
          </form>
        ) : (
          <form onSubmit={submit} className="space-y-5">
            <label className="block">
              <span className="text-base font-semibold text-slate-700">Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                className="mt-2 h-14 w-full rounded-[22px] border border-slate-200 bg-white px-4 text-base outline-none transition focus:border-[#00629b] focus:ring-2 focus:ring-[#00629b]/15"
                required
              />
            </label>

            <label className="block">
              <span className="text-base font-semibold text-slate-700">Password</span>
              <div className="relative mt-1.5">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  className="h-14 w-full rounded-[22px] border border-slate-200 bg-white px-4 pr-11 text-base outline-none transition focus:border-[#00629b] focus:ring-2 focus:ring-[#00629b]/15"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute top-1/2 right-2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </label>

            {error ? (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-[22px] bg-[#00629b] text-base font-bold text-white transition hover:bg-[#005080] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LockKeyhole className="size-4" />
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        )}

        {!recovering ? (
          <div className="mt-5 flex items-center justify-between text-sm">
            <Link to="/" className="font-semibold text-[#00629b]">
              View public site
            </Link>
            <button
              type="button"
              onClick={resetPassword}
              disabled={loading}
              className="font-semibold text-slate-500 disabled:opacity-60"
            >
              Forgot password?
            </button>
          </div>
        ) : null}
        {notice ? <p className="mt-3 text-sm text-emerald-700">{notice}</p> : null}

        <p className="mt-8 border-t border-slate-200 pt-5 text-center text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
          Authorized administrators only
        </p>
      </section>
    </main>
  );
}
