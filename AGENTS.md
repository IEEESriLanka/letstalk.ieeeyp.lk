# Development Guidelines

## Project Overview

This repository contains the **IEEE LETs Talk** frontend application, built with TanStack Start, React, Vite, TypeScript, and Tailwind CSS.

## Key Conventions

- **Routing**: File-based routing located under `src/routes/`. The root shell and layout are in `src/routes/__root.tsx`.
- **Styling**: Tailwind CSS v4 configured via `@tailwindcss/vite` and `src/styles.css`.
- **Components**: UI components in `src/components/ui/` and site sections in `src/components/site/`.
- **Development**: Run `npm run dev` to start the local development server on port 8080.
- **Production Build**: Run `npm run build` to create the production client and SSR bundle.
