import { createServerFn } from "@tanstack/react-start";

export const getYoutubeVideos = createServerFn({ method: "GET" }).handler(async () => {
  const { readYoutubeVideos } = await import("./youtube-videos.server");
  return readYoutubeVideos();
});
