import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Camera } from "lucide-react";
import { motion } from "motion/react";
import { SiteNav } from "@/components/site/site-nav";
import { SiteFooter } from "@/components/site/site-footer";
import { RevealGroup, fadeUp } from "@/components/site/motion-primitives";
import { getPublishedGalleryAlbum } from "@/lib/gallery-albums";
import { defaultSiteContent } from "@/lib/site-content";

export const Route = createFileRoute("/gallery/$albumSlug")({ component: AlbumPage });

function AlbumPage() {
  const { albumSlug } = Route.useParams();
  const { data: album, isLoading, isError } = useQuery({
    queryKey: ["gallery-album", albumSlug],
    queryFn: () => getPublishedGalleryAlbum(albumSlug),
  });

  return (
    <main className="min-h-screen bg-background text-body">
      <SiteNav />
      <section className="bg-ieee-deep pt-32 pb-16 text-white">
        <div className="mx-auto max-w-6xl px-5">
          <Link to="/gallery" className="inline-flex items-center gap-2 text-sm font-semibold text-white/75 hover:text-white">
            <ArrowLeft className="size-4" /> All albums
          </Link>
          <div className="mt-8 flex items-center gap-3 text-orange-soft"><Camera className="size-5" /> Photo album</div>
          <h1 className="mt-4 text-4xl font-bold sm:text-6xl">{album?.title ?? (isLoading ? "Loading album…" : "Album not found")}</h1>
          {album?.description ? <p className="mt-5 max-w-2xl text-lg text-white/75">{album.description}</p> : null}
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-5 py-16 lg:py-24">
        {isError ? <p className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">Unable to load this album.</p> : null}
        {album && album.images.length === 0 ? <p className="text-center text-body/70">No published photos in this album yet.</p> : null}
        {album ? (
          <RevealGroup className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {album.images.map((image) => (
              <motion.figure key={image.id} variants={fadeUp} className="group overflow-hidden rounded-3xl border border-border bg-white shadow-soft">
                <img src={image.image_url} alt={image.title} loading="lazy" className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <figcaption className="p-5"><h2 className="font-bold text-heading">{image.title}</h2>{image.caption ? <p className="mt-2 text-sm">{image.caption}</p> : null}</figcaption>
              </motion.figure>
            ))}
          </RevealGroup>
        ) : null}
      </section>
      <SiteFooter email={defaultSiteContent.contact.email} />
    </main>
  );
}
