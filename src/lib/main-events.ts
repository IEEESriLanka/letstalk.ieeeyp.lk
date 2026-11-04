import { z } from "zod";
import { defaultSiteContent, type SiteContent } from "./site-content";

export const mainEventsSchema = z.array(z.object({
  title: z.string().trim().min(1, "Enter a topic.").max(200).optional(),
  description: z.string().trim().min(1, "Enter a description.").max(20000),
  homepageContent: z.string().trim().min(1, "Enter homepage content.").max(20000).optional(),
  imageUrl: z.union([z.literal(""), z.string().url()]),
  detailTitle: z.string().trim().min(1, "Enter a detail-page topic.").max(200).optional(),
  detailDescription: z.string().trim().min(1, "Enter a full description.").max(20000).optional(),
  detailImageUrl: z.union([z.literal(""), z.string().url()]).optional(),
})).length(3, "Our Main Events must contain exactly three cards.");

export type MainEventContent = z.infer<typeof mainEventsSchema>[number];

// Stable IDs keep detail-page links working when administrators rename topics.
export const mainEventDefinitions = defaultSiteContent.events.slice(0, 3).map((event, index) => ({
  id: `main-event-${index + 1}`,
  title: event.title,
  description: event.description,
  imageUrl: event.imageUrl || "",
}));

export function getMainEvents(content: Pick<SiteContent, "mainEvents">) {
  return mainEventDefinitions.map((definition, index) => ({
    ...definition,
    ...content.mainEvents?.[index],
    id: definition.id,
    title: content.mainEvents?.[index]?.title?.trim() || definition.title,
  }));
}

export function getMainEventDetails(content: Pick<SiteContent, "mainEvents">) {
  return getMainEvents(content).map((event) => ({
    ...event,
    title: event.detailTitle ?? event.title,
    description: event.detailDescription ?? event.description,
    imageUrl: event.detailImageUrl ?? event.imageUrl,
  }));
}
