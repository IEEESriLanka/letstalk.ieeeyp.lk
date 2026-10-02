import { createFileRoute, Navigate, Outlet, useMatchRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/gallery")({
  component: GalleryRoute,
});

function GalleryRoute() {
  const matchRoute = useMatchRoute();
  const isChild =
    Boolean(matchRoute({ to: "/gallery/$albumSlug" })) ||
    Boolean(matchRoute({ to: "/gallery/events" })) ||
    Boolean(matchRoute({ to: "/gallery/albums" }));

  return isChild ? <Outlet /> : <Navigate to="/" hash="gallery" replace />;
}
