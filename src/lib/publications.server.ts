import { parsePublications, publicationSource, type Publication } from "./publications";

const cacheDuration = 10 * 60 * 1000;
let cache: { articles: Publication[]; expires: number } | undefined;
let pending: Promise<Publication[]> | undefined;

export async function readPublications(): Promise<Publication[]> {
  if (cache && cache.expires > Date.now()) return cache.articles;
  if (pending) return pending;

  pending = (async () => {
    const url = new URL("/api/articles", publicationSource);
    url.search = new URLSearchParams({
      "where[project][equals]": "lets-talk",
      "where[_status][equals]": "published",
      limit: "4",
      sort: "-publishDate",
      depth: "1",
    }).toString();
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error("Article source is unavailable.");
    const articles = parsePublications(await response.json());
    cache = { articles, expires: Date.now() + cacheDuration };
    return articles;
  })();

  try {
    return await pending;
  } catch {
    if (cache) {
      // Keep the last successful feed and back off briefly during source outages.
      cache.expires = Date.now() + 60000;
      return cache.articles;
    }
    throw new Error("Articles are temporarily unavailable. Please try again.");
  } finally {
    pending = undefined;
  }
}
