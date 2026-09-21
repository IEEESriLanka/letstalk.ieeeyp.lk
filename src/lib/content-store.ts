import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { defaultSiteContent, type ContactMessage, type SiteContent } from "./site-content";

const iconSchemas = {
  event: z.enum(["mic", "brain", "lightbulb"]),
  journey: z.enum(["mic", "graduation", "sparkles", "brain", "users"]),
  pillar: z.enum(["lightbulb", "mic", "brain", "network"]),
  gallery: z.enum(["gallery-1", "gallery-2", "gallery-3", "gallery-4"]),
};

export const siteContentSchema: z.ZodType<SiteContent> = z.object({
  hero: z.object({
    eyebrow: z.string().min(1),
    title: z.string().min(1),
    highlightedTitle: z.string().min(1),
    description: z.string().min(1),
    stats: z.array(z.object({ value: z.string().min(1), label: z.string().min(1) })).min(1),
  }),
  about: z.object({
    eyebrow: z.string().min(1),
    title: z.string().min(1),
    highlightedWords: z.string().min(1),
    accentWords: z.string().min(1),
    copy: z.string().min(1),
    quote: z.string().min(1),
    quoteBy: z.string().min(1),
    storyCards: z.array(z.object({ title: z.string().min(1), copy: z.string().min(1) })).optional(),
    values: z.array(z.object({ title: z.string().min(1), copy: z.string().min(1) })).optional(),
    milestones: z.array(z.string().min(1)).optional(),
    pillars: z
      .array(
        z.object({
          icon: iconSchemas.pillar,
          title: z.string().min(1),
          copy: z.string().min(1),
          accent: z.boolean().optional(),
        }),
      )
      .min(1),
  }),
  events: z
    .array(
      z.object({
        tag: z.string().min(1),
        title: z.string().min(1),
        description: z.string().min(1),
        icon: iconSchemas.event,
        badge: z.string().min(1),
        featured: z.boolean().optional(),
        dateLabel: z.string().min(1),
        imageUrl: z.string().nullable().optional(),
        registrationUrl: z.string().nullable().optional(),
      }),
    )
    .min(1),
  journeyTracks: z
    .array(
      z.object({
        title: z.string().min(1),
        subtitle: z.string().min(1),
        description: z.string().min(1),
        badge: z.string().min(1),
        icon: iconSchemas.journey,
      }),
    )
    .min(1),
  gallery: z
    .array(
      z.object({
        image: iconSchemas.gallery,
        alt: z.string().min(1),
        caption: z.string().min(1),
        span: z.string().optional(),
        imageUrl: z.string().nullable().optional(),
      }),
    )
    .min(1),
  awards: z.object({
    title: z.string().min(1),
    awardName: z.string().min(1),
    program: z.string().min(1),
    description: z.string().min(1),
    label: z.string().min(1),
  }),
  partners: z.array(z.string().min(1)).min(1),
  connected: z.object({
    title: z.string().min(1),
    copy: z.string().min(1),
    primaryCta: z.string().min(1),
    secondaryCta: z.string().min(1),
  }),
  contact: z.object({
    email: z.string().email(),
    whatsappLabel: z.string().min(1),
    organization: z.string().min(1),
    copy: z.string().min(1),
  }),
  teamPage: z
    .object({
      yearlyTeams: z.array(z.object({
        year: z.string().regex(/^\d{4}$/),
        members: z.array(z.object({
          name: z.string().trim().min(1),
          role: z.string().trim().min(1),
          track: z.string(),
          initials: z.string(),
          imageUrl: z.string().nullable().optional(),
          linkedinUrl: z.string().nullable().optional(),
          email: z.string().nullable().optional(),
        })),
      })).optional(),
      eyebrow: z.string().min(1),
      title: z.string().min(1),
      highlightedTitle: z.string().min(1),
      description: z.string().min(1),
      currentMembers: z
        .array(
          z.object({
            name: z.string().min(1),
            role: z.string().min(1),
            track: z.string().min(1),
            initials: z.string().min(1),
            imageUrl: z.string().nullable().optional(),
            linkedinUrl: z.string().nullable().optional(),
            email: z.string().nullable().optional(),
          }),
        )
        .min(1),
      pastTeams: z
        .array(
          z.object({
            year: z.string().min(1),
            theme: z.string().min(1),
            members: z.array(z.string().min(1)).min(1),
          }),
        )
        .min(1),
      workAreas: z.array(z.string().min(1)).min(1),
    })
    .optional(),
});

