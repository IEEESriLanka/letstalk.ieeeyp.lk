# IEEE LETs Talk — Frontend Application

A modern, high-performance web platform for **IEEE LETs Talk** — inspiring conversations, technical sessions, and career growth for the global engineering community.

---

## 🚀 Tech Stack

- **Framework**: [TanStack Start](https://tanstack.com/start/latest) (Full-stack React with SSR & file-based routing)
- **UI Library**: [React 19](https://react.dev/)
- **Bundler & Dev Server**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & CSS variables
- **Icons & Animations**: [Lucide Icons](https://lucide.dev/), [Motion](https://motion.dev/)
- **Components**: [Radix UI](https://www.radix-ui.com/) & Tailwind UI primitives

---

## 🛠️ Getting Started

### Prerequisites

- Node.js (v20+ recommended)
- npm or yarn

### Installation

```sh
npm install
```

### Running Locally

```sh
npm run dev
```

The application will start at [http://localhost:8080](http://localhost:8080).

### Production Build

```sh
npm run build
```

To preview the built production bundle:

```sh
npm run preview
```

### Linting & Formatting

```sh
npm run lint
npm run format
```

---

## 📁 Project Structure

```
├── public/               # Static assets (favicon, robots.txt)
├── src/
│   ├── assets/           # Imagery and illustrations
│   ├── components/
│   │   ├── site/         # IEEE LETs Talk sections, navigation, and layout
│   │   └── ui/           # Radix UI and Shadcn design system components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions and error handling
│   ├── routes/           # TanStack Start file-based routes
│   │   ├── __root.tsx    # App root shell and meta tags
│   │   └── index.tsx     # Landing page
│   ├── router.tsx        # TanStack Router configuration
│   ├── server.ts         # Server entry point
│   ├── start.ts          # TanStack Start client entry
│   └── styles.css        # Global CSS and Tailwind theme definitions
├── tsconfig.json         # TypeScript configuration
└── vite.config.ts        # Vite build and plugin setup
```
