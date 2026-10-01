export const youtubeChannelId = "UC8LrGEKHHuzqiyj5BeU7uKQ";
export const youtubeChannelUrl = "https://www.youtube.com/@ieeeypsl/videos";
export const videoRefreshInterval = 5 * 60 * 1000;

export type TalkVideo = {
  id: string;
  title: string;
  url: string;
  thumbnailUrl: string;
  publishedAt: string;
  publishedText?: string;
  isShort: boolean;
};

export function isLetsTalkVideo(title: string, description: string): boolean {
  const text = `${title}\n${description}`.normalize("NFKC");
  return /\blet['\u2019]?s[\s-]*talk(?:\d{2,4})?\b|\broad[\s-]*to[\s-]*ignite\b/i.test(text);
}

function decodeXml(text: string): string {
  const entities: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };
  return text.replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (match, entity: string) => {
    if (!entity.startsWith("#")) return entities[entity.toLowerCase()] ?? match;
    const value =
      entity[1]?.toLowerCase() === "x" ? parseInt(entity.slice(2), 16) : Number(entity.slice(1));
    return value > 0 && value <= 0x10ffff ? String.fromCodePoint(value) : match;
  });
}

function tag(entry: string, name: string): string {
  // Only fixed tag names from YouTube's Atom feed are read. No HTML is rendered.
  const value = entry.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`))?.[1] ?? "";
  return decodeXml(value.replace(/^<!\[CDATA\[([\s\S]*)\]\]>$/, "$1")).trim();
}

export function parseYoutubeFeed(xml: string): TalkVideo[] {
  if (
    xml.length > 2_000_000 ||
    !/<feed\s/.test(xml) ||
    !xml.includes("</feed>") ||
    /<!DOCTYPE/i.test(xml)
  ) {
    throw new Error("Invalid YouTube feed.");
  }
  const videos = new Map<string, TalkVideo>();
  for (const match of xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)) {
    const entry = match[1]!;
    const id = tag(entry, "yt:videoId");
    const title = tag(entry, "title");
    const publishedAt = tag(entry, "published");
    if (
      tag(entry, "yt:channelId") !== youtubeChannelId ||
      !/^[\w-]{11}$/.test(id) ||
      !title ||
      !Number.isFinite(Date.parse(publishedAt)) ||
      !isLetsTalkVideo(title, tag(entry, "media:description"))
    )
      continue;
    const isShort = entry.includes(`https://www.youtube.com/shorts/${id}`);
    videos.set(id, {
      id,
      title: title.normalize("NFKC"),
      url: `https://www.youtube.com/watch?v=${id}`,
      thumbnailUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      publishedAt,
      isShort,
    });
  }
  return [...videos.values()]
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
    .slice(0, 6);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function textFrom(value: unknown): string {
  if (typeof value === "string") return value;
  if (!isRecord(value)) return "";
  if (typeof value.simpleText === "string") return value.simpleText;
  if (typeof value.content === "string") return value.content;
  if (Array.isArray(value.runs)) {
    return value.runs
      .map((run) => (isRecord(run) && typeof run.text === "string" ? run.text : ""))
      .join("")
      .trim();
  }
  return "";
}

function collectText(value: unknown, texts: string[] = []): string[] {
  const text = textFrom(value);
  if (text) texts.push(text);
  if (Array.isArray(value)) {
    for (const item of value) collectText(item, texts);
  } else if (isRecord(value)) {
    for (const child of Object.values(value)) collectText(child, texts);
  }
  return texts;
}

function findJsonAssignment(html: string, marker: string): unknown {
  const markerIndex = html.indexOf(marker);
  if (markerIndex < 0) throw new Error("YouTube page data was not found.");
  const start = html.indexOf("{", markerIndex + marker.length);
  if (start < 0) throw new Error("YouTube page data was not found.");
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let index = start; index < html.length; index += 1) {
    const char = html[index];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }
    if (char === '"') {
      inString = true;
    } else if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;
      if (depth === 0) return JSON.parse(html.slice(start, index + 1));
    }
  }
  throw new Error("YouTube page data was incomplete.");
}

