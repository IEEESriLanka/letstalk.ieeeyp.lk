import assert from "node:assert/strict";
import test from "node:test";
import {
  isLetsTalkVideo,
  parseYoutubeChannelPage,
  parseYoutubeFeed,
  youtubeChannelId,
} from "../src/lib/youtube-videos.ts";

function entry({ id = "abcdefghijk", title = "Road to Ignite | Session 12", description = "", channel = youtubeChannelId, date = "2026-09-01T00:00:00Z", short = false } = {}) {
  return `<entry><yt:videoId>${id}</yt:videoId><yt:channelId>${channel}</yt:channelId><title>${title}</title><published>${date}</published><media:description>${description}</media:description><link href="https://www.youtube.com/${short ? "shorts/" : "watch?v="}${id}"/></entry>`;
}
const feed = (...entries) => `<feed xmlns="http://www.w3.org/2005/Atom">${entries.join("")}</feed>`;
const channelPage = (data) =>
  `<html><head><link href="https://www.youtube.com"></head><body>${youtubeChannelId}<script>var ytInitialData = ${JSON.stringify(data)};</script></body></html>`;

test("matches series names and yearly hashtags including styled Unicode", () => {
  assert(isLetsTalkVideo("Road To Ignite", ""));
  assert(isLetsTalkVideo("Leadership clip", "#letstalk26"));
  assert(isLetsTalkVideo("Leadership clip", "#roadtoignite"));
  assert(isLetsTalkVideo("𝐋𝐄𝐓𝐬 𝐓𝐚𝐥𝐤", ""));
  assert(!isLetsTalkVideo("Forge Your Icon", "#IEEEStudPro"));
  assert(!isLetsTalkVideo("INSL Workshop", "IEEE Young Professionals Sri Lanka"));
});

test("filters unrelated channels and videos, malformed dates and unsafe IDs", () => {
  assert.deepEqual(parseYoutubeFeed(feed(
    entry({ channel: "another-channel" }), entry({ date: "bad" }),
    entry({ id: "../../bad" }), entry({ title: "INSL Workshop" }),
  )), []);
});

test("decodes titles, identifies clips, and builds canonical safe URLs", () => {
  const [video] = parseYoutubeFeed(feed(entry({ title: "LETs Talk &amp; Leadership &#x26; Growth", short: true })));
  assert.equal(video.title, "LETs Talk & Leadership & Growth");
  assert.equal(video.isShort, true);
  assert.equal(video.url, "https://www.youtube.com/watch?v=abcdefghijk");
  assert.equal(video.thumbnailUrl, "https://i.ytimg.com/vi/abcdefghijk/hqdefault.jpg");
});

test("deduplicates and returns the newest six uploads", () => {
  const entries = Array.from({ length: 8 }, (_, i) => entry({ id: `abcdefghij${i}`, date: `2026-09-0${i + 1}T00:00:00Z` }));
  const videos = parseYoutubeFeed(feed(...entries, entries[7]));
  assert.equal(videos.length, 6);
  assert.equal(videos[0].id, "abcdefghij7");
  assert.equal(videos[5].id, "abcdefghij2");
});

test("rejects non-feed responses and does not interpret external entities", () => {
  assert.throws(() => parseYoutubeFeed("<html>Unavailable</html>"));
  assert.throws(() => parseYoutubeFeed('<!DOCTYPE feed SYSTEM "file:///etc/passwd">' + feed()));
  assert.deepEqual(parseYoutubeFeed(feed()), []);
});

test("parses LETs Talk videos from the public channel page fallback", () => {
  const page = channelPage({
    contents: [
      {
        richItemRenderer: {
          content: {
            videoRenderer: {
              videoId: "I2r2o-bXMpo",
              title: { runs: [{ text: "Road to Ignite | Session 12" }] },
              publishedTimeText: { simpleText: "2 months ago" },
              descriptionSnippet: { runs: [{ text: "LETs Talk recording" }] },
            },
          },
        },
      },
      {
        richItemRenderer: {
          content: {
            videoRenderer: {
              videoId: "2G8ev_L7MjU",
              title: { runs: [{ text: "INSL Workshop" }] },
              publishedTimeText: { simpleText: "1 month ago" },
            },
          },
        },
      },
      {
        reelItemRenderer: {
          videoId: "6l65mPuoO38",
          headline: { simpleText: "Leadership clip" },
          publishedTimeText: { simpleText: "3 weeks ago" },
          navigationEndpoint: { commandMetadata: { webCommandMetadata: { url: "/shorts/6l65mPuoO38" } } },
          descriptionSnippet: { runs: [{ text: "#letstalk26" }] },
        },
      },
    ],
  });
  const videos = parseYoutubeChannelPage(page, new Date("2026-10-01T00:00:00Z"));
  assert.equal(videos.length, 2);
  assert.equal(videos[0].id, "I2r2o-bXMpo");
  assert.equal(videos[0].publishedText, "2 months ago");
  assert.equal(videos[1].id, "6l65mPuoO38");
  assert.equal(videos[1].isShort, true);
});

test("parses newer YouTube lockup view models from the channel page fallback", () => {
  const page = channelPage({
    contents: [
      {
        lockupViewModel: {
          contentImage: {
            thumbnailViewModel: {
              image: { sources: [{ url: "https://i.ytimg.com/vi/I2r2o-bXMpo/hq720.jpg" }] },
            },
          },
          contentPlaybackContextParams: {
            addToWatchHistoryCommand: { videoId: "I2r2o-bXMpo" },
          },
          metadata: {
            lockupMetadataViewModel: {
              title: {
                content: "Road to Ignite Leadership Talk Series | Session 11",
              },
              metadata: {
                contentMetadataViewModel: {
                  metadataRows: [{ metadataParts: [{ text: { content: "3 months ago" } }] }],
                },
              },
            },
          },
        },
      },
    ],
  });
  const [video] = parseYoutubeChannelPage(page, new Date("2026-10-01T00:00:00Z"));
  assert.equal(video.id, "I2r2o-bXMpo");
  assert.equal(video.title, "Road to Ignite Leadership Talk Series | Session 11");
  assert.equal(video.publishedText, "3 months ago");
});

test("rejects invalid channel page fallback responses", () => {
  assert.throws(() => parseYoutubeChannelPage("<html>Unavailable</html>"));
});
