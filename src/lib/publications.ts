import { z } from "zod";

export type Publication = {
  title: string;
  url: string;
  imageUrl: string | null;
  publishedAt: string;
};

export const publicationSource = "https://www.ieeeyp.lk";

const sourceArticle = z.object({
  title: z.string().trim().min(1),
  slug: z.string().regex(/^[a-zA-Z0-9_-]+$/),
  project: z.literal("lets-talk"),
  _status: z.literal("published"),
  publishDate: z.string().datetime({ offset: true }),
  featuredImage: z
    .object({
      cloudinaryUrl: z.string().nullish(),
      url: z.string().nullish(),
    })
    .nullish(),
});

/** Accept only published LETs Talk metadata; never render external article HTML. */
export function parsePublications(input: unknown): Publication[] {
  const { docs } = z.object({ docs: z.array(z.unknown()) }).parse(input);
  const articles = docs.flatMap((doc): Publication[] => {
    const parsed = sourceArticle.safeParse(doc);
    if (!parsed.success) return [];
    const article = parsed.data;
    const image = article.featuredImage?.cloudinaryUrl || article.featuredImage?.url;
    let imageUrl: string | null = null;
    if (image) {
      try {
        const url = new URL(image, publicationSource);
        if (url.protocol === "https:") imageUrl = url.href;
      } catch {
        /* A missing image should not hide an otherwise valid article. */
      }
    }
    return [
      {
        title: article.title,
        url: `${publicationSource}/blogs/letstalk/${article.publishDate.slice(0, 4)}/${article.slug}`,
        imageUrl,
        publishedAt: article.publishDate,
      },
    ];
  });
  return [...new Map(articles.map((article) => [article.url, article])).values()]
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
    .slice(0, 4);
}
