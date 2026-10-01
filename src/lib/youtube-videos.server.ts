import {
  parseYoutubeChannelPage,
  parseYoutubeFeed,
  youtubeChannelId,
  youtubeChannelUrl,
  videoRefreshInterval,
  type TalkVideo,
} from "./youtube-videos";

let cache: { videos: TalkVideo[]; expires: number } | undefined;
let pending: Promise<TalkVideo[]> | undefined;

async function fetchText(url: string, accept: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      Accept: accept,
      "User-Agent": "Mozilla/5.0",
    },
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error("Video source is unavailable.");
  return response.text();
}

export async function readYoutubeVideos(): Promise<TalkVideo[]> {
  if (cache && cache.expires > Date.now()) return cache.videos;
  if (pending) return pending;
  pending = (async () => {
    let videos: TalkVideo[];
    try {
      videos = parseYoutubeFeed(
        await fetchText(
          `https://www.youtube.com/feeds/videos.xml?channel_id=${youtubeChannelId}`,
          "application/atom+xml, application/xml, text/xml",
        ),
      );
    } catch {
      videos = parseYoutubeChannelPage(
        await fetchText(youtubeChannelUrl, "text/html, application/xhtml+xml"),
      );
    }
    if (videos.length === 0) throw new Error("No LETs Talk videos were found.");
    cache = { videos, expires: Date.now() + videoRefreshInterval };
    return videos;
  })();
  try {
    return await pending;
  } catch {
    if (cache) {
      cache.expires = Date.now() + 60000;
      return cache.videos;
    }
    throw new Error("Videos are temporarily unavailable. Please try again.");
  } finally {
    pending = undefined;
  }
}
