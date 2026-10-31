import { defineConfig, loadEnv } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { nitro } from "nitro/vite";
import path from "node:path";

export default defineConfig(({ command, mode }) => {
  // Vite exposes VITE_* to modules, but server-only code reads process.env.
  const env = loadEnv(mode, process.cwd(), "");
  for (const [key, value] of Object.entries(env)) {
    if (process.env[key] === undefined) process.env[key] = value;
  }
  return {
    plugins: [
      tailwindcss(),
      tsConfigPaths({ projects: ["./tsconfig.json"] }),
      tanstackStart({
        vite: { installDevServerMiddleware: true },
      }),
      viteReact(),
      command === "build" &&
        nitro({
          preset: process.env.VERCEL ? "vercel" : "node-server",
          routeRules: {
            "/team/optimized/**": {
              headers: { "cache-control": "public, max-age=31536000, immutable" },
            },
          },
        }),
    ].filter(Boolean),
    server: {
      port: 8080,
      strictPort: true,
      watch: {
        ignored: ["**/.output/**", "**/.wrangler/**"],
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(process.cwd(), "src"),
      },
    },
  };
});
