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
    backgroundImages: z.array(z.string().url()).max(8).optional(),
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
    organizations: z
      .array(
        z.object({
          title: z.string().min(1),
          copy: z.string().min(1),
          logoUrl: z.string().nullable().optional(),
        }),
      )
      .optional(),
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
    imageUrl: z.string().nullable().optional(),
  }),
  partners: z.array(z.string().min(1)).min(1),
  videoLinks: z
    .array(z.object({ url: z.string().url(), title: z.string() }))
    .max(6)
    .optional(),
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
      yearlyTeams: z
        .array(
          z.object({
            year: z.string().regex(/^\d{4}$/),
            members: z.array(
              z.object({
                name: z.string().trim().min(1),
                role: z.string().trim().min(1),
                track: z.string(),
                initials: z.string(),
                imageUrl: z.string().nullable().optional(),
                imagePosition: z.string().nullable().optional(),
                linkedinUrl: z.string().nullable().optional(),
                email: z.string().nullable().optional(),
              }),
            ),
          }),
        )
        .optional(),
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
            imagePosition: z.string().nullable().optional(),
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

const contactNotificationRecipient = "ieeeletstalksl@gmail.com";

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character] ?? character,
  );
}

async function sendContactNotification(input: z.infer<typeof contactMessageSchema>) {
  const apiKey = process.envRESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) {
    throw new Error("Contact email delivery is not configured on the server.");
  }

  const topic = input.topic || "General inquiry";
  const message = input.message || "(No message provided)";
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [contactNotificationRecipient],
      reply_to: input.email,
      subject: `New LETs Talk contact: ${topic}`,
      text: [
        `Name: ${input.name}`,
        `Email: ${input.email}`,
        `Topic: ${topic}`,
        "",
        message,
      ].join("\n"),
      html: `
        <h2>New IEEE LETs Talk contact message</h2>
        <p><strong>Name:</strong> ${escapeHtml(input.name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(input.email)}</p>
        <p><strong>Topic:</strong> ${escapeHtml(topic)}</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(message).replace(/\n/g, "<br />")}</p>
      `,
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Contact email delivery failed: ${details}`);
  }
}

function getSupabase() {
  const url =
    process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
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

  const [site, events, gallery, awards, partners, heroBackgrounds, teamContacts, ieeeLogos] = await Promise.all([
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
    supabase
      .from("awards")
      .select("*")
      .eq("published", true)
      .order("award_year", { ascending: false }),
    supabase
      .from("partners")
      .select("*")
      .eq("active", true)
      .order("display_order", { ascending: true }),
    supabase.storage.from("gallery-images").list("hero-backgrounds", {
      limit: 1000,
      sortBy: { column: "created_at", order: "asc" },
    }),
    supabase.from("team_private_contacts").select("year,member_name,phone"),
    supabase.storage.from("IEEE-logos").list("", {
      limit: 100,
      sortBy: { column: "name", order: "asc" },
    }),
  ]);

  if (site.error) throw new Error(site.error.message);
  if (events.error) throw new Error(events.error.message);
  if (gallery.error) throw new Error(gallery.error.message);
  if (awards.error) throw new Error(awards.error.message);
  if (partners.error) throw new Error(partners.error.message);
  if (heroBackgrounds.error) throw new Error(heroBackgrounds.error.message);
  if (teamContacts.error) throw new Error(teamContacts.error.message);

  let storedContent: SiteContent = defaultSiteContent;
  if (site.data?.content) {
    const parsed = siteContentSchema.safeParse(site.data.content);
    if (parsed.success) {
      storedContent = parsed.data;
    } else {
      console.warn("site_content schema validation warning:", parsed.error.issues);
      storedContent = {
        ...defaultSiteContent,
        ...site.data.content,
        hero: { ...defaultSiteContent.hero, ...(site.data.content.hero || {}) },
        about: { ...defaultSiteContent.about, ...(site.data.content.about || {}) },
        awards: { ...defaultSiteContent.awards, ...(site.data.content.awards || {}) },
        connected: { ...defaultSiteContent.connected, ...(site.data.content.connected || {}) },
        contact: { ...defaultSiteContent.contact, ...(site.data.content.contact || {}) },
        teamPage: { ...defaultSiteContent.teamPage, ...(site.data.content.teamPage || {}) },
      } as SiteContent;
    }
  }
  const base = mergeContent(storedContent);
  const award = awards.data?.[0];
  const phoneByMember = new Map(
    (teamContacts.data ?? []).map((contact) => [`${contact.year}:${contact.member_name}`, contact.phone]),
  );
  const teamPage = base.teamPage
    ? {
        ...base.teamPage,
        yearlyTeams: base.teamPage.yearlyTeams?.map((team) => ({
          ...team,
          members: team.members.map((member) => ({
            ...member,
            phone: phoneByMember.get(`${team.year}:${member.name}`) ?? null,
          })),
        })),
        currentMembers: base.teamPage.currentMembers.map((member) => ({
          ...member,
          phone: phoneByMember.get(`2026:${member.name}`) ?? null,
        })),
      }
    : base.teamPage;

  const ieeeLogoFiles = (ieeeLogos?.data ?? []).filter((f) => f.name && !f.name.startsWith("."));
  const resolveIeeeLogo = (title: string, existingLogo?: string | null) => {
    if (existingLogo) return existingLogo;
    const t = title.toLowerCase();
    let file: { name: string } | undefined;
    if (t.includes("section")) {
      file = ieeeLogoFiles.find((f) => /section|sl/i.test(f.name));
    } else if (t.includes("young") || t.includes("yp")) {
      file = ieeeLogoFiles.find((f) => /yp|young/i.test(f.name));
    } else {
      file = ieeeLogoFiles.find((f) => !/section|sl|yp|young/i.test(f.name) && /ieee/i.test(f.name));
    }
    if (file) {
      return supabase.storage.from("IEEE-logos").getPublicUrl(file.name).data.publicUrl;
    }
    return null;
  };

  const organizations = (base.about.organizations ?? defaultSiteContent.about.organizations ?? []).map((org) => ({
    ...org,
    logoUrl: resolveIeeeLogo(org.title, org.logoUrl) ?? org.logoUrl,
  }));

  const ORDERED_HERO_IMAGES = [
    "1790220746938.jpg.jpeg",
    "WhatsApp Image 2026-10-08 at 03.01.45.jpeg",
    "WhatsApp Image 2026-10-08 at 03.01.48.jpeg",
    "ff42cb9e-9e87-45a7-82eb-83bc8a2ce8f1.png",
    "WhatsApp Image 2026-10-08 at 03.01.43.jpeg",
  ];

  const getHeroImagePriority = (nameOrUrl: string) => {
    try {
      const decoded = decodeURIComponent(nameOrUrl);
      const idx = ORDERED_HERO_IMAGES.findIndex((target) => decoded.includes(target));
      return idx === -1 ? 999 : idx;
    } catch {
      return 999;
    }
  };

  const storageHeroImages = (heroBackgrounds.data ?? [])
    .filter((image) => image.id && image.name)
    .sort((a, b) => getHeroImagePriority(a.name) - getHeroImagePriority(b.name))
    .map(
      (image) =>
        supabase.storage.from("gallery-images").getPublicUrl(`hero-backgrounds/${image.name}`)
          .data.publicUrl,
    );

  const heroBackgroundImages = (
    base.hero.backgroundImages && base.hero.backgroundImages.length > 0
      ? [
          ...base.hero.backgroundImages,
          ...storageHeroImages.filter(
            (sUrl) =>
              !(base.hero.backgroundImages ?? []).some(
                (bUrl) => decodeURIComponent(bUrl) === decodeURIComponent(sUrl),
              ),
          ),
        ]
      : storageHeroImages
  ).sort((a, b) => getHeroImagePriority(a) - getHeroImagePriority(b));

  return {
    ...base,
    about: {
      ...base.about,
      organizations,
    },
    teamPage,
    hero: {
      ...base.hero,
      backgroundImages: heroBackgroundImages,
    },
    awards: award
      ? {
          ...base.awards,
          awardName: award.title,
          program: (base.awards.program || "").replace(/^IEEE Sri Lanka Section Awards\s*[-–—:]\s*/i, "").trim(),
          description: award.description,
          label: award.award_year === 2024 || String(award.award_year) === "2024" ? "2025" : (award.award_year ? String(award.award_year) : "2025"),
          imageUrl: award.image_url ?? base.awards.imageUrl,
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
    partnerLogos: (partners.data ?? [])
      .filter((partner) => partner.logo_url)
      .map((partner) => ({ name: partner.name, logoUrl: partner.logo_url! })),
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
  await sendContactNotification(parsed);
  return { ok: true };
}

export async function resetSiteContent(pin: string): Promise<SiteContent> {
  return updateSiteContent(pin, defaultSiteContent);
}
