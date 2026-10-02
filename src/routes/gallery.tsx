import { createFileRoute, Link, Outlet, useMatchRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { ArrowLeft, ArrowRight, Camera, Image } from "lucide-react";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteNav } from "@/components/site/site-nav";
import { Reveal } from "@/components/site/motion-primitives";
import { getSiteContent } from "@/lib/content-actions";
import { defaultSiteContent } from "@/lib/site-content";
import { getPublishedGalleryAlbums } from "@/lib/gallery-albums";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery | IEEE LETs Talk" },
      {
        name: "description",
        content:
          "Explore moments from IEEE LETs Talk sessions, workshops, networking events, and community experiences.",
      },
    ],
  }),
  component: GalleryRoute,
});

function GalleryRoute() {
  const matchRoute = useMatchRoute();
  const isChild =
    Boolean(matchRoute({ to: "/gallery/$albumSlug" })) ||
    Boolean(matchRoute({ to: "/gallery/events" })) ||
    Boolean(matchRoute({ to: "/gallery/albums" }));
  return isChild ? <Outlet /> : <GalleryPage />;
}

function GalleryPage() {
  const { data: content = defaultSiteContent } = useQuery({
    queryKey: ["site-content"],
    queryFn: () => getSiteContent(),
  });
  const { data: albums = [], isLoading: albumsLoading, isError: albumsError } = useQuery({
    queryKey: ["gallery-albums"],
    queryFn: getPublishedGalleryAlbums,
  });
  const visibleAlbums = albums.filter((album) => album.images.length > 0);
  const photoCount = visibleAlbums.reduce((total, album) => total + album.images.length, 0);
  const heroImage = visibleAlbums[0]?.cover_image_url || visibleAlbums[0]?.images[0]?.image_url;

  // Select a static set of pictures across albums (no dynamic swapping or shuffle)
  const staticPhotos = useMemo(() => {
    const flagged = visibleAlbums.flatMap((album) =>
      album.images
        .filter((img) => img.show_in_moments)
        .map((image) => ({ image, album })),
    );

    if (flagged.length >= 6) {
      return flagged.slice(0, 6);
    }

    const result = [...flagged];
    const seenIds = new Set(result.map((r) => r.image.id));

    // Statically round-robin from available albums for a balanced preview
    for (let photoIdx = 0; photoIdx < 4; photoIdx++) {
      for (const album of visibleAlbums) {
        if (result.length >= 6) break;
        const img = album.images[photoIdx];
        if (img && !seenIds.has(img.id)) {
          seenIds.add(img.id);
          result.push({ image: img, album });
        }
      }
      if (result.length >= 6) break;
    }

    return result.slice(0, 6);
  }, [visibleAlbums]);

  return (
    <main id="top" className="min-h-screen overflow-hidden bg-background text-body">
      <SiteNav />

      <section className="relative overflow-hidden bg-ieee-deep pt-32 pb-20 text-white lg:pt-40 lg:pb-28">
        {heroImage ? (
          <img src={heroImage} alt="" className="absolute inset-0 size-full object-cover opacity-30" />
        ) : null}
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(115deg,color-mix(in_oklab,var(--ieee-deep)_95%,transparent),color-mix(in_oklab,var(--ieee-deep)_74%,transparent)_58%,color-mix(in_oklab,var(--orange)_42%,transparent))]"
        />
        <div aria-hidden className="absolute inset-0 bg-grid opacity-20" />

        <div className="relative mx-auto grid max-w-6xl gap-12 px-5 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-orange/40 bg-orange/15 px-4 py-1.5 text-xs font-semibold text-orange">
              <Camera className="size-3.5" />
              Gallery
            </span>
            <h1 className="mt-6 max-w-3xl text-4xl leading-[1.05] font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Moments from the <span className="text-orange-soft">IEEE LETs Talk</span> community.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
              A closer look at the talks, workshops, networking moments, and volunteer-led
              experiences that shape the LETs Talk journey.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/"
                hash="gallery"
                className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/20"
              >
                <ArrowLeft className="size-4" />
                Back to home
              </Link>
              <Link
                to="/gallery/events"
                className="inline-flex items-center gap-2 rounded-full bg-[image:var(--gradient-orange)] px-6 py-3 text-sm font-semibold text-white shadow-glow transition-transform duration-300 hover:-translate-y-0.5"
              >
                Explore event albums
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <GalleryMetric value={String(visibleAlbums.length)} label="Photo albums" />
              <GalleryMetric value={String(photoCount)} label="Uploaded moments" />
              <GalleryMetric value={String(content.events.length)} label="Program tracks" />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-background py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-5">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="section-eyebrow">Moments</span>
            <h2 className="mt-5 text-3xl leading-tight font-bold text-heading sm:text-4xl">
              Moments from the <span className="text-orange">community.</span>
            </h2>
            <p className="mt-4 text-base leading-relaxed text-body">
              A curated selection of moments and memories from our sessions across Sri Lanka.
            </p>
          </Reveal>

          {albumsLoading ? <p className="mt-14 text-center text-body/70">Loading photos…</p> : null}
          {albumsError ? (
            <p className="mt-14 rounded-2xl border border-red-200 bg-red-50 p-5 text-center text-red-700">
              Unable to load photos.
            </p>
          ) : null}
          {!albumsLoading && !albumsError && staticPhotos.length === 0 ? (
            <p className="mt-14 text-center text-body/70">No uploaded photos yet.</p>
          ) : null}

          {staticPhotos.length > 0 && (
            <div className="mt-14 grid auto-rows-[250px] grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
              {staticPhotos.map(({ image, album }, index) => {
                const size =
                  index === 0 || index === 5
                    ? "md:col-span-2 lg:col-span-2"
                    : "md:col-span-1 lg:col-span-1";
                return (
                  <div
                    key={`${album.id}-${image.id}-${index}`}
                    className={`group relative overflow-hidden rounded-[2rem] border border-border bg-ieee-deep shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift ${size}`}
                  >
                    <img
                      src={image.image_url}
                      alt={album.title}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 flex flex-col justify-end bg-[linear-gradient(to_top,color-mix(in_oklab,var(--ieee-deep)_75%,transparent),transparent_60%)] p-6 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <p className="text-xs font-bold tracking-[0.14em] text-orange-soft uppercase">
                        {album.title}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* See more option linking to the event-wise gallery page */}
          <div className="mt-16 text-center">
            <div className="mx-auto flex max-w-md flex-col items-center gap-4">
              <p className="text-sm font-medium text-body">
                Explore all our photo albums organized by event and session.
              </p>
              <Link
                to="/gallery/events"
                className="group inline-flex items-center gap-2.5 rounded-full bg-[image:var(--gradient-orange)] px-8 py-3.5 text-sm font-semibold text-white shadow-glow transition-all duration-300 hover:-translate-y-0.5"
              >
                See more
                <ArrowRight className="size-4.5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter email={content.contact.email} />
    </main>
  );
}

function GalleryMetric({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-2xl bg-orange text-white shadow-glow">
          <Image className="size-5" />
        </span>
        <div>
          <p className="font-display text-3xl font-bold text-white">{value}</p>
          <p className="text-xs font-semibold text-white/70">{label}</p>
        </div>
      </div>
    </div>
  );
}

