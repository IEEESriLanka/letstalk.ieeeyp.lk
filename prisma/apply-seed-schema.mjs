import { readFile } from "node:fs/promises";
import { config } from "dotenv";
import postgres from "postgres";

config({ path: ".env" });
config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;

if (!connectionString) {
  throw new Error("Missing DATABASE_URL or DIRECT_URL.");
}

const sql = postgres(connectionString, {
  max: 1,
  idle_timeout: 5,
  connect_timeout: 20,
});

const schema = await readFile(new URL("./seed-schema.sql", import.meta.url), "utf8");
const statements = schema
  .split(";")
  .map((statement) => statement.trim())
  .filter(Boolean);

try {
  for (const statement of statements) {
    await sql.unsafe(statement);
  }

  console.log(`Applied seed schema: ${statements.length} statements`);
} finally {
  await sql.end();
}