function approximatePublishedAt(label: string, now: Date): string {
  const normalized = label
    .normalize("NFKC")
    .replace(/^(streamed|premiered)\s+/i, "")
    .trim();
  const parsed = Date.parse(normalized);
  if (Number.isFinite(parsed)) return new Date(parsed).toISOString();
  const match = normalized.match(/\b(a|an|\d+)\s+(minute|hour|day|week|month|year)s?\s+ago\b/i);
  if (!match) return now.toISOString();
  const amount =
    match[1]?.toLowerCase() === "a" || match[1]?.toLowerCase() === "an" ? 1 : Number(match[1]);
  const unit = match[2]?.toLowerCase();
  const multipliers: Record<string, number> = {
    minute: 60_000,
    hour: 60 * 60_000,
    day: 24 * 60 * 60_000,
    week: 7 * 24 * 60 * 60_000,
    month: 30 * 24 * 60 * 60_000,
    year: 365 * 24 * 60 * 60_000,
  };
  return new Date(now.getTime() - amount * (multipliers[unit ?? ""] ?? 0)).toISOString();
}

function readRendererVideo(renderer: Record<string, unknown>, now: Date): TalkVideo | undefined {
  const id = typeof renderer.videoId === "string" ? renderer.videoId : "";
  const title = textFrom(renderer.title) || textFrom(renderer.headline);
  const description =
    textFrom(renderer.descriptionSnippet) || textFrom(renderer.detailedMetadataSnippets);
  if (!/^[\w-]{11}$/.test(id) || !title || !isLetsTalkVideo(title, description)) return undefined;
  const publishedText = textFrom(renderer.publishedTimeText);
  const rendererText = JSON.stringify(renderer);
  return {
    id,
    title: title.normalize("NFKC"),
    url: `https://www.youtube.com/watch?v=${id}`,
    thumbnailUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    publishedAt: approximatePublishedAt(publishedText, now),
    publishedText: publishedText || undefined,
    isShort: rendererText.includes(`/shorts/${id}`) || rendererText.includes('"reelWatchEndpoint"'),
  };
}

function readLockupVideo(renderer: Record<string, unknown>, now: Date): TalkVideo | undefined {
  const rendererText = JSON.stringify(renderer);
  const id = rendererText.match(/"videoId":"([\w-]{11})"/)?.[1] ?? "";
  const texts = collectText(renderer);
  const title = texts.find((item) => isLetsTalkVideo(item, ""));
  if (!/^[\w-]{11}$/.test(id) || !title) return undefined;
  const publishedText = texts.find((item) =>
    /\b(a|an|\d+)\s+(minute|hour|day|week|month|year)s?\s+ago\b/i.test(item),
  );
  return {
    id,
    title: title.normalize("NFKC"),
    url: `https://www.youtube.com/watch?v=${id}`,
    thumbnailUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    publishedAt: approximatePublishedAt(publishedText ?? "", now),
    publishedText,
    isShort: rendererText.includes(`/shorts/${id}`) || rendererText.includes('"reelWatchEndpoint"'),
  };
}

export function parseYoutubeChannelPage(html: string, now = new Date()): TalkVideo[] {
  if (html.length > 2_500_000 || !html.includes("youtube.com") || !html.includes(youtubeChannelId)) {
    throw new Error("Invalid YouTube channel page.");
  }
  const data = findJsonAssignment(html, "var ytInitialData =");
  const videos = new Map<string, TalkVideo>();
  const stack: unknown[] = [data];
  while (stack.length > 0 && videos.size < 6) {
    const item = stack.pop();
    if (Array.isArray(item)) {
      for (let index = item.length - 1; index >= 0; index -= 1) stack.push(item[index]);
      continue;
    }
    if (!isRecord(item)) continue;
    for (const key of ["videoRenderer", "gridVideoRenderer", "reelItemRenderer"]) {
      if (isRecord(item[key])) {
        const video = readRendererVideo(item[key], now);
        if (video && !videos.has(video.id)) videos.set(video.id, video);
      }
    }
    if (isRecord(item.lockupViewModel)) {
      const video = readLockupVideo(item.lockupViewModel, now);
      if (video && !videos.has(video.id)) videos.set(video.id, video);
    }
    for (const value of Object.values(item)) {
      if (isRecord(value) || Array.isArray(value)) stack.push(value);
    }
  }
  return [...videos.values()];
}
