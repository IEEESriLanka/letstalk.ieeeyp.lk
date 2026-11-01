import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { ArrowDown, CalendarDays, Pause, Play } from "lucide-react";
import { getEventsHero, getEventsHeroSlides } from "@/lib/events-hero";

export function EventsHero({ content }: { content: unknown }) {
  const hero = getEventsHero(content);
  const photos = getEventsHeroSlides(hero);
  const slides = photos.length
    ? photos
    : [{ imageUrl: "", title: hero.title, description: hero.description }];
  const [selected, setSelected] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const reducedMotion = useReducedMotion();
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const active = selected % slides.length;
  const rotating = photos.length > 1 && reducedMotion === false && !paused && !hovered && !focused;

  useEffect(() => {
    if (!rotating) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible")
        setSelected((index) => (index + 1) % slides.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [rotating, slides.length, active]);

  return (
    <section
      aria-labelledby="events-hero-heading"
      aria-roledescription="carousel"
      className="relative overflow-hidden pt-32 pb-14 sm:pt-40 lg:pb-20"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
    >
      <div
        className={`relative mx-auto grid max-w-7xl items-center gap-10 px-5 sm:px-8 ${photos.length ? "lg:grid-cols-2 lg:gap-14" : "text-center"}`}
      >
        <div className={photos.length ? "" : "mx-auto max-w-3xl"}>
          <span className="inline-flex items-center gap-2 rounded-full border border-orange/25 bg-orange-tint px-4 py-2 text-xs font-bold tracking-[0.16em] text-orange uppercase">
            <CalendarDays className="size-4" />
            IEEE LETs talk events
          </span>
          {/* Shared grid cells reserve space for the longest copy. One slide
              index changes the photo and text together without layout jumps. */}
          <div className="mt-6 grid" aria-live={rotating ? "off" : "polite"}>
            {slides.map((slide, index) => (
              <div
                key={index}
                aria-hidden={active !== index}
                className={`col-start-1 row-start-1 transition-opacity ease-in-out motion-reduce:transition-none ${active === index ? "opacity-100 duration-[2000ms] starting:opacity-0" : "pointer-events-none opacity-0 duration-700"}`}
              >
                {active === index ? (
                  <h1
                    id="events-hero-heading"
                    className="font-display text-4xl leading-tight font-bold tracking-tight text-ieee-deep sm:text-5xl lg:text-6xl"
                  >
                    {slide.title}
                  </h1>
                ) : (
                  <p className="font-display text-4xl leading-tight font-bold tracking-tight text-ieee-deep sm:text-5xl lg:text-6xl">
                    {slide.title}
                  </p>
                )}
                <p
                  className={`mt-5 max-w-2xl text-base leading-relaxed text-body sm:text-lg ${photos.length ? "" : "mx-auto"}`}
                >
                  {slide.description}
                </p>
              </div>
            ))}
          </div>
          <a
            href="#event-list"
            className="mt-8 inline-flex items-center gap-3 rounded-[5px] bg-orange px-6 py-3.5 text-sm font-bold text-white shadow-soft transition-colors hover:bg-[#e85d0c] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange"
          >
            Explore events
            <ArrowDown className="size-4" />
          </a>
        </div>
        {photos.length > 0 && (
          <div
            className="relative aspect-[4/3] touch-pan-y overflow-hidden rounded-[5px] border border-ieee/10 bg-slate-100 shadow-[0_20px_60px_-24px_rgba(7,22,56,0.35)]"
            onTouchStart={(event) => {
              const touch = event.touches[0];
              touchStart.current = touch ? { x: touch.clientX, y: touch.clientY } : null;
            }}
            onTouchEnd={(event) => {
              const touch = event.changedTouches[0];
              const start = touchStart.current;
              touchStart.current = null;
              if (!touch || !start) return;
              const delta = touch.clientX - start.x;
              if (Math.abs(delta) > 40 && Math.abs(delta) > Math.abs(touch.clientY - start.y))
                setSelected(
                  (index) => (index + (delta < 0 ? 1 : slides.length - 1)) % slides.length,
                );
            }}
          >
            {photos.map((slide, index) => (
              <img
                key={`${slide.imageUrl}-${index}`}
                src={slide.imageUrl}
                alt="IEEE LETs talk event highlight"
                aria-hidden={active !== index}
                fetchPriority={index === 0 ? "high" : "auto"}
                decoding="async"
                className={`absolute inset-0 size-full object-cover transition-opacity duration-[1200ms] ease-[cubic-bezier(0.25,0.1,0.25,1)] motion-reduce:transition-none ${active === index ? "opacity-100" : "opacity-0"}`}
              />
            ))}
            {photos.length > 1 && (
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-gradient-to-t from-black/60 to-transparent px-4 pt-8 pb-3">
                {photos.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    aria-label={`Show photo ${index + 1}`}
                    aria-current={active === index ? "true" : undefined}
                    onClick={() => setSelected(index)}
                    className="grid size-10 place-items-center rounded-[5px] focus-visible:outline-2 focus-visible:outline-white"
                  >
                    <span
                      className={`h-1.5 rounded-full ${active === index ? "w-7 bg-orange" : "w-3 bg-white/70"}`}
                    />
                  </button>
                ))}
                {reducedMotion === false && (
                  <button
                    type="button"
                    aria-label={paused ? "Resume hero rotation" : "Pause hero rotation"}
                    onClick={() => setPaused((value) => !value)}
                    className="ml-2 grid size-10 place-items-center rounded-[5px] text-white focus-visible:outline-2 focus-visible:outline-white"
                  >
                    {paused ? <Play className="size-4" /> : <Pause className="size-4" />}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
