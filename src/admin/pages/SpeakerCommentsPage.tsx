import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "@/admin/components/AdminLayout";
import {
  ErrorState,
  LoadingSkeleton,
  fieldClass,
  primaryButtonClass,
  secondaryButtonClass,
  textAreaClass,
} from "@/admin/components/AdminPrimitives";
import { getSiteSettings, saveSiteSettings } from "@/admin/services/admin-data";
import { speakerCommentsSchema, type SpeakerComment } from "@/lib/testimonials";
import { uploadImage } from "@/lib/storage";

export function SpeakerCommentsPage() {
  const client = useQueryClient();
  const query = useQuery({ queryKey: ["site-settings"], queryFn: getSiteSettings });
  const [draft, setDraft] = useState<SpeakerComment[] | null>(null);
  const [uploading, setUploading] = useState(false);
  const comments = draft ?? query.data?.speakerComments ?? [];
  function change(update: (items: SpeakerComment[]) => SpeakerComment[]) {
    setDraft((current) => update(current ?? query.data?.speakerComments ?? []));
  }
  function patch(id: string, fields: Partial<SpeakerComment>) {
    change((items) => items.map((item) => (item.id === id ? { ...item, ...fields } : item)));
  }
  function move(index: number, delta: number) {
    change((items) => {
      const result = [...items];
      const item = result.splice(index, 1)[0];
      if (item) result.splice(index + delta, 0, item);
      return result;
    });
  }
  const save = useMutation({
    mutationFn: async () => {
      const parsed = speakerCommentsSchema.safeParse(comments);
      if (!parsed.success)
        throw new Error(parsed.error.issues[0]?.message ?? "Check the comment fields.");
      const latest = await getSiteSettings();
      if (
        JSON.stringify(latest.speakerComments ?? []) !==
        JSON.stringify(query.data?.speakerComments ?? [])
      ) {
        throw new Error("Comments changed in another session. Reload before publishing.");
      }
      return saveSiteSettings({ ...latest, speakerComments: parsed.data });
    },
    onSuccess: (content) => {
      client.setQueryData(["site-settings"], content);
      void client.invalidateQueries({ queryKey: ["site-content"] });
      setDraft(null);
      toast.success("Speaker comments saved.");
    },
    onError: (error) => toast.error(error.message),
  });
  async function upload(id: string, file: File) {
    setUploading(true);
    try {
      const imageUrl = await uploadImage("gallery-images", file, "speaker-comments");
      patch(id, { imageUrl });
      toast.success("Photo uploaded. Save comments to publish it.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Photo upload failed.");
    } finally {
      setUploading(false);
    }
  }
  const busy = uploading || save.isPending;
  return (
    <AdminLayout
      title="Speaker Comments"
      subtitle="Manage the rotating speaker cards at the bottom of About Us, above the footer. Changes go live when you save."
    >
      {query.isPending ? (
        <LoadingSkeleton />
      ) : query.isError ? (
        <ErrorState
          message="Unable to load speaker comments."
          onRetry={() => void query.refetch()}
        />
      ) : (
        <form
          className="space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            save.mutate();
          }}
        >
          <p className="rounded-md border border-blue-100 bg-blue-50 p-4 text-sm text-slate-700">
            Add genuine comments with the speaker's permission. Publish controls visibility; arrows
            control the display order. The section stays hidden until a published comment is saved.
          </p>
          <fieldset disabled={busy} className="space-y-5 disabled:opacity-70">
            {!comments.length && (
              <p className="rounded-md border border-dashed bg-white p-8 text-center text-slate-500">
                No speaker comments yet. Add your first speaker below.
              </p>
            )}
            {comments.map((speaker, index) => (
              <div
                key={speaker.id}
                className="space-y-4 rounded-[5px] border border-slate-200 bg-white p-5 sm:p-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="font-bold text-slate-900">Speaker {index + 1}</h2>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className={secondaryButtonClass}
                      aria-label={`Move speaker ${index + 1} up`}
                      disabled={index === 0}
                      onClick={() => move(index, -1)}
                    >
                      <ArrowUp className="size-4" />
                    </button>
                    <button
                      type="button"
                      className={secondaryButtonClass}
                      aria-label={`Move speaker ${index + 1} down`}
                      disabled={index === comments.length - 1}
                      onClick={() => move(index, 1)}
                    >
                      <ArrowDown className="size-4" />
                    </button>
                    <button
                      type="button"
                      className={secondaryButtonClass}
                      aria-label={`Remove speaker ${index + 1}`}
                      onClick={() =>
                        change((items) => items.filter((item) => item.id !== speaker.id))
                      }
                    >
                      <Trash2 className="size-4 text-red-600" />
                    </button>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-1 text-sm font-semibold">
                    Person's name
                    <input
                      required
                      maxLength={120}
                      className={fieldClass}
                      value={speaker.name}
                      onChange={(event) => patch(speaker.id, { name: event.target.value })}
                    />
                  </label>
                  <label className="space-y-1 text-sm font-semibold">
                    Designation / organization
                    <input
                      required
                      maxLength={180}
                      className={fieldClass}
                      value={speaker.designation}
                      onChange={(event) => patch(speaker.id, { designation: event.target.value })}
                    />
                  </label>
                </div>
                <label className="block space-y-1 text-sm font-semibold">
                  Comment
                  <textarea
                    required
                    maxLength={1200}
                    rows={4}
                    className={textAreaClass}
                    value={speaker.comment}
                    onChange={(event) => patch(speaker.id, { comment: event.target.value })}
                  />
                  <span className="block text-xs font-normal text-slate-500">
                    {speaker.comment.length}/1200 characters
                  </span>
                </label>
                <div className="grid items-start gap-4 md:grid-cols-2">
                  <label className="space-y-1 text-sm font-semibold">
                    Photo URL (optional)
                    <input
                      type="url"
                      className={fieldClass}
                      value={speaker.imageUrl}
                      placeholder="https://…"
                      onChange={(event) => patch(speaker.id, { imageUrl: event.target.value })}
                    />
                    <span className="block text-xs font-normal text-slate-500">
                      Use an HTTPS image, or leave empty to show initials.
                    </span>
                  </label>
                  <label className="space-y-1 text-sm font-semibold">
                    Upload photo
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="block w-full text-sm font-normal"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) void upload(speaker.id, file);
                        event.target.value = "";
                      }}
                    />
                    <span className="block text-xs font-normal text-slate-500">
                      JPG, PNG or WebP, up to 5MB. {uploading ? "Uploading…" : ""}
                    </span>
                  </label>
                </div>
                {speaker.imageUrl && (
                  <img
                    src={speaker.imageUrl}
                    alt={`${speaker.name || "Speaker"} preview`}
                    className="size-16 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                )}
                <label className="flex items-center gap-2 text-sm font-semibold">
                  <input
                    type="checkbox"
                    checked={speaker.published}
                    onChange={(event) => patch(speaker.id, { published: event.target.checked })}
                  />
                  Published on About Us
                </label>
              </div>
            ))}
            <button
              type="button"
              className={secondaryButtonClass}
              disabled={comments.length >= 30}
              onClick={() =>
                change((items) => [
                  ...items,
                  {
                    id: crypto.randomUUID(),
                    name: "",
                    designation: "",
                    comment: "",
                    imageUrl: "",
                    published: false,
                  },
                ])
              }
            >
              <Plus className="size-4" />
              Add speaker comment
            </button>
          </fieldset>
          <div className="flex flex-wrap gap-3">
            <button className={primaryButtonClass} disabled={busy || draft === null}>
              {save.isPending ? "Saving…" : "Save comments"}
            </button>
            <button
              type="button"
              className={secondaryButtonClass}
              disabled={busy || draft === null}
              onClick={() => setDraft(null)}
            >
              Discard changes
            </button>
          </div>
          {draft !== null && (
            <p role="status" className="text-sm text-amber-700">
              You have unsaved changes. Removed cards are only deleted after saving.
            </p>
          )}
        </form>
      )}
    </AdminLayout>
  );
}
