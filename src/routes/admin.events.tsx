import { createFileRoute } from "@tanstack/react-router";
import { ProtectedAdminRoute } from "@/admin/components/AdminLayout";
import { EventsPage } from "@/admin/pages/ContentPages";

export const Route = createFileRoute("/admin/events")({
  component: () => (
    <ProtectedAdminRoute>
      <EventsPage />
    </ProtectedAdminRoute>
  ),
});
