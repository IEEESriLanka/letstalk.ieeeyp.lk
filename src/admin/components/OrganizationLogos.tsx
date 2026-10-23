import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getSiteSettings, saveSiteSettings } from "@/admin/services/admin-data";
import { defaultSiteContent, type SiteContent } from "@/lib/site-content";
import { uploadImage, validateImage } from "@/lib/storage";
import { primaryButtonClass } from "./AdminPrimitives";

type Organization = NonNullable<SiteContent["about"]["organizations"]>[number];

function LogoEditor({ organization }: { organization: Organization }) {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!file) { setPreview(null); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const save = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("Choose a logo first.");
      const logoUrl = await uploadImage("gallery-images", file, "organization-logos");
      const latest = await getSiteSettings();
      const organizations = [...(latest.about?.organizations ?? defaultSiteContent.about.organizations ?? [])];
      for (const fallback of defaultSiteContent.about.organizations ?? []) {
        if (!organizations.some((item) => item.title === fallback.title)) organizations.push(fallback);
      }
      const index = organizations.findIndex((item) => item.title === organization.title);
      if (index < 0) organizations.push({ ...organization, logoUrl });
      else organizations[index] = { ...organizations[index]!, logoUrl };
      return saveSiteSettings({
        ...latest,
        about: { ...defaultSiteContent.about, ...latest.about, organizations },
      });
    },
    onSuccess: (updated) => {
      setFile(null);
      queryClient.setQueryData(["site-settings"], updated);
      void queryClient.invalidateQueries({ queryKey: ["site-content"] });
      toast.success(`${organization.title} logo saved.`);
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <h4 className="mb-3 font-semibold text-slate-900">{organization.title}</h4>
      <div className="mb-3 flex h-32 items-center justify-center rounded-lg bg-slate-50 p-4">
        {preview || organization.logoUrl ? (
          <img src={preview ?? organization.logoUrl!} alt={`${organization.title} logo preview`} className="max-h-full max-w-full object-contain" />
        ) : <span className="text-sm text-slate-500">No logo selected</span>}
      </div>
      <label className="block text-sm font-medium text-slate-700">
        Choose replacement logo
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={save.isPending}
          className="mt-2 block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2"
          onChange={(event) => {
            const selected = event.target.files?.[0];
            event.target.value = "";
            if (!selected) return;
            try { validateImage(selected); setFile(selected); }
            catch (error) { toast.error(error instanceof Error ? error.message : "Invalid image."); }
          }}
        />
      </label>
      <p className="mt-2 text-xs text-slate-500">PNG, JPG, or WEBP. Maximum 5MB. Transparent PNG works well.</p>
      <div className="mt-3 flex gap-3">
        <button type="button" disabled={!file || save.isPending} onClick={() => save.mutate()} className={primaryButtonClass}>
          {save.isPending ? "Saving…" : "Save logo"}
        </button>
        {file ? <button type="button" disabled={save.isPending} onClick={() => setFile(null)} className="text-sm text-slate-600">Cancel</button> : null}
      </div>
    </div>
  );
}

export function OrganizationLogos({ content }: { content: SiteContent }) {
  const defaults = defaultSiteContent.about.organizations ?? [];
  return (
    <section className="mt-6 border-t border-slate-200 pt-6">
      <h3 className="font-bold text-slate-900">IEEE organization logos</h3>
      <p className="mt-1 text-sm text-slate-500">Replace the logos in the Our IEEE Network section on the About Us page.</p>
      <div className="mt-4 grid gap-4">
        {defaults.map((fallback) => {
          const saved = content.about?.organizations?.find((item) => item.title === fallback.title);
          const organization = { ...fallback, ...saved, logoUrl: saved?.logoUrl || fallback.logoUrl || null };
          return <LogoEditor key={organization.title} organization={organization} />;
        })}
      </div>
    </section>
  );
}
