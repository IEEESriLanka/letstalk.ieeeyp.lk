import { loadEnv } from "vite";
import { createClient } from "@supabase/supabase-js";
import { readFile } from "node:fs/promises";
import ts from "typescript";

// Update only the requested introduction, preserving other CMS edits.
const source = await readFile(new URL("../src/lib/site-content.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { defaultSiteContent } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
const copy = defaultSiteContent.about.copy;
const env = { ...loadEnv("development", process.cwd(), ""), ...process.env };
const url = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
const key = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("Server database credentials are required.");
const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const { data: row, error } = await client.from("site_content").select("content,updated_at").eq("id", "site").single();
if (error) throw new Error(error.message);
if (row.content.about?.copy !== copy) {
  let update = client.from("site_content").update({
    content: { ...row.content, about: { ...row.content.about, copy } },
    updated_at: new Date().toISOString(),
  }).eq("id", "site");
  update = row.updated_at === null ? update.is("updated_at", null) : update.eq("updated_at", row.updated_at);
  const result = await update.select("id").single();
  if (result.error) throw new Error("Introduction was not updated. Retry after checking for concurrent edits: " + result.error.message);
}
const verified = await client.from("site_content").select("content").eq("id", "site").single();
if (verified.error || verified.data.content.about.copy !== copy) throw new Error("Saved introduction verification failed.");
console.log("Verified: saved About Us introduction matches the requested original paragraph.");
