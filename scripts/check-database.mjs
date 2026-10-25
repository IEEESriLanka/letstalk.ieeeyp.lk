import { loadEnv } from "vite";
import { createClient } from "@supabase/supabase-js";

const env = {
  ...loadEnv(process.env.NODE_ENV || "development", process.cwd(), ""),
  ...process.env,
};
const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_PUBLISHABLE_KEY;
if (!url || !key) throw new Error("Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.");
const options = { auth: { persistSession: false, autoRefreshToken: false } };
const client = createClient(url, key, options);
let failed = false;
for (const table of [
  "site_content",
  "events",
  "programs",
  "gallery_albums",
  "gallery_items",
  "awards",
  "partners",
]) {
  const { error, count } = await client.from(table).select("id", { count: "exact", head: true });
  console.log(`${table}: ${error ? error.message : `${count} visible rows`}`);
  if (error) failed = true;
}
const secret = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
if (secret) {
  const admin = createClient(env.SUPABASE_URL || url, secret, options);
  const { error } = await admin.from("admin_users").select("id").limit(1);
  console.log(`Server admin credentials: ${error ? error.message : "OK"}`);
  if (error) failed = true;
  for (const table of ["contact_messages", "team_private_contacts"]) {
    const { error } = await admin.from(table).select("id").limit(1);
    console.log(`${table}: ${error ? error.message : "OK"}`);
    if (error) failed = true;
  }
  const { data: buckets, error: bucketError } = await admin.storage.listBuckets();
  for (const name of ["event-images", "program-images", "gallery-images", "award-images", "partner-logos"]) {
    const issue = bucketError?.message || (!buckets?.some((bucket) => bucket.id === name) ? "Missing storage bucket" : null);
    console.log(`${name}: ${issue || "OK"}`);
    if (issue) failed = true;
  }
} else {
  console.log("Server admin credentials: not configured (required for account management only)");
}
process.exitCode = failed ? 1 : 0;
