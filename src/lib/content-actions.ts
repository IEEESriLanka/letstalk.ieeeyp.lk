import { createServerFn } from "@tanstack/react-start";
import {
  addContactMessage,
  readContactMessages,
  readSiteContent,
  resetSiteContent,
  updateSiteContent,
  contactMessageSchema,
  siteContentSchema,
} from "./content-store";
import type { SiteContent } from "./site-content";

export const getSiteContent = createServerFn({ method: "GET" }).handler(() => {
  return readSiteContent();
});

export const saveSiteContent = createServerFn({ method: "POST" })
  .validator((input: { pin: string; content: SiteContent }) => ({
    pin: input.pin,
    content: siteContentSchema.parse(input.content),
  }))
  .handler(({ data }) => updateSiteContent(data.pin, data.content));

export const restoreDefaultSiteContent = createServerFn({ method: "POST" })
  .validator((input: { pin: string }) => input)
  .handler(({ data }) => resetSiteContent(data.pin));

export const submitContactMessage = createServerFn({ method: "POST" })
  .validator((input: unknown) => contactMessageSchema.parse(input))
  .handler(({ data }) => addContactMessage(data));

export const getContactMessages = createServerFn({ method: "POST" })
  .validator((input: { pin: string }) => input)
  .handler(({ data }) => readContactMessages(data.pin));
