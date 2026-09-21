import { createFileRoute } from "@tanstack/react-router";
import { ProtectedAdminRoute } from "@/admin/components/AdminLayout";
import { DatabaseStatusPage } from "@/admin/pages/DatabaseStatus";

export const Route = createFileRoute("/admin/database")({
  component: () => (
    <ProtectedAdminRoute>
      <DatabaseStatusPage />
    </ProtectedAdminRoute>
  ),
});
