import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env" });
config({ path: ".env.local" });

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error("Missing SUPABASE_URL or VITE_SUPABASE_URL.");
}

if (!supabaseKey) {
  throw new Error("Missing SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY.");
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

const now = new Date();

function daysFromNow(days) {
  const date = new Date(now);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function daysAgo(days) {
  const date = new Date(now);
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString();
}

async function upsertRows(table, rows, options = {}) {
  const { error, count } = await supabase
    .from(table)
    .upsert(rows, { onConflict: "id", count: "exact", ...options });

  if (error) {
    throw new Error(`Failed to seed ${table}: ${error.message}`);
  }

  console.log(`Seeded ${table}: ${count ?? rows.length} rows`);
}

async function main() {
  await upsertRows("events", [
    {
      id: "11111111-1111-4111-8111-111111111111",
      title: "Road to Ignite - Session 12",
      description:
        "A leadership conversation with industry experts about career growth, innovation, and professional confidence.",
      event_date: daysFromNow(21),
      start_time: "18:30",
      location: "IEEE Sri Lanka Section Auditorium",
      registration_url: "https://ieeeyp.lk",
      cover_image_url: "/lets-talk-logo.png",
      published: true,
      created_at: daysAgo(12),
      updated_at: now.toISOString(),
    },
    {
      id: "11111111-1111-4111-8111-111111111112",
      title: "Data Science Workshop",
      description:
        "A hands-on workshop covering applied analytics, model thinking, and real-world data science workflows.",
      event_date: daysFromNow(45),
      start_time: "09:30",
      location: "University of Colombo School of Computing",
      registration_url: "https://ieeeyp.lk",
      cover_image_url: "/lets-talk-logo.png",
      published: true,
      created_at: daysAgo(8),
      updated_at: now.toISOString(),
    },
    {
      id: "11111111-1111-4111-8111-111111111113",
      title: "InsightX - Beyond the Model",
      description:
        "A special edition session exploring how engineering teams turn models into usable products and decisions.",
      event_date: daysFromNow(70),
      start_time: "17:30",
      location: "Online",
      registration_url: null,
      cover_image_url: "/lets-talk-logo.png",
      published: false,
      created_at: daysAgo(3),
      updated_at: now.toISOString(),
    },
  ]);

  await upsertRows("programs", [
    {
      id: "22222222-2222-4222-8222-222222222221",
      title: "Road to Ignite",
      description:
        "The flagship LETs Talk leadership series featuring conversations with founders, executives, and technology leaders.",
      cover_image_url: "/lets-talk-logo.png",
      published: true,
      created_at: daysAgo(20),
      updated_at: now.toISOString(),
    },
    {
      id: "22222222-2222-4222-8222-222222222222",
      title: "Upskill",
      description:
        "Practical workshops designed to help students and young professionals build job-ready skills.",
      cover_image_url: "/lets-talk-logo.png",
      published: true,
      created_at: daysAgo(16),
      updated_at: now.toISOString(),
    },
    {
      id: "22222222-2222-4222-8222-222222222223",
      title: "Creative Sri Lanka",
      description:
        "A creative technology and innovation track for multidisciplinary builders and young professionals.",
      cover_image_url: "/lets-talk-logo.png",
      published: false,
      created_at: daysAgo(6),
      updated_at: now.toISOString(),
    },
  ]);

  await upsertRows("gallery_items", [
    {
      id: "33333333-3333-4333-8333-333333333331",
      title: "Leadership Session",
      caption:
        "Industry leaders sharing practical career lessons with the LETs Talk community.",
      image_url: "/lets-talk-logo.png",
      display_order: 1,
      published: true,
      created_at: daysAgo(14),
      updated_at: now.toISOString(),
    },
    {
      id: "33333333-3333-4333-8333-333333333332",
      title: "Hands-on Workshop",
      caption:
        "Participants collaborating during an interactive engineering workshop.",
      image_url: "/lets-talk-logo.png",
      display_order: 2,
      published: true,
      created_at: daysAgo(11),
      updated_at: now.toISOString(),
    },
    {
      id: "33333333-3333-4333-8333-333333333333",
      title: "Networking Moment",
      caption: "Young professionals connecting after a LETs Talk session.",
      image_url: "/lets-talk-logo.png",
      display_order: 3,
      published: false,
      created_at: daysAgo(5),
      updated_at: now.toISOString(),
    },
  ]);

  await upsertRows("awards", [
    {
      id: "44444444-4444-4444-8444-444444444441",
      title: "Best Industry Collaborative Project Award",
      description:
        "Recognition for bridging academia and industry through practical, experience-driven learning.",
      award_year: 2024,
      image_url: "/lets-talk-logo.png",
      published: true,
      created_at: daysAgo(18),
      updated_at: now.toISOString(),
    },
    {
      id: "44444444-4444-4444-8444-444444444442",
      title: "Vision to Value Recognition",
      description:
        "Awarded for creating high-impact professional development experiences for young engineers.",
      award_year: 2023,
      image_url: "/lets-talk-logo.png",
      published: true,
      created_at: daysAgo(10),
      updated_at: now.toISOString(),
    },
  ]);

  await upsertRows("partners", [
    {
      id: "55555555-5555-4555-8555-555555555551",
      name: "IEEE Sri Lanka Section",
      logo_url: "/lets-talk-logo.png",
      website_url: "https://ieee.lk",
      display_order: 1,
      active: true,
      created_at: daysAgo(24),
      updated_at: now.toISOString(),
    },
    {
      id: "55555555-5555-4555-8555-555555555552",
      name: "IEEE Young Professionals Sri Lanka",
      logo_url: "/lets-talk-logo.png",
      website_url: "https://ieeeyp.lk",
      display_order: 2,
      active: true,
      created_at: daysAgo(22),
      updated_at: now.toISOString(),
    },
    {
      id: "55555555-5555-4555-8555-555555555553",
      name: "Industry Tech Partner",
      logo_url: "/lets-talk-logo.png",
      website_url: "https://ieeeyp.lk",
      display_order: 3,
      active: false,
      created_at: daysAgo(7),
      updated_at: now.toISOString(),
    },
  ]);

  await upsertRows("contact_messages", [
    {
      id: "66666666-6666-4666-8666-666666666661",
      name: "Sample Student",
      email: "student@example.com",
      topic: "Workshop inquiry",
      message:
        "I would like to know when registrations open for the next technical workshop.",
      read: false,
      created_at: daysAgo(2),
    },
    {
      id: "66666666-6666-4666-8666-666666666662",
      name: "Sample Partner",
      email: "partner@example.com",
      topic: "Partnership",
      message:
        "Our organization is interested in collaborating with IEEE LETs Talk for an upcoming session.",
      read: true,
      created_at: daysAgo(6),
    },
  ]);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
