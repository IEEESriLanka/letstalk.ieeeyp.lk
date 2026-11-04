import { createFileRoute } from "@tanstack/react-router";
import { ProtectedAdminRoute } from "@/admin/components/AdminLayout";
import { MainEventsPage } from "@/admin/pages/MainEventsPage";

export const Route = createFileRoute("/admin/main-events")({
  component: () => <ProtectedAdminRoute><MainEventsPage /></ProtectedAdminRoute>,
});
