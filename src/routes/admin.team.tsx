import { createFileRoute } from "@tanstack/react-router";
import { ProtectedAdminRoute } from "@/admin/components/AdminLayout";
import { TeamAdminPage } from "@/admin/pages/TeamPage";

export const Route = createFileRoute("/admin/team")({
  component: () => <ProtectedAdminRoute><TeamAdminPage /></ProtectedAdminRoute>,
});
