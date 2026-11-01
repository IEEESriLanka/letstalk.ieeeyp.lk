import { createFileRoute } from "@tanstack/react-router";
import { ProtectedAdminRoute } from "@/admin/components/AdminLayout";
import { SpeakerCommentsPage } from "@/admin/pages/SpeakerCommentsPage";

export const Route = createFileRoute("/admin/speaker-comments")({
  component: () => (
    <ProtectedAdminRoute>
      <SpeakerCommentsPage />
    </ProtectedAdminRoute>
  ),
});
