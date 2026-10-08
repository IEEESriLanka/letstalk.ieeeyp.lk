import { ArrowUpRight, CalendarDays, Newspaper } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPublications } from "@/lib/publication-actions";
import { publicationSource, type Publication } from "@/lib/publications";
import { Reveal } from "./motion-primitives";

function PublicationImage({ article }: { article: Publication }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-ieee-tint/50">
      {article.imageUrl && !failed ? (
        <img
          src={article.imageUrl}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="size-full object-contain"
        />
      ) : (
        <div className="grid size-full place-items-center text-ieee/40" aria-hidden="true">
          <Newspaper className="size-14" />
        </div>
      )}
      <span className="absolute top-3 left-3 rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold tracking-wider text-ieee shadow-sm">
        LETs TALK
      </span>
    </div>
  );
}

export function LatestArticles() {
  const query = useQuery({
    queryKey: ["lets-talk-publications"],
    queryFn: () => getPublications(),
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });
  const articles = query.data ?? [];
  return (
    <section id="articles" aria-labelledby="articles-title" className="scroll-mt-24 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5">
        <Reveal className="text-center">
          <p className="text-xs font-semibold tracking-[0.16em] text-orange uppercase">
            Stay updated
          </p>
          <h2
            id="articles-title"
            className="mt-3 text-3xl font-bold tracking-tight text-heading sm:text-5xl"
          >
            Latest Articles
          </h2>
        </Reveal>
        {query.isPending && (
          <div role="status" className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <span className="sr-only">Loading LETs Talk articles...</span>
            {[0, 1, 2, 3].map((item) => (
              <div
                key={item}
                aria-hidden="true"
                className="h-96 rounded-3xl bg-ieee-tint/60 motion-safe:animate-pulse"
              />
            ))}
          </div>
        )}
        {query.isError && (
          <div role="status" className="mt-10 text-center text-body">
            <p>Articles are temporarily unavailable.</p>
            <button
              type="button"
              onClick={() => void query.refetch()}
              className="mt-3 min-h-11 font-semibold text-ieee underline"
            >
              Try again
            </button>
          </div>
        )}
        {query.isSuccess && articles.length === 0 && (
          <p className="mt-10 text-center text-body">
            New LETs Talk articles will appear here when published.
          </p>
        )}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {articles.slice(0, 4).map((article) => (
            <article
              key={article.url}
              className="flex min-w-0 flex-col rounded-3xl border border-border/60 bg-white/90 p-3 shadow-sm"
            >
              <PublicationImage article={article} />
              <div className="flex flex-1 flex-col px-2 pb-2 pt-5">
                <time
                  dateTime={article.publishedAt}
                  className="flex items-center gap-2 text-[11px] font-semibold tracking-wider text-[#b84900] uppercase"
                >
                  <CalendarDays className="size-3.5 shrink-0" aria-hidden="true" />
                  {new Intl.DateTimeFormat("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    timeZone: "UTC",
                  }).format(new Date(article.publishedAt))}
                </time>
                <h3 className="mt-3 text-lg font-bold leading-snug text-heading">
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-ieee focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ieee"
                  >
                    {article.title}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </h3>
                <div className="mt-auto pt-5">
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Read ${article.title} (opens in a new tab)`}
                    className="flex min-h-11 items-center gap-2 border-t border-border/60 pt-3 text-sm font-semibold text-[#b84900] hover:text-ieee focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ieee"
                  >
                    Read more <ArrowUpRight className="size-4" aria-hidden="true" />
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-body">
          Published by{" "}
          <a
            href={`${publicationSource}/blogs`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-ieee underline underline-offset-4"
          >
            IEEE Young Professionals Sri Lanka<span className="sr-only"> (opens in a new tab)</span>
          </a>
        </p>
      </div>
    </section>
  );
}
