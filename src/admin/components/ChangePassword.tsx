import { useState, type FormEvent } from "react";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { fieldClass, primaryButtonClass } from "./AdminPrimitives";

export function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [visible, setVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (saving) return;
    if (password !== confirmation) {
      toast.error("The new passwords do not match.");
      return;
    }
    if (password === currentPassword) {
      toast.error("Choose a different password.");
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password,
        current_password: currentPassword,
      });
      if (error) throw error;
      setCurrentPassword("");
      setPassword("");
      setConfirmation("");
      setVisible(false);
      toast.success("Your password has been changed.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to change your password.");
    } finally {
      setSaving(false);
    }
  }
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="flex items-center gap-2 text-lg font-bold text-slate-950">
        <LockKeyhole className="size-5 text-[#00629b]" />
        Change my password
      </h2>
      <p className="mt-2 text-sm text-slate-500">Update the password for your own CMS account.</p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <label className="block text-sm font-semibold text-slate-700">
          Current password
          <input
            type={visible ? "text" : "password"}
            autoComplete="current-password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            className={`${fieldClass} mt-2`}
            required
            disabled={saving}
          />
        </label>
        <label className="block text-sm font-semibold text-slate-700">
          New password
          <input
            type={visible ? "text" : "password"}
            autoComplete="new-password"
            minLength={8}
            maxLength={128}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={`${fieldClass} mt-2`}
            required
            disabled={saving}
          />
        </label>
        <label className="block text-sm font-semibold text-slate-700">
          Confirm new password
          <input
            type={visible ? "text" : "password"}
            autoComplete="new-password"
            minLength={8}
            maxLength={128}
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            className={`${fieldClass} mt-2`}
            required
            disabled={saving}
          />
        </label>
        <p className="text-xs text-slate-500">Use 8–128 characters.</p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setVisible(!visible)}
            aria-pressed={visible}
            className="inline-flex items-center gap-2 text-sm text-slate-600"
          >
            {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            {visible ? "Hide passwords" : "Show passwords"}
          </button>
          <button disabled={saving} className={primaryButtonClass}>
            {saving ? "Updating..." : "Update password"}
          </button>
        </div>
      </form>
    </section>
  );
}
