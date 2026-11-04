import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { ArrowRight, ImageIcon, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { getMainEvents } from "@/lib/main-events";
import type { SiteContent } from "@/lib/site-content";

type JourneyEvent = ReturnType<typeof getMainEvents>[number];

function EventPhoto({ event, large = false }: { event: JourneyEvent; large?: boolean }) {
  const [failed, setFailed] = useState("");
  return event.imageUrl && failed !== event.imageUrl ? (
    <img
      src={event.imageUrl}
      alt={event.title}
      loading="lazy"
      onError={() => setFailed(event.imageUrl ?? "")}
      className={
        large
          ? "max-h-[45vh] w-full rounded-[5px] bg-slate-50 object-contain"
          : "max-h-[26rem] w-auto max-w-full rounded-[18px] object-contain"
      }
    />
  ) : (
    <div className="grid min-h-64 h-full w-full place-items-center bg-gradient-to-br from-blue-50 to-orange-50">
      <ImageIcon className="size-12 text-ieee/40" aria-hidden="true" />
    </div>
  );
}

function JourneyCard({ event }: { event: JourneyEvent }) {
  return (
    <>
      <article className="relative isolate grid h-full overflow-hidden rounded-[22px] border border-blue-100 bg-white bg-[linear-gradient(125deg,rgba(255,121,0,0.18)_0%,rgba(255,121,0,0.07)_40%,rgba(255,121,0,0.02)_70%,rgba(255,121,0,0.10)_100%)] p-6 shadow-[0_20px_45px_-20px_rgba(0,65,112,0.4)] sm:p-8 md:grid-cols-[2fr_3fr] lg:p-10">
        <div className="relative flex items-center justify-center px-4 py-5 md:mr-8 md:border-r md:border-slate-200 md:pr-8">
          <div className="relative w-fit max-w-full">
            <div aria-hidden="true" className="absolute -top-3 -left-3 -z-10 h-1/2 w-1/2 rounded-[26px] bg-gradient-to-br from-ieee to-ieee-deep" />
            <div aria-hidden="true" className="absolute -right-3 -bottom-3 -z-10 h-1/3 w-1/2 rounded-[24px] bg-gradient-to-br from-ieee to-ieee-deep" />
            <div className="overflow-hidden rounded-[21px] border-2 border-orange bg-white p-0.5 shadow-xl">
              <EventPhoto event={event} />
            </div>
          </div>
        </div>
        <div className="flex min-w-0 flex-col justify-center py-5 md:py-0">
          <h4 className="mt-6 border-l-[5px] border-orange pl-4 break-words font-display text-xl leading-tight font-bold text-ieee-deep uppercase sm:text-2xl lg:text-3xl">
            {event.title}
          </h4>
          <p className="mt-4 line-clamp-6 whitespace-pre-line break-words text-sm leading-relaxed text-body sm:text-base">
            {event.homepageContent ?? event.description}
          </p>
            <Link
              to="/main-events/$eventId"
              params={{ eventId: event.id }}
              className="mt-6 inline-flex min-h-11 items-center gap-5 self-start rounded-full bg-gradient-to-r from-orange to-[#ff7900] px-6 py-2.5 text-base font-bold text-white transition-shadow hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange"
              aria-label={`Read full details of ${event.title}`}
            >
              Read more
              <ArrowRight className="size-5" />
            </Link>
        </div>
      </article>
    </>
  );
}

function JourneyCards({ events }: { events: JourneyEvent[] }) {
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [paused, setPaused] = useState(false);
  const region = useRef<HTMLDivElement>(null);
  const inView = useInView(region, { amount: 0.2 });
  const reducedMotion = useReducedMotion();
  const rotating =
    events.length > 1 &&
    inView &&
    reducedMotion === false &&
    !hovered &&
    !focused &&
    !paused;
  useEffect(() => {
    if (!rotating) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") setActive((index) => (index + 1) % events.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [rotating, events.length, active]);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const shift = (delta: number) =>
    setActive((current) => (current + delta + events.length) % events.length);
  const controls =
    "grid size-11 shrink-0 place-items-center rounded-[5px] border border-orange/20 bg-white/90 text-orange shadow-soft transition-colors hover:bg-orange hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange";
  return (
    <div
      ref={region}
      role="region"
      aria-roledescription="carousel"
      aria-label="Journey events"
      className="mt-8"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
    >
      <div
        className="flex items-center gap-2 sm:gap-5"
        onTouchStart={(event) => {
          const point = event.touches[0];
          touch.current = point ? { x: point.clientX, y: point.clientY } : null;
        }}
        onTouchEnd={(event) => {
          const point = event.changedTouches[0];
          const start = touch.current;
          touch.current = null;
          if (
            point &&
            start &&
            Math.abs(point.clientX - start.x) > 40 &&
            Math.abs(point.clientX - start.x) > Math.abs(point.clientY - start.y)
          )
            shift(point.clientX < start.x ? 1 : -1);
        }}
      >
        {events.length > 1 && (
          <button
            type="button"
            className={controls}
            onClick={() => shift(-1)}
            aria-label="Previous journey event"
          >
            <ChevronLeft className="size-5" />
          </button>
        )}
        <div
          className="relative grid min-w-0 flex-1 touch-pan-y items-stretch overflow-hidden py-6"
          aria-live={rotating ? "off" : "polite"}
        >
          <AnimatePresence initial={false} mode="popLayout">
            {[{ event: events[active]!, index: active }].map(({ event, index }) => (
              <motion.div
                layout={!reducedMotion}
                key={event.id}
                initial={reducedMotion ? false : { opacity: 0, x: 30, scale: 0.94 }}
                animate={{
                  opacity: 1,
                  x: 0,
                  scale: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  x: reducedMotion ? 0 : -30,
                  transition: { duration: reducedMotion ? 0 : 0.35 },
                }}
                transition={{ duration: reducedMotion ? 0 : 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="relative min-w-0"
              >
                <JourneyCard event={event} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        {events.length > 1 && (
          <button
            type="button"
            className={controls}
            onClick={() => shift(1)}
            aria-label="Next journey event"
          >
            <ChevronRight className="size-5" />
          </button>
        )}
      </div>
      {events.length > 1 && (
        <div
          className="mt-3 flex flex-wrap justify-center gap-1"
          aria-label="Choose a journey event"
        >
          {events.map((event, index) => (
            <button
              key={event.id}
              type="button"
              aria-label={`Show event ${index + 1}: ${event.title}`}
              aria-current={active === index ? "true" : undefined}
              onClick={() => setActive(index)}
              className="grid min-h-11 min-w-8 place-items-center rounded-[5px] focus-visible:outline-2 focus-visible:outline-orange"
            >
              <span
                className={`h-1.5 rounded-full ${active === index ? "w-6 bg-orange" : "w-2 bg-slate-300"}`}
              />
            </button>
          ))}
          {reducedMotion === false && (
            <button
              type="button"
              className="ml-2 grid size-11 place-items-center rounded-[5px] text-ieee focus-visible:outline-2 focus-visible:outline-orange"
              aria-label={paused ? "Resume journey rotation" : "Pause journey rotation"}
              onClick={() => setPaused((value) => !value)}
            >
              {paused ? <Play className="size-4" /> : <Pause className="size-4" />}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function PastSessions({ content }: { content: SiteContent }) {
  const events = getMainEvents(content);
  return (
    <section id="journey" aria-labelledby="journey-heading" className="scroll-mt-24 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="section-eyebrow">IEEE LETs Talk</span>
          <h2
            id="journey-heading"
            className="mt-5 text-3xl font-bold tracking-tight text-heading sm:text-4xl"
          >
            Our Main <span className="text-gradient-orange">Events</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-body">
            Explore the conversations, workshops, and experiences that bring our community together.
          </p>
        </div>
        <div id="journey-events" className="mt-5">
          <JourneyCards key={JSON.stringify(events)} events={events} />
        </div>
      </div>
    </section>
  );
}
