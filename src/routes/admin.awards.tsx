import { createFileRoute } from "@tanstack/react-router";
import { ProtectedAdminRoute } from "@/admin/components/AdminLayout";
import { AwardsPage } from "@/admin/pages/ContentPages";

export const Route = createFileRoute("/admin/awards")({
  component: () => (
    <ProtectedAdminRoute>
      <AwardsPage />
    </ProtectedAdminRoute>
  ),
});
