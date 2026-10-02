import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/gallery/albums")({
  component: () => <Navigate to="/gallery/events" replace />,
});
