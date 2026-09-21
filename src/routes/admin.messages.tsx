import { createFileRoute } from "@tanstack/react-router";
import { ProtectedAdminRoute } from "@/admin/components/AdminLayout";
import { MessagesPage } from "@/admin/pages/ContentPages";

export const Route = createFileRoute("/admin/messages")({
  component: () => (
    <ProtectedAdminRoute>
      <MessagesPage />
    </ProtectedAdminRoute>
  ),
});
