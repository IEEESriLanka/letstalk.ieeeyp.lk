import { spawnSync } from "node:child_process";

// Cross-platform reproduction of the deployment preset, including runtime
// verification. No deployment credentials or production writes are needed.
const env = { ...process.env, VERCEL: "1" };
for (const args of [
  ["node_modules/vite/bin/vite.js", "build"],
  ["scripts/check-server-build.mjs"],
]) {
  const result = spawnSync(process.execPath, args, { env, stdio: "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
