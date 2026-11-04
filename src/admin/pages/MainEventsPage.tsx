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
  const values = draft ?? cards.map(({ title, description, imageUrl }) => ({ title, description, imageUrl }));
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
  async function upload(index: number, file: File) {
    setUploading(true);
    try {
      const imageUrl = await uploadImage("event-images", file, "main-events");
      change(index, { imageUrl });
      toast.success("Image uploaded. Save changes to publish it.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to upload image.");
    } finally { setUploading(false); }
  }
  const busy = uploading || save.isPending;
  return <AdminLayout title="Our Main Events" subtitle="Update the topic, description, and image for each of the three homepage cards and their detail pages.">
    {query.isPending ? <LoadingSkeleton /> : query.isError ? <ErrorState message="Unable to load main events." onRetry={() => void query.refetch()} /> :
      <form className="space-y-6" onSubmit={(event) => { event.preventDefault(); save.mutate(); }}>
        <fieldset disabled={busy} className="space-y-6 disabled:opacity-70">
          {cards.map((card, index) => <section key={card.id} className="rounded-xl border border-slate-200 bg-white p-5 sm:p-7">
            <h2 className="text-lg font-bold text-slate-900">{index + 1}. {card.title}</h2>
            <label className="mt-5 block space-y-2 text-sm font-semibold">
              <span>Topic / Title</span>
              <input required maxLength={200} className={fieldClass} value={values[index]?.title ?? ""} onChange={(event) => change(index, { title: event.target.value })} />
            </label>
            <label className="mt-5 block space-y-2 text-sm font-semibold">
              <span>Description</span>
              <textarea required maxLength={20000} rows={7} className={textAreaClass} value={values[index]?.description ?? ""} onChange={(event) => change(index, { description: event.target.value })} />
            </label>
            <p className="mt-2 text-xs text-slate-500">The card shows a preview. Read more opens the full description, preserving line breaks.</p>
            <label className="mt-5 block space-y-2 text-sm font-semibold">
              <span>Image</span>
              <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="block w-full rounded-lg border border-slate-200 p-3 text-sm" onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(index, file); event.target.value = ""; }} />
            </label>
            {values[index]?.imageUrl && <div className="mt-4 flex flex-wrap items-start gap-4">
              <img src={values[index]?.imageUrl} alt={card.title} className="max-h-56 max-w-full rounded-lg object-contain" />
              <button type="button" className="text-sm font-semibold text-red-600 underline" onClick={() => change(index, { imageUrl: "" })}>Remove image</button>
            </div>}
          </section>)}
          <button type="submit" className={primaryButtonClass}>{uploading ? "Uploading image…" : save.isPending ? "Saving…" : "Save changes"}</button>
        </fieldset>
      </form>}
  </AdminLayout>;
}
