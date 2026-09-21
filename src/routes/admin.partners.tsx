import { createFileRoute } from "@tanstack/react-router";
import { ProtectedAdminRoute } from "@/admin/components/AdminLayout";
import { PartnersPage } from "@/admin/pages/ContentPages";

export const Route = createFileRoute("/admin/partners")({
  component: () => (
    <ProtectedAdminRoute>
      <PartnersPage />
    </ProtectedAdminRoute>
  ),
});