export const contactMessageSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(180),
  topic: z.string().max(180).optional().default("General inquiry"),
  message: z.string().max(3000).optional().default(""),
});

function getSupabase() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

function mergeContent(stored: SiteContent): SiteContent {
  return {
    ...defaultSiteContent,
    ...stored,
    hero: { ...defaultSiteContent.hero, ...stored.hero },
    about: { ...defaultSiteContent.about, ...stored.about },
    awards: { ...defaultSiteContent.awards, ...stored.awards },
    connected: { ...defaultSiteContent.connected, ...stored.connected },
    contact: { ...defaultSiteContent.contact, ...stored.contact },
    teamPage: { ...defaultSiteContent.teamPage, ...stored.teamPage },
  };
}

export async function readSiteContent(): Promise<SiteContent> {
  const supabase = getSupabase();
  if (!supabase) return defaultSiteContent;

  const [site, events, gallery, awards, partners] = await Promise.all([
    supabase.from("site_content").select("content").eq("id", "site").maybeSingle(),
    supabase
      .from("events")
      .select("*")
      .eq("published", true)
      .order("event_date", { ascending: false }),
    supabase
      .from("gallery_items")
      .select("*")
      .eq("published", true)
      .order("display_order", { ascending: true }),
    supabase.from("awards").select("*").eq("published", true).order("award_year", { ascending: false }),
    supabase.from("partners").select("*").eq("active", true).order("display_order", { ascending: true }),
  ]);

  if (site.error) throw new Error(site.error.message);
  if (events.error) throw new Error(events.error.message);
  if (gallery.error) throw new Error(gallery.error.message);
  if (awards.error) throw new Error(awards.error.message);
  if (partners.error) throw new Error(partners.error.message);

  const base = mergeContent(site.data?.content ? siteContentSchema.parse(site.data.content) : defaultSiteContent);
  const award = awards.data?.[0];

  return {
    ...base,
    awards: award
      ? {
          ...base.awards,
          awardName: award.title,
          description: award.description,
          label: award.award_year ? String(award.award_year) : base.awards.label,
        }
      : base.awards,
    events: (events.data ?? []).map((event) => ({
      tag: event.location,
      title: event.title,
      description: event.description,
      icon: "mic",
      badge: event.start_time || event.location,
      featured: true,
      dateLabel: event.event_date,
      imageUrl: event.cover_image_url,
      registrationUrl: event.registration_url,
    })),
    gallery: (gallery.data ?? []).map((item) => ({
      image: "gallery-1",
      alt: item.caption || item.title,
      caption: item.title,
      imageUrl: item.image_url,
    })),
    partners: (partners.data ?? []).map((partner) => partner.name),
  } as SiteContent;
}

export async function updateSiteContent(_pin: string, content: SiteContent): Promise<SiteContent> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase environment variables are missing.");
  const parsed = siteContentSchema.parse(content);
  const { error } = await supabase
    .from("site_content")
    .upsert({ id: "site", content: parsed, updated_at: new Date().toISOString() });
  if (error) throw new Error(error.message);
  return parsed;
}

export async function readContactMessages(_pin: string): Promise<ContactMessage[]> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase environment variables are missing.");
  const { data, error } = await supabase
    .from("contact_messages")
    .select("id,name,email,topic,message,created_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((item) => ({
    id: String(item.id),
    name: item.name,
    email: item.email,
    topic: item.topic,
    message: item.message,
    createdAt: item.created_at,
  }));
}

export async function addContactMessage(input: unknown) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase environment variables are missing.");
  const parsed = contactMessageSchema.parse(input);
  const { error } = await supabase.from("contact_messages").insert({
    name: parsed.name,
    email: parsed.email,
    topic: parsed.topic || "General inquiry",
    message: parsed.message || "",
  });
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function resetSiteContent(pin: string): Promise<SiteContent> {
  return updateSiteContent(pin, defaultSiteContent);
}
