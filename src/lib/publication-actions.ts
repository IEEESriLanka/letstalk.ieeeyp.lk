import { createServerFn } from "@tanstack/react-start";

export const getPublications = createServerFn({ method: "GET" }).handler(async () => {
  const { readPublications } = await import("./publications.server");
  return readPublications();
});
