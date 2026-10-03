import { useCallback, useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Camera, ZoomIn } from "lucide-react";
import { motion } from "motion/react";
import { Preloader } from "@/components/site/preloader";
import { SiteNav } from "@/components/site/site-nav";
import { SiteFooter } from "@/components/site/site-footer";
import { RevealGroup, fadeUp } from "@/components/site/motion-primitives";
import { getPublishedGalleryAlbum } from "@/lib/gallery-albums";
import { defaultSiteContent } from "@/lib/site-content";
import { ImageLightbox } from "@/components/site/image-lightbox";

export const Route = createFileRoute("/gallery/$albumSlug")({ component: AlbumPage });

function AlbumPage() {
  const { albumSlug } = Route.useParams();
  const [initializing, setInitializing] = useState(true);
  const [imagesReady, setImagesReady] = useState(false);
  const finishInitialization = useCallback(() => setInitializing(false), []);

  const { data: album, isPending, fetchStatus, isError } = useQuery({
    queryKey: ["gallery-album", albumSlug],
    queryFn: () => getPublishedGalleryAlbum(albumSlug),
  });

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Reset preloader states if navigating to another album
  useEffect(() => {
    setInitializing(true);
    setImagesReady(false);
  }, [albumSlug]);

  // Preload the album's primary photos before completing initialization
  useEffect(() => {
    if (!album) return;

    if (album.images.length === 0) {
      setImagesReady(true);
      return;
    }

    const imagesToPreload = album.images.slice(0, 6);
    let loadedCount = 0;
    let active = true;

    const checkComplete = () => {
      loadedCount++;
      if (loadedCount >= imagesToPreload.length && active) {
        setImagesReady(true);
      }
    };

    const timeout = setTimeout(() => {
      if (active) setImagesReady(true);
    }, 3000);

    imagesToPreload.forEach((img) => {
      const imageObj = new Image();
      imageObj.onload = checkComplete;
      imageObj.onerror = checkComplete;
      imageObj.src = img.image_url;
      if (imageObj.complete) {
        checkComplete();
      }
    });

    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [album]);

  const contentReady =
    isError ||
    (!isPending && !album) ||
    fetchStatus === "paused" ||
    (Boolean(album) && imagesReady);

  return (
    <>
      {initializing && (
        <Preloader
          contentReady={contentReady}
          onComplete={finishInitialization}
        />
      )}

      <motion.main
        inert={initializing}
        initial={{ opacity: 0 }}
        animate={{ opacity: initializing ? 0 : 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-background text-body"
      >
        <SiteNav />
        <section className="relative overflow-hidden bg-[linear-gradient(135deg,#f0f7ff_0%,#ffffff_50%,#fff7f2_100%)] pt-32 pb-16 text-heading border-b border-border/60">
          <div aria-hidden className="absolute inset-0 bg-grid opacity-30" />
          <div className="relative mx-auto max-w-6xl px-5">
            <div className="flex flex-wrap items-center gap-4">
              <Link to="/gallery/events" className="inline-flex items-center gap-2 text-sm font-semibold text-body hover:text-ieee">
                <ArrowLeft className="size-4" /> All event albums
              </Link>
              <span className="text-border">•</span>
              <Link to="/" hash="gallery" className="text-sm font-semibold text-body hover:text-ieee">
                Community moments
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-3 text-orange font-semibold"><Camera className="size-5" /> Photo album</div>
            <h1 className="mt-4 text-4xl font-bold sm:text-6xl text-heading">{album?.title ?? "Album not found"}</h1>
            {album?.description ? <p className="mt-5 max-w-2xl text-lg text-body">{album.description}</p> : null}
          </div>
        </section>
        <section className="mx-auto max-w-6xl px-5 py-16 lg:py-24">
          {isError ? <p className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">Unable to load this album.</p> : null}
          {album && album.images.length === 0 ? <p className="text-center text-body/70">No published photos in this album yet.</p> : null}
          {album ? (
            <RevealGroup className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {album.images.map((image, index) => (
                <motion.figure
                  key={image.id}
                  variants={fadeUp}
                  onClick={() => setLightboxIndex(index)}
                  className="group cursor-pointer overflow-hidden rounded-3xl border border-border bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-900">
                    <img
                      src={image.image_url}
                      alt={image.title}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100">
                      <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/60 px-4 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur-md">
                        <ZoomIn className="size-3.5 text-orange-soft" />
                        View photo
                      </span>
                    </div>
                  </div>
                  <figcaption className="p-5">
                    <h2 className="font-bold text-heading transition-colors group-hover:text-orange">
                      {image.title}
                    </h2>
                    {image.caption ? <p className="mt-2 text-sm text-body">{image.caption}</p> : null}
                  </figcaption>
                </motion.figure>
              ))}
            </RevealGroup>
          ) : null}
        </section>

        {album && lightboxIndex !== null && (
          <ImageLightbox
            images={album.images}
            currentIndex={lightboxIndex}
            albumTitle={album.title}
            isOpen={lightboxIndex !== null}
            onClose={() => setLightboxIndex(null)}
            onNavigate={(nextIdx) => setLightboxIndex(nextIdx)}
          />
        )}

        <SiteFooter email={defaultSiteContent.contact.email} />
      </motion.main>
    </>
  );
}
