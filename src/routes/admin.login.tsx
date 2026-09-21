import { createFileRoute } from "@tanstack/react-router";
import { AdminLogin } from "@/admin/pages/AdminLogin";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Admin Login | IEEE LETs Talk" },
      { name: "description", content: "Sign in to the IEEE LETs Talk admin portal." },
    ],
  }),
  component: AdminLogin,
});
