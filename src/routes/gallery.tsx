import { createFileRoute, Navigate, Outlet, useLocation } from "@tanstack/react-router";

export const Route = createFileRoute("/gallery")({
  component: GalleryRoute,
});

function GalleryRoute() {
  const pathname = useLocation({ select: (location) => location.pathname });

  // Only redirect if specifically landing on the bare /gallery or /gallery/ URL
  const cleanPath = pathname.replace(/\/+$/, "");
  if (cleanPath === "/gallery") {
    return <Navigate to="/" hash="gallery" replace />;
  }

  return <Outlet />;
}

