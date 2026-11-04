import { z } from "zod";
import { defaultSiteContent, type SiteContent } from "./site-content";

export const mainEventsSchema = z.array(z.object({
  title: z.string().trim().min(1, "Enter a topic.").max(200).optional(),
  description: z.string().trim().min(1, "Enter a description.").max(20000),
  imageUrl: z.union([z.literal(""), z.string().url()]),
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
