import { createFileRoute, Link, Outlet, useMatchRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
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
  return matchRoute({ to: "/gallery/$albumSlug" }) ? <Outlet /> : <GalleryPage />;
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

  return (
    <main id="top" className="min-h-screen overflow-hidden bg-background text-body">
      <SiteNav />

      <section className="relative overflow-hidden bg-ieee-deep pt-32 pb-20 text-white lg:pt-40 lg:pb-28">
        {heroImage ? <img src={heroImage} alt="" className="absolute inset-0 size-full object-cover opacity-30" /> : null}
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
              <a
                href="/#contact"
                className="inline-flex items-center gap-2 rounded-full bg-[image:var(--gradient-orange)] px-6 py-3 text-sm font-semibold text-white shadow-glow transition-transform duration-300 hover:-translate-y-0.5"
              >
                Share photos
                <ArrowRight className="size-4" />
              </a>
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
            <span className="section-eyebrow">Albums</span>
            <h2 className="mt-5 text-3xl leading-tight font-bold text-heading sm:text-4xl">
              Moments from the <span className="text-orange">community.</span>
            </h2>
            <p className="mt-4 text-base leading-relaxed text-body">Open an album to explore every uploaded photo from that event.</p>
          </Reveal>
          {albumsLoading ? <p className="mt-14 text-center text-body/70">Loading albums…</p> : null}
          {albumsError ? <p className="mt-14 rounded-2xl border border-red-200 bg-red-50 p-5 text-center text-red-700">Unable to load albums.</p> : null}
          {!albumsLoading && !albumsError && visibleAlbums.length === 0 ? <p className="mt-14 text-center text-body/70">No uploaded album photos yet.</p> : null}
          <div className="mt-14 grid auto-rows-[250px] grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
            {visibleAlbums.map((album, index) => {
              const cover = album.cover_image_url || album.images[0]!.image_url;
              const size = index % 5 === 0 ? "md:row-span-2 lg:col-span-2" : index % 5 === 3 ? "lg:col-span-2" : "";
              return (
                <Link key={album.id} to="/gallery/$albumSlug" params={{ albumSlug: album.slug }} className={`group relative overflow-hidden rounded-[2rem] border border-border bg-ieee-deep shadow-soft transition hover:-translate-y-1 hover:shadow-lift ${size}`}>
                  <img src={cover} alt={album.title} loading="lazy" className="size-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 flex flex-col justify-end bg-[linear-gradient(to_top,color-mix(in_oklab,var(--ieee-deep)_88%,transparent),transparent_68%)] p-6 text-white">
                    <p className="text-xs font-bold tracking-[0.14em] text-orange-soft uppercase">{album.images.length} photos</p>
                    <h3 className="mt-2 text-2xl font-bold text-white">{album.title}</h3>
                    {album.description ? <p className="mt-2 line-clamp-2 text-sm text-white/75">{album.description}</p> : null}
                  </div>
                </Link>
              );
            })}
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
