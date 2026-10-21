import { execFileSync, spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
// Patch apostrophes in generated imports without drive aliases, which cause
// duplicate Vite module identities and prevent SSR middleware installation.
execFileSync(process.execPath, [fileURLToPath(new URL("./patch-dependencies.js", import.meta.url))], { stdio: "inherit" });
const args = process.argv.slice(2).filter((arg, index) => !(index === 0 && arg === "dev"));
const vite = path.join(path.dirname(require.resolve("vite/package.json")), "bin/vite.js");
const child = spawn(process.execPath, [vite, ...args], { stdio: "inherit" });
child.on("exit", (code) => process.exit(code ?? 1));
process.on("SIGINT", () => child.kill("SIGINT"));
process.on("SIGTERM", () => child.kill("SIGTERM"));
