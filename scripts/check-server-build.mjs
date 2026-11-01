import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

// Exercise the built SSR entry in a fresh process: compilation alone cannot
// catch functions read before initialization across generated server chunks.
// Run automatically on Vercel; use --vercel to check a local Vercel build.
// Import the actual function entry, including Nitro's runtime setup.
if (!process.env.VERCEL && !process.argv.includes("--vercel")) {
  console.log("Vercel runtime check skipped for the local Node server preset.");
  process.exit(0);
}
const entry = ".vercel/output/functions/__server.func/index.mjs";

const timeout = setTimeout(() => {
  console.error("Built server smoke check timed out.");
  process.exit(1);
}, 30_000);
timeout.unref();

try {
  const { default: server } = await import(pathToFileURL(resolve(entry)).href);
  const response = await server.fetch(
    new Request("http://localhost/admin/login", {
      signal: AbortSignal.timeout(20_000),
    }),
  );
  const html = await response.text();
  if (response.status !== 200 || !html.includes("Admin Login | IEEE LETs Talk")) {
    throw new Error(`Built server smoke check failed: HTTP ${response.status}`);
  }

  // No real server function is invoked: CSRF must reject before dispatch.
  const rejected = await server.fetch(
    new Request("http://localhost/_serverFn/smoke-check", {
      method: "POST",
      headers: { Origin: "https://cross-site.invalid", "Sec-Fetch-Site": "cross-site" },
      signal: AbortSignal.timeout(20_000),
    }),
  );
  await rejected.text();
  if (rejected.status !== 403) {
    throw new Error(`CSRF smoke check failed: expected HTTP 403, received ${rejected.status}`);
  }
  console.log(
    "Built server smoke check passed: login renders; cross-site server calls return HTTP 403.",
  );
} finally {
  clearTimeout(timeout);
}
