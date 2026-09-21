import { createFileRoute } from "@tanstack/react-router";
import { ProtectedAdminRoute } from "@/admin/components/AdminLayout";
import { GalleryPage } from "@/admin/pages/ContentPages";

export const Route = createFileRoute("/admin/gallery")({
  component: () => (
    <ProtectedAdminRoute>
      <GalleryPage />
    </ProtectedAdminRoute>
  ),
});
