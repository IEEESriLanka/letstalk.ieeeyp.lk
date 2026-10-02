import { readFile } from "node:fs/promises";
import { config } from "dotenv";
import postgres from "postgres";

config({ path: ".env", quiet: true });
config({ path: ".env.local", quiet: true });
const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!connectionString) throw new Error("Missing DIRECT_URL or DATABASE_URL.");
const sql = postgres(connectionString, { max: 1, connect_timeout: 20 });
try {
  const migration = await readFile(new URL("./community-moments.sql", import.meta.url), "utf8");
  await sql.unsafe(migration);
  await sql`select id, show_in_moments from public.gallery_items limit 1`;
  console.log("Community moments selection field applied and verified.");
} finally {
  await sql.end();
}
