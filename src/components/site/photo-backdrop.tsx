import { useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";

const controlClass =
  "grid size-11 place-items-center rounded-full border border-white/50 bg-[#082447]/60 text-white hover:bg-[#082447] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

export function PhotoBackdrop({ images }: { images?: string[] | undefined }) {
  const photos = images?.filter(Boolean) ?? [];
  const [viewportRef, carousel] = useEmblaCarousel({ loop: true });
  const [selected, setSelected] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const reduceMotion = useReducedMotion();
  const initialized = useRef(false);
  const photoKey = JSON.stringify(photos);

  useEffect(() => {
    if (!carousel) return;
    const currentPhotos = JSON.parse(photoKey) as string[];
    if (!currentPhotos.length) return;
    if (!initialized.current) {
      initialized.current = true;
      try {
        const previous = sessionStorage.getItem("hero-background-photo");
        carousel.scrollTo((currentPhotos.indexOf(previous ?? "") + 1) % currentPhotos.length, true);
      } catch {
        /* Storage is optional. */
      }
    }
    const sync = () => {
      const index = carousel.selectedScrollSnap();
      setSelected(index);
      try {
        sessionStorage.setItem("hero-background-photo", currentPhotos[index] ?? "");
      } catch {
        /* Storage is optional. */
      }
    };
    sync();
    carousel.on("select", sync).on("reInit", sync);
    return () => {
      carousel.off("select", sync).off("reInit", sync);
    };
  }, [carousel, photoKey]);

  useEffect(() => {
    if (!carousel || photos.length < 2 || paused || hovered || focused || reduceMotion) return;
    const timer = window.setInterval(() => carousel.scrollNext(), 6000);
    return () => window.clearInterval(timer);
  }, [carousel, photos.length, paused, hovered, focused, reduceMotion, selected]);

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="LETs Talk highlights"
      className="absolute inset-0 bg-[#e8eef5]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          if (event.key === "ArrowLeft") carousel?.scrollPrev(Boolean(reduceMotion));
          else carousel?.scrollNext(Boolean(reduceMotion));
        }
      }}
    >
      <div
        ref={viewportRef}
        className="h-full overflow-hidden touch-pan-y cursor-grab active:cursor-grabbing"
      >
        <div className="flex h-full">
          {photos.map((src, index) => (
            <div
              key={`${src}-${index}`}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${photos.length}`}
              aria-hidden={index !== selected}
              className="relative h-full min-w-0 flex-[0_0_100%]"
            >
              <img
                src={src}
                alt="IEEE LETs Talk community event"
                draggable={false}
                className="size-full object-cover object-[35%_center]"
              />
            </div>
          ))}
        </div>
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#061c38]/65 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_75%_65%_at_0%_100%,#fbfcff_0%,rgba(251,252,255,0.9)_18%,rgba(251,252,255,0.5)_42%,transparent_75%)]"
      />
      {photos.length > 1 && (
        <div className="absolute right-6 bottom-32 left-6 flex flex-wrap items-center justify-end gap-4 lg:left-[30%]">
          <div className="flex flex-wrap items-center gap-1" aria-label="Choose photo">
            {photos.map((src, index) => (
              <button
                key={`${src}-${index}`}
                type="button"
                aria-label={`Show photo ${index + 1}`}
                aria-current={index === selected ? "true" : undefined}
                onClick={() => carousel?.scrollTo(index, Boolean(reduceMotion))}
                className="grid min-h-11 min-w-6 place-items-center rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <span
                  className={`h-1 rounded-full transition-all ${index === selected ? "w-9 bg-[#ff6815]" : "w-5 bg-white/60"}`}
                />
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Previous photo"
              onClick={() => carousel?.scrollPrev(Boolean(reduceMotion))}
              className={controlClass}
            >
              <ArrowLeft className="size-4" />
            </button>
            {!reduceMotion && (
              <button
                type="button"
                aria-label={paused ? "Play slideshow" : "Pause slideshow"}
                onClick={() => setPaused((value) => !value)}
                className={controlClass}
              >
                {paused ? <Play className="size-4" /> : <Pause className="size-4" />}
              </button>
            )}
            <button
              type="button"
              aria-label="Next photo"
              onClick={() => carousel?.scrollNext(Boolean(reduceMotion))}
              className={controlClass}
            >
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
