import { createFileRoute } from "@tanstack/react-router";
import { ProtectedAdminRoute } from "@/admin/components/AdminLayout";
import { VideosPage } from "@/admin/pages/VideosPage";

export const Route = createFileRoute("/admin/videos")({
  component: () => <ProtectedAdminRoute><VideosPage /></ProtectedAdminRoute>,
});
