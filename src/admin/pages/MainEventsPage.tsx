import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminLayout } from "@/admin/components/AdminLayout";
import { ErrorState, LoadingSkeleton, fieldClass, primaryButtonClass, textAreaClass } from "@/admin/components/AdminPrimitives";
import { getSiteSettings, saveSiteSettings } from "@/admin/services/admin-data";
import { getMainEvents, mainEventsSchema, type MainEventContent } from "@/lib/main-events";
import { uploadImage } from "@/lib/storage";

export function MainEventsPage() {
  const client = useQueryClient();
  const query = useQuery({ queryKey: ["site-settings"], queryFn: getSiteSettings });
  const [draft, setDraft] = useState<MainEventContent[] | null>(null);
  const [uploading, setUploading] = useState(false);
  const cards = getMainEvents(query.data ?? {});
  const values = draft ?? cards.map((card) => ({
    title: card.title,
    description: card.description,
    homepageContent: card.homepageContent ?? card.description,
    imageUrl: card.imageUrl,
    detailTitle: card.detailTitle ?? card.title,
    detailDescription: card.detailDescription ?? card.description,
    detailImageUrl: card.detailImageUrl ?? card.imageUrl,
  }));
  const change = (index: number, patch: Partial<MainEventContent>) => setDraft((current) =>
    (current ?? values).map((card, position) => position === index ? { ...card, ...patch } : card));
  const save = useMutation({
    mutationFn: async () => {
      const parsed = mainEventsSchema.safeParse(values);
      if (!parsed.success) throw new Error(parsed.error.issues[0]?.message || "Check the card content.");
      const latest = await getSiteSettings();
      if (JSON.stringify(latest.mainEvents) !== JSON.stringify(query.data?.mainEvents))
        throw new Error("These cards changed in another session. Reload before saving.");
      return saveSiteSettings({ ...latest, mainEvents: parsed.data });
    },
    onSuccess: (content) => {
      client.setQueryData(["site-settings"], content);
      void client.invalidateQueries({ queryKey: ["site-content"] });
      setDraft(null);
      toast.success("Our Main Events saved.");
    },
    onError: (error) => toast.error(error.message),
  });
  async function upload(index: number, file: File, field: "imageUrl" | "detailImageUrl") {
    setUploading(true);
    try {
      const imageUrl = await uploadImage("event-images", file, "main-events");
      change(index, { [field]: imageUrl });
      toast.success("Image uploaded. Save changes to publish it.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to upload image.");
    } finally { setUploading(false); }
  }
  const busy = uploading || save.isPending;
  return <AdminLayout title="Our Main Events" subtitle="Manage homepage cards and Read more page content separately for each event.">
    {query.isPending ? <LoadingSkeleton /> : query.isError ? <ErrorState message="Unable to load main events." onRetry={() => void query.refetch()} /> :
      <form className="space-y-6" onSubmit={(event) => { event.preventDefault(); save.mutate(); }}>
        <fieldset disabled={busy} className="space-y-6 disabled:opacity-70">
          {cards.map((card, index) => <section key={card.id} className="rounded-xl border border-slate-200 bg-white p-5 sm:p-7">
            <h2 className="text-lg font-bold text-slate-900">{index + 1}. {card.title}</h2>
            {([
              { heading: "Homepage card", hint: "This content appears only in the homepage card.", title: "title", description: "homepageContent", image: "imageUrl" },
              { heading: "Read more page", hint: "Full content displayed after a visitor clicks Read more.", title: "detailTitle", description: "detailDescription", image: "detailImageUrl" },
            ] as const).map((area) => <div key={area.title} className="mt-6 rounded-lg border border-slate-200 p-4 sm:p-5">
            <h3 className="font-bold text-ieee">{area.heading}</h3>
            <p className="mt-1 text-sm text-slate-500">{area.hint}</p>
            <label className="mt-5 block space-y-2 text-sm font-semibold">
              <span>Topic / Title</span>
              <input required maxLength={200} className={fieldClass} value={values[index]?.[area.title] ?? ""} onChange={(event) => change(index, { [area.title]: event.target.value })} />
            </label>
            <label className="mt-5 block space-y-2 text-sm font-semibold">
              <span>{area.description === "homepageContent" ? "Homepage content" : "Full description (after Read more)"}</span>
              <textarea required maxLength={20000} rows={area.description === "homepageContent" ? 4 : 10} className={textAreaClass} value={values[index]?.[area.description] ?? ""} onChange={(event) => change(index, { [area.description]: event.target.value })} />
            </label>
            <p className="mt-2 text-xs text-slate-500">{area.description === "homepageContent" ? "Shown only on the homepage. Editing this text does not change the Read more page." : "Shown only after Read more. Editing this description does not change the homepage text. Paragraph breaks are preserved."}</p>
            <label className="mt-5 block space-y-2 text-sm font-semibold">
              <span>Image</span>
              <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="block w-full rounded-lg border border-slate-200 p-3 text-sm" onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(index, file, area.image); event.target.value = ""; }} />
            </label>
            {values[index]?.[area.image] && <div className="mt-4 flex flex-wrap items-start gap-4">
              <img src={values[index]?.[area.image]} alt={values[index]?.[area.title] || card.title} className="max-h-56 max-w-full rounded-lg object-contain" />
              <button type="button" className="text-sm font-semibold text-red-600 underline" onClick={() => change(index, { [area.image]: "" })}>Remove image</button>
            </div>}
            </div>)}
          </section>)}
          <button type="submit" className={primaryButtonClass}>{uploading ? "Uploading image…" : save.isPending ? "Saving…" : "Save changes"}</button>
        </fieldset>
      </form>}
  </AdminLayout>;
}
