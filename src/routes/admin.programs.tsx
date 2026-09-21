import { createFileRoute } from "@tanstack/react-router";
import { ProtectedAdminRoute } from "@/admin/components/AdminLayout";
import { ProgramsPage } from "@/admin/pages/ContentPages";

export const Route = createFileRoute("/admin/programs")({
  component: () => (
    <ProtectedAdminRoute>
      <ProgramsPage />
    </ProtectedAdminRoute>
  ),
});
