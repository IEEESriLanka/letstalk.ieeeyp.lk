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
import {
  eventsHeroSchema,
  getEventsHero,
  getEventsHeroDraftSlides,
  withEventsHeroSlides,
  type EventsHeroContent,
} from "@/lib/events-hero";
import { uploadImage } from "@/lib/storage";

export function EventsHeroPage() {
  const client = useQueryClient();
  const query = useQuery({ queryKey: ["site-settings"], queryFn: getSiteSettings });
  const [draft, setDraft] = useState<EventsHeroContent | null>(null);
  const [uploading, setUploading] = useState(false);
  const hero = draft ?? getEventsHero(query.data?.eventsHero);
  const change = (update: (value: EventsHeroContent) => EventsHeroContent) =>
    setDraft((current) => update(current ?? getEventsHero(query.data?.eventsHero)));
  const save = useMutation({
    mutationFn: async () => {
      const parsed = eventsHeroSchema.safeParse(hero);
      if (!parsed.success)
        throw new Error(parsed.error.issues[0]?.message ?? "Check the hero fields.");
      const latest = await getSiteSettings();
      if (JSON.stringify(latest.eventsHero) !== JSON.stringify(query.data?.eventsHero))
        throw new Error("The Events hero changed in another session. Reload before saving.");
      return saveSiteSettings({ ...latest, eventsHero: parsed.data });
    },
    onSuccess: (content) => {
      client.setQueryData(["site-settings"], content);
      void client.invalidateQueries({ queryKey: ["site-content"] });
      setDraft(null);
      toast.success("Events hero saved.");
    },
    onError: (error) => toast.error(error.message),
  });
  async function upload(file: File) {
    setUploading(true);
    try {
      const url = await uploadImage("gallery-images", file, "events-hero");
      change((value) =>
        withEventsHeroSlides(value, [
          ...getEventsHeroDraftSlides(value),
          { imageUrl: url, title: "", description: "" },
        ]),
      );
      toast.success("Photo uploaded. Save the hero to publish it.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Photo upload failed.");
    } finally {
      setUploading(false);
    }
  }
  function move(index: number, delta: number) {
    change((value) => {
      const slides = getEventsHeroDraftSlides(value);
      const slide = slides.splice(index, 1)[0];
      if (slide !== undefined) slides.splice(index + delta, 0, slide);
      return withEventsHeroSlides(value, slides);
    });
  }
  const busy = uploading || save.isPending;
  return (
    <AdminLayout
      title="Events Hero"
      subtitle="Manage the Events page heading and rotating photos. Homepage photos are managed separately."
    >
      {query.isPending ? (
        <LoadingSkeleton />
      ) : query.isError ? (
        <ErrorState
          message="Unable to load the Events hero."
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
          <fieldset disabled={busy} className="space-y-5 rounded-[5px] border bg-white p-5 sm:p-7">
            <label className="block space-y-2 text-sm font-semibold">
              Default heading
              <input
                required
                maxLength={120}
                className={fieldClass}
                value={hero.title}
                onChange={(event) => change((value) => ({ ...value, title: event.target.value }))}
              />
            </label>
            <label className="block space-y-2 text-sm font-semibold">
              Default description
              <textarea
                required
                maxLength={600}
                className={textAreaClass}
                value={hero.description}
                onChange={(event) =>
                  change((value) => ({ ...value, description: event.target.value }))
                }
              />
            </label>
            <div>
              <h2 className="font-bold">Hero photos ({hero.images.length}/8)</h2>
              <p className="mt-1 text-sm text-slate-500">
                Text fades in for two seconds, stays for three, then the next photo appears. Add a
                heading and description for each photo, or leave them blank to use the defaults
                above.
              </p>
            </div>
            {hero.images.map((url, index) => (
              <div key={index} className="space-y-3 rounded-[5px] border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold">Photo {index + 1}</h3>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      aria-label={`Move photo ${index + 1} up`}
                      className={secondaryButtonClass}
                      disabled={index === 0}
                      onClick={() => move(index, -1)}
                    >
                      <ArrowUp className="size-4" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Move photo ${index + 1} down`}
                      className={secondaryButtonClass}
                      disabled={index === hero.images.length - 1}
                      onClick={() => move(index, 1)}
                    >
                      <ArrowDown className="size-4" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Remove photo ${index + 1}`}
                      className={secondaryButtonClass}
                      onClick={() =>
                        change((value) =>
                          withEventsHeroSlides(
                            value,
                            getEventsHeroDraftSlides(value).filter((_, i) => i !== index),
                          ),
                        )
                      }
                    >
                      <Trash2 className="size-4 text-red-600" />
                    </button>
                  </div>
                </div>
                <label className="block space-y-1 text-sm">
                  HTTPS photo URL
                  <input
                    required
                    type="url"
                    className={fieldClass}
                    placeholder="https://…"
                    value={url}
                    onChange={(event) =>
                      change((value) =>
                        withEventsHeroSlides(
                          value,
                          getEventsHeroDraftSlides(value).map((slide, i) =>
                            i === index ? { ...slide, imageUrl: event.target.value } : slide,
                          ),
                        ),
                      )
                    }
                  />
                </label>
                <label className="block space-y-1 text-sm">
                  Photo heading (optional)
                  <input
                    maxLength={120}
                    className={fieldClass}
                    value={hero.imageContent?.[index]?.title ?? ""}
                    placeholder={hero.title}
                    onChange={(event) =>
                      change((value) =>
                        withEventsHeroSlides(
                          value,
                          getEventsHeroDraftSlides(value).map((slide, i) =>
                            i === index ? { ...slide, title: event.target.value } : slide,
                          ),
                        ),
                      )
                    }
                  />
                </label>
                <label className="block space-y-1 text-sm">
                  Photo description (optional)
                  <textarea
                    maxLength={600}
                    className={textAreaClass}
                    value={hero.imageContent?.[index]?.description ?? ""}
                    placeholder={hero.description}
                    onChange={(event) =>
                      change((value) =>
                        withEventsHeroSlides(
                          value,
                          getEventsHeroDraftSlides(value).map((slide, i) =>
                            i === index ? { ...slide, description: event.target.value } : slide,
                          ),
                        ),
                      )
                    }
                  />
                </label>
                {url.startsWith("https://") && (
                  <img
                    src={url}
                    alt={`Hero photo ${index + 1} preview`}
                    className="aspect-video max-h-48 rounded-[5px] object-cover"
                  />
                )}
              </div>
            ))}
            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                className={secondaryButtonClass}
                disabled={hero.images.length >= 8}
                onClick={() =>
                  change((value) =>
                    withEventsHeroSlides(value, [
                      ...getEventsHeroDraftSlides(value),
                      { imageUrl: "", title: "", description: "" },
                    ]),
                  )
                }
              >
                <Plus className="size-4" />
                Add photo URL
              </button>
              <label className="text-sm font-semibold">
                Upload photo
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={hero.images.length >= 8}
                  className="mt-2 block text-sm font-normal"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void upload(file);
                    event.target.value = "";
                  }}
                />
              </label>
            </div>
            <p className="text-xs text-slate-500">
              JPG, PNG or WebP, up to 5MB. Wide landscape photos work best.{" "}
              {uploading ? "Uploading…" : ""}
            </p>
          </fieldset>
          <div className="flex gap-3">
            <button className={primaryButtonClass} disabled={busy || draft === null}>
              {save.isPending ? "Saving…" : "Save Events hero"}
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
              Unsaved changes. Photos are published or removed only after saving.
            </p>
          )}
        </form>
      )}
    </AdminLayout>
  );
}
