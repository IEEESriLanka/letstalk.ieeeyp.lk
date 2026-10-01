import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminLayout } from "@/admin/components/AdminLayout";
import { fieldClass, primaryButtonClass } from "@/admin/components/AdminPrimitives";
import { getSiteSettings, saveSiteSettings } from "@/admin/services/admin-data";
import { youtubeVideoId } from "@/lib/curated-videos";

export function VideosPage() {
  const client = useQueryClient();
  const query = useQuery({ queryKey: ["site-settings"], queryFn: getSiteSettings });
  const [draft, setDraft] = useState<Array<{ url: string; title: string }> | null>(null);
  const videos = Array.from({ length: 6 }, (_, i) => (draft ?? query.data?.videoLinks)?.[i] ?? { url: "", title: "" });
  const save = useMutation({
    mutationFn: async () => {
      const filled = videos.filter((video) => video.url.trim());
      const ids = filled.map((video) => youtubeVideoId(video.url));
      if (ids.some((id) => !id)) throw new Error("Use valid YouTube video links. Shorts links are not allowed.");
      if (new Set(ids).size !== ids.length) throw new Error("Each video must be different.");
      const latest = await getSiteSettings();
      return saveSiteSettings({ ...latest, videoLinks: filled.map((video, i) => ({ url: `https://www.youtube.com/watch?v=${ids[i]}`, title: video.title.trim() || `LETs Talk — Video ${i + 1}` })) });
    },
    onSuccess: (content) => {
      client.setQueryData(["site-settings"], content);
      void client.invalidateQueries({ queryKey: ["site-content"] });
      setDraft(null);
      toast.success("Videos published.");
    },
    onError: (error) => toast.error(error.message),
  });
  return <AdminLayout title="LETs Talk Videos" subtitle="Add up to six full-length YouTube videos. Leave a link empty to remove it. Shorts are not supported.">
    {query.isLoading ? <p>Loading videos…</p> : query.isError ? <button onClick={() => void query.refetch()}>Unable to load videos. Try again.</button> :
      <form onSubmit={(event) => { event.preventDefault(); save.mutate(); }} className="space-y-4">
        <fieldset disabled={save.isPending} className="grid gap-4 md:grid-cols-2">
          {videos.map((video, i) => <div key={i} className="space-y-3 rounded-xl border bg-white p-5">
            <h2 className="font-bold">Video {i + 1}</h2>
            <label className="block text-sm">YouTube link<input type="url" className={fieldClass} value={video.url} placeholder="https://www.youtube.com/watch?v=…" onChange={(event) => setDraft(videos.map((v, j) => j === i ? { ...v, url: event.target.value } : v))} /></label>
            <label className="block text-sm">Title (optional)<input className={fieldClass} value={video.title} onChange={(event) => setDraft(videos.map((v, j) => j === i ? { ...v, title: event.target.value } : v))} /></label>
            {youtubeVideoId(video.url) ? <img src={`https://i.ytimg.com/vi/${youtubeVideoId(video.url)}/hqdefault.jpg`} alt="Video thumbnail preview" className="aspect-video w-full rounded-lg object-cover" /> : null}
          </div>)}
        </fieldset>
        <button className={primaryButtonClass} disabled={save.isPending}>{save.isPending ? "Saving…" : "Save videos"}</button>
      </form>}
  </AdminLayout>;
}
