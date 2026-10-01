# LETs Talk videos

The homepage reads the public Atom upload feed for `@ieeeypsl` on the server.
No API key, account connection, or database migration is required.

- Include `LETs Talk`, `#letstalk26` (or another year), `Road to Ignite`, or
  `#roadtoignite` in a video's title or description to include it automatically.
- Only matching uploads from the configured IEEE YPSL channel are displayed.
  Matching Shorts are included and labelled as clips.
- The section displays up to six matching uploads, newest first, with original
  YouTube thumbnails and links. It checks for updates every five minutes while
  the page is open and visible. Server responses are cached for five minutes.
- YouTube controls feed publication timing. Its public feed contains only the
  channel's 15 latest uploads, so this section is a recent-upload feed, not a
  complete archive. Older sessions remain accessible via the channel link.
  A complete permanent archive would require an API-backed sync or dedicated
  maintained playlist.
- Requests time out after ten seconds. A warm server can serve its last successful
  response during outages; otherwise the section offers retry and a channel link.

Implementation: `src/lib/youtube-videos.ts`, `youtube-videos.server.ts`,
`video-actions.ts`, and `src/components/site/latest-videos.tsx`.
