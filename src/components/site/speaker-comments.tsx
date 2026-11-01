import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { useReducedMotion } from "motion/react";
import { Quote } from "lucide-react";
import { getPublishedComments, type SpeakerComment } from "@/lib/testimonials";

function SpeakerCard({ speaker }: { speaker: SpeakerComment }) {
  const [failedImage, setFailedImage] = useState("");
  return (
    <figure className="relative flex h-full min-h-[320px] flex-col rounded-[5px] border-b-[3px] border-orange bg-white px-6 pt-7 pb-5 shadow-[0_8px_24px_rgba(15,35,55,0.10)] sm:px-7">
      <Quote
        className="absolute top-4 right-4 size-6 fill-current text-orange/85"
        strokeWidth={0}
        aria-hidden="true"
      />
      <figcaption className="flex items-center gap-3 pr-5">
        <span className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-full bg-orange-tint text-lg font-bold text-orange">
          {speaker.imageUrl && failedImage !== speaker.imageUrl ? (
            <img
              src={speaker.imageUrl}
              alt=""
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              onError={() => setFailedImage(speaker.imageUrl)}
              className="size-full object-cover"
            />
          ) : (
            speaker.name
              .split(/\s+/)
              .slice(0, 2)
              .map((part) => part[0])
              .join("")
          )}
        </span>
        <span className="min-w-0">
          <span className="block break-words font-display text-base font-bold text-[#242c3b]">
            {speaker.name}
          </span>
          <span className="mt-0.5 block break-words text-xs leading-relaxed text-[#bd762d] sm:text-sm">
            {speaker.designation}
          </span>
        </span>
      </figcaption>
      <blockquote className="mt-5 mb-6 whitespace-pre-line break-words text-sm leading-relaxed text-[#5b6069]">
        {speaker.comment}
      </blockquote>
    </figure>
  );
}

export function SpeakerComments({ comments }: { comments: unknown }) {
  const speakers = getPublishedComments(comments);
  const reducedMotion = useReducedMotion();
  const [viewport, api] = useEmblaCarousel({ align: "start", loop: true });
  const [selected, setSelected] = useState(0);
  const [snaps, setSnaps] = useState<number[]>([]);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!api) return;
    const sync = () => {
      setSelected(api.selectedScrollSnap());
      setSnaps(api.scrollSnapList());
    };
    sync();
    api.on("select", sync).on("reInit", sync);
    return () => {
      api.off("select", sync).off("reInit", sync);
    };
  }, [api]);

  const rotating = reducedMotion === false && !hovered && !focused && snaps.length > 1;
  useEffect(() => {
    if (!api || !rotating) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") api.scrollNext();
    }, 6000);
    return () => window.clearInterval(timer);
  }, [api, rotating, selected]);

  if (!speakers.length) return null;
  return (
    <section
      aria-labelledby="speaker-comments-heading"
      aria-roledescription="carousel"
      className="bg-[#f4f7f8] py-16 lg:py-24"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mb-9 text-center">
          <div>
            <p className="text-xs font-bold tracking-[0.18em] text-orange uppercase">
              Voices from our stage
            </p>
            <h2
              id="speaker-comments-heading"
              className="mt-3 font-display text-3xl font-bold tracking-tight text-ieee-deep sm:text-4xl"
            >
              Conversations that <span className="text-orange">leave an impact.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-body">
              Thoughts and reflections from the speakers who make IEEE LETs talk possible.
            </p>
          </div>
        </div>
        <div ref={viewport} className="-my-6 overflow-hidden py-6">
          <div
            className="-ml-5 flex touch-pan-y items-stretch"
            aria-live={rotating ? "off" : "polite"}
          >
            {speakers.map((speaker, index) => (
              <div
                key={speaker.id}
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} of ${speakers.length}`}
                className="min-w-0 shrink-0 grow-0 basis-full pl-5 sm:basis-1/2 lg:basis-1/3"
              >
                <SpeakerCard speaker={speaker} />
              </div>
            ))}
          </div>
        </div>
        {snaps.length > 1 && (
          <div className="mt-8 flex flex-wrap justify-center gap-1">
            {snaps.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => api?.scrollTo(index)}
                aria-label={`Go to speaker comment ${index + 1}`}
                aria-current={selected === index ? "true" : undefined}
                className="grid h-10 w-10 place-items-center rounded-[5px] focus-visible:outline-2 focus-visible:outline-orange"
              >
                <span
                  className={`h-1.5 rounded-full transition-all ${selected === index ? "w-8 bg-orange" : "w-4 bg-ieee-deep/15"}`}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
