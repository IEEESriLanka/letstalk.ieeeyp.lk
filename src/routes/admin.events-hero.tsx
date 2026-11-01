import { createFileRoute } from "@tanstack/react-router";
import { ProtectedAdminRoute } from "@/admin/components/AdminLayout";
import { EventsHeroPage } from "@/admin/pages/EventsHeroPage";

export const Route = createFileRoute("/admin/events-hero")({
  component: () => (
    <ProtectedAdminRoute>
      <EventsHeroPage />
    </ProtectedAdminRoute>
  ),
});
