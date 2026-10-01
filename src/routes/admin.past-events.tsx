import { createFileRoute } from "@tanstack/react-router";
import { ProtectedAdminRoute } from "@/admin/components/AdminLayout";
import { EventsPage } from "@/admin/pages/ContentPages";

export const Route = createFileRoute("/admin/past-events")({
  component: () => (
    <ProtectedAdminRoute>
      <EventsPage pastOnly />
    </ProtectedAdminRoute>
  ),
});
