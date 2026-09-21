import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "@/admin/components/AdminLayout";
import { AdminModal, ConfirmDialog, ErrorState, FormField, ImageUploader, LoadingSkeleton, fieldClass, primaryButtonClass } from "@/admin/components/AdminPrimitives";
import { getSiteSettings, saveSiteSettings } from "@/admin/services/admin-data";
import { defaultSiteContent, getYearTeams, type TeamMember } from "@/lib/site-content";
import { uploadImage } from "@/lib/storage";

export function TeamAdminPage() {
  const client = useQueryClient();
  const [selectedYear, setYear] = useState<string | null>(null);
  const [addingYear, setAddingYear] = useState(false);
  const [newYear, setNewYear] = useState("");
  const [editing, setEditing] = useState<{ index: number | null; member: TeamMember } | null>(null);
  const [removing, setRemoving] = useState<number | null>(null);
  const query = useQuery({ queryKey: ["site-settings"], queryFn: getSiteSettings });
  const teams = getYearTeams(query.data?.teamPage ?? defaultSiteContent.teamPage!);
  const years = [...new Set(teams.map((team) => team.year))].sort().reverse();
  const year = selectedYear ?? years[0] ?? String(new Date().getFullYear());
  const members = teams.find((team) => team.year === year)?.members ?? [];
  const addYear = useMutation({
    mutationFn: async () => {
      const value = newYear.trim();
      if (!/^[1-9]\d{3}$/.test(value)) throw new Error("Enter a four-digit year.");
      const latest = await getSiteSettings();
      const teamPage = latest.teamPage ?? defaultSiteContent.teamPage!;
      const yearlyTeams = getYearTeams(teamPage);
      if (yearlyTeams.some((team) => team.year === value)) throw new Error("That year already exists.");
      const content = await saveSiteSettings({
        ...latest,
        teamPage: { ...teamPage, yearlyTeams: [...yearlyTeams, { year: value, members: [] }] },
      });
      return { content, year: value };
    },
    onSuccess: ({ content, year: value }) => {
      client.setQueryData(["site-settings"], content);
      void client.invalidateQueries({ queryKey: ["site-content"] });
      setYear(value); setAddingYear(false);
      toast.success("Team year added.");
    },
  });
  const mutation = useMutation({
    mutationFn: async (change: { index: number | null; member?: TeamMember }) => {
      const latest = await getSiteSettings();
      const teamPage = latest.teamPage ?? defaultSiteContent.teamPage!;
      const yearlyTeams = getYearTeams(teamPage).map((team) => ({ ...team, members: [...team.members] }));
      let target = yearlyTeams.find((team) => team.year === year);
      if (!target) { target = { year, members: [] }; yearlyTeams.push(target); }
      if (change.index === null && change.member) target.members.push(change.member);
      else if (change.index !== null) {
        const expected = members[change.index];
        if (JSON.stringify(target.members[change.index]) !== JSON.stringify(expected)) {
          throw new Error("This team changed. Refresh the page before saving.");
        }
        if (change.member) target.members[change.index] = change.member;
        else target.members.splice(change.index, 1);
      }
      return saveSiteSettings({ ...latest, teamPage: { ...teamPage, yearlyTeams } });
    },
    onSuccess: (content) => {
      client.setQueryData(["site-settings"], content);
      void client.invalidateQueries({ queryKey: ["site-content"] });
      setEditing(null); setRemoving(null);
      toast.success("Team updated.");
    },
    onError: (error) => toast.error(error.message),
  });

  return <AdminLayout title="Team">
    {query.isPending ? <LoadingSkeleton /> : query.isError ? <ErrorState message="Unable to load team members." onRetry={() => void query.refetch()} /> : <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <FormField label="Team year"><select className={fieldClass} value={year} onChange={(event) => setYear(event.target.value)}>
          {years.length === 0 && <option value={year}>{year}</option>}
          {years.map((value) => <option key={value}>{value}</option>)}
        </select></FormField>
        <button type="button" className={primaryButtonClass} onClick={() => {
          setNewYear(String(Math.min(9999, Number(years[0] ?? new Date().getFullYear()) + 1)));
          addYear.reset(); setAddingYear(true);
        }}><Plus className="size-4" />Add year</button>
        <button type="button" className={primaryButtonClass} onClick={() => setEditing({ index: null, member: { name: "", role: "", track: "", initials: "" } })}>
          <Plus className="size-4" />Add member
        </button>
      </div>
      {members.length === 0 && <p className="py-12 text-center text-slate-500">No team members for {year}.</p>}
      <div className="divide-y divide-slate-200">
        {members.map((member, index) => <div key={index} className="flex flex-wrap items-center gap-4 py-4">
          {member.imageUrl ? <img src={member.imageUrl} alt={member.name} className="size-16 rounded-md object-cover" /> :
            <div className="grid size-16 place-items-center rounded-md bg-slate-100 text-slate-500">{member.initials}</div>}
          <div className="min-w-0 flex-1"><p className="break-words font-semibold">{member.name}</p><p className="break-words text-sm text-slate-500">{member.role}</p></div>
          <button type="button" title={`Edit ${member.name}`} aria-label={`Edit ${member.name}`} className="p-3" onClick={() => setEditing({ index, member })}><Edit className="size-4" /></button>
          <button type="button" title={`Delete ${member.name}`} aria-label={`Delete ${member.name}`} className="p-3 text-red-700" onClick={() => setRemoving(index)}><Trash2 className="size-4" /></button>
        </div>)}
      </div>
    </>}
    <AdminModal open={addingYear} title="Add team year" onClose={() => { if (!addYear.isPending) setAddingYear(false); }}>
      <form className="space-y-5" onSubmit={(event) => { event.preventDefault(); if (!addYear.isPending) addYear.mutate(); }}>
        <FormField label="Year" required>
          <input autoFocus required type="number" min="1000" max="9999" step="1" className={fieldClass}
            value={newYear} disabled={addYear.isPending} onChange={(event) => setNewYear(event.target.value)} />
        </FormField>
        {addYear.isError && <p role="alert" className="text-sm text-red-700">{addYear.error.message}</p>}
        <button type="submit" disabled={addYear.isPending} className={primaryButtonClass}>
          <Plus className="size-4" />{addYear.isPending ? "Adding..." : "Add year"}
        </button>
      </form>
    </AdminModal>
    {editing && <MemberEditor member={editing.member} year={year} onClose={() => setEditing(null)}
      onSave={(member) => mutation.mutateAsync({ index: editing.index, member })} />}
    <ConfirmDialog open={removing !== null} title="Delete team member?" description={`Remove this member from the ${year} team?`}
      onCancel={() => { if (!mutation.isPending) setRemoving(null); }}
      onConfirm={() => { if (!mutation.isPending && removing !== null) mutation.mutate({ index: removing }); }} />
  </AdminLayout>;
}

