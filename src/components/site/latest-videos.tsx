import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Play, Youtube } from "lucide-react";
import { useState } from "react";
import { getSiteContent } from "@/lib/content-actions";
import { youtubeVideoId } from "@/lib/curated-videos";
import { videoRefreshInterval, youtubeChannelUrl, type TalkVideo } from "@/lib/youtube-videos";
import { Reveal } from "./motion-primitives";

function VideoCard({ video }: { video: TalkVideo }) {
  const [imageFailed, setImageFailed] = useState(false);
  return (
    <article className="overflow-hidden rounded-2xl border border-border/60 bg-white/90 shadow-sm">
      <a
        href={video.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex h-full flex-col focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ieee"
      >
        <div className="relative grid aspect-video place-items-center overflow-hidden bg-[#edf3fa]">
          {!imageFailed && (
            <img
              src={video.thumbnailUrl}
              alt=""
              width="480"
              height="360"
              loading="lazy"
              decoding="async"
              onError={() => setImageFailed(true)}
              className="absolute inset-0 size-full object-cover"
            />
          )}
          <span
            aria-hidden="true"
            className="relative grid size-14 place-items-center rounded-full bg-[#003b6f]/90 text-white shadow-lg transition-colors group-hover:bg-orange"
          >
            <Play className="ml-1 size-6 fill-current" />
          </span>
          <span className="absolute top-3 left-3 rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold tracking-wider text-ieee">
            {video.isShort ? "LETs TALK CLIP" : "LETs TALK"}
          </span>
        </div>
        <div className="flex flex-1 flex-col p-5">
          <h3 className="mt-3 text-lg font-bold leading-snug text-heading group-hover:text-ieee">
            {video.title}
          </h3>
          <span className="mt-auto flex items-center gap-2 pt-5 text-sm font-semibold text-[#b84900]">
            Watch on YouTube <ArrowUpRight className="size-4" aria-hidden="true" />
            <span className="sr-only"> (opens in a new tab)</span>
          </span>
        </div>
      </a>
    </article>
  );
}

export function LatestVideos() {
  const query = useQuery({
    queryKey: ["site-content"],
    queryFn: () => getSiteContent(),
    staleTime: videoRefreshInterval,
    refetchInterval: videoRefreshInterval,
    retry: 1,
  });
  const videos: TalkVideo[] = (query.data?.videoLinks ?? []).slice(0, 6).flatMap((video) => {
    const id = youtubeVideoId(video.url);
    return id ? [{ id, title: video.title || "LETs Talk", url: `https://www.youtube.com/watch?v=${id}`, thumbnailUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`, publishedAt: "", isShort: false }] : [];
  });
  return (
    <section id="videos" aria-labelledby="videos-title" className="scroll-mt-24 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold tracking-[0.16em] text-orange uppercase">
            Watch &amp; learn
          </p>
          <h2
            id="videos-title"
            className="mt-3 text-3xl font-bold tracking-tight text-heading sm:text-5xl"
          >
            LETs Talk Videos
          </h2>
          <p className="mt-4 text-body">
            Conversations, leadership lessons, and highlights from our community.
          </p>
        </Reveal>
        {query.isPending && (
          <div role="status" className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <span className="sr-only">Loading LETs Talk videos...</span>
            {[0, 1, 2].map((key) => (
              <div
                key={key}
                aria-hidden="true"
                className="h-80 rounded-2xl bg-ieee-tint/60 motion-safe:animate-pulse"
              />
            ))}
          </div>
        )}
        {query.isError && videos.length === 0 && (
          <div role="status" className="mt-10 text-center text-body">
            <p>Videos are temporarily unavailable. You can still watch on our YouTube channel.</p>
            <button
              type="button"
              onClick={() => void query.refetch()}
              className="mt-3 min-h-11 font-semibold text-ieee underline"
            >
              Try again
            </button>
          </div>
        )}
        {query.isSuccess && videos.length === 0 && (
          <p className="mt-10 text-center text-body">
            Videos will appear here when added by our team.
          </p>
        )}
        {videos.length > 0 && (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}
        <div className="mt-10 text-center">
          <a
            href={youtubeChannelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-ieee/25 bg-white/80 px-6 py-3 text-sm font-semibold text-ieee hover:bg-ieee-tint focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ieee"
          >
            <Youtube className="size-5" aria-hidden="true" /> Visit our YouTube channel
            <ArrowUpRight className="size-4" aria-hidden="true" />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
      </div>
    </section>
  );
}
