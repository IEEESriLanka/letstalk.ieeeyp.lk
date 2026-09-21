import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { nitro } from "nitro/vite";

export default defineConfig(({ command }) => ({
  plugins: [
    tailwindcss(),
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tanstackStart({
      server: { entry: "server" },
    }),
    viteReact(),
    command === "build" &&
      nitro({
        defaultPreset: "cloudflare-module",
      }),
  ].filter(Boolean),
  server: {
    port: 8080,
    watch: {
      ignored: ["**/.output/**", "**/.wrangler/**"],
    },
  },
}));