function MemberEditor({ member, year, onClose, onSave }: {
  member: TeamMember; year: string; onClose: () => void; onSave: (member: TeamMember) => Promise<unknown>;
}) {
  const [form, setForm] = useState(member);
  const [file, setFile] = useState<File | null>(null);
  const [photoVersion, setPhotoVersion] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  async function save() {
    setSaving(true); setError("");
    try {
      const name = form.name.trim(), role = form.role.trim();
      if (!name || !role) throw new Error("Name and position are required.");
      const linkedinUrl = form.linkedinUrl?.trim() || null;
      if (linkedinUrl) {
        const url = new URL(linkedinUrl);
        if (url.protocol !== "https:" || !(url.hostname === "linkedin.com" || url.hostname.endsWith(".linkedin.com"))) {
          throw new Error("Enter a valid https://www.linkedin.com/ profile link.");
        }
      }
      const imageUrl = file ? await uploadImage("gallery-images", file, "team/" + year) : form.imageUrl ?? null;
      setForm((current) => ({ ...current, imageUrl })); setFile(null);
      await onSave({ ...form, name, role, linkedinUrl, imageUrl, initials: name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase() });
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to save member."); }
    finally { setSaving(false); }
  }
  return <AdminModal open title={`Team member - ${year}`} onClose={() => { if (!saving) onClose(); }}>
    <form onSubmit={(event) => { event.preventDefault(); void save(); }} className="space-y-5">
      <fieldset disabled={saving} className="space-y-5">
        <FormField label="Name" required><input required className={fieldClass} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></FormField>
        <FormField label="Position" required><input required className={fieldClass} value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} /></FormField>
        <FormField label="LinkedIn profile"><input type="url" placeholder="https://www.linkedin.com/in/..." className={fieldClass} value={form.linkedinUrl ?? ""} onChange={(event) => setForm({ ...form, linkedinUrl: event.target.value })} /></FormField>
        <FormField label="Photo"><ImageUploader key={photoVersion} value={form.imageUrl ?? null} onFile={setFile} disabled={saving} /></FormField>
        {(form.imageUrl || file) && <button type="button" className="flex items-center gap-2 text-sm text-red-700" onClick={() => { setFile(null); setForm({ ...form, imageUrl: null }); setPhotoVersion((value) => value + 1); }}><Trash2 className="size-4" />Remove photo</button>}
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <button type="submit" className={primaryButtonClass}><Save className="size-4" />{saving ? "Saving..." : "Save member"}</button>
      </fieldset>
    </form>
  </AdminModal>;
}
