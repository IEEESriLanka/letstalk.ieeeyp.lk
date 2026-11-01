import { z } from "zod";

export const eventsHeroSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(600),
  images: z
    .array(
      z
        .string()
        .url()
        .refine((url) => new URL(url).protocol === "https:", "Use HTTPS photo URLs."),
    )
    .max(8),
  imageContent: z
    .array(
      z.object({
        title: z.string().trim().max(120),
        description: z.string().trim().max(600),
      }),
    )
    .max(8)
    .optional(),
});

export type EventsHeroContent = z.infer<typeof eventsHeroSchema>;

export const defaultEventsHero: EventsHeroContent = {
  title: "Ideas meet opportunity.",
  description:
    "Discover inspiring talks, hands-on workshops, and meaningful connections. Explore what is next with IEEE LETs talk.",
  images: [],
};

export function getEventsHero(value: unknown): EventsHeroContent {
  const parsed = eventsHeroSchema.safeParse(value);
  return parsed.success ? parsed.data : defaultEventsHero;
}

export function getEventsHeroDraftSlides(hero: EventsHeroContent) {
  return hero.images.map((imageUrl, index) => ({
    imageUrl,
    title: hero.imageContent?.[index]?.title ?? "",
    description: hero.imageContent?.[index]?.description ?? "",
  }));
}

export function getEventsHeroSlides(hero: EventsHeroContent) {
  return getEventsHeroDraftSlides(hero).map((slide) => ({
    ...slide,
    title: slide.title || hero.title,
    description: slide.description || hero.description,
  }));
}

export function withEventsHeroSlides(
  hero: EventsHeroContent,
  slides: ReturnType<typeof getEventsHeroSlides>,
): EventsHeroContent {
  return {
    ...hero,
    images: slides.map((slide) => slide.imageUrl),
    imageContent: slides.map(({ title, description }) => ({ title, description })),
  };
}
