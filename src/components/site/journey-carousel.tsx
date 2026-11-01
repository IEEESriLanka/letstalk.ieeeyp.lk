import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { CalendarDays, ChevronLeft, ChevronRight, MapPin, Pause, Play } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { journeyEvents, journeyWindow } from "@/lib/journey-events";
import type { SiteContent } from "@/lib/site-content";

type JourneyEvent = SiteContent["events"][number];
const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));

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
          : "aspect-[16/9] w-full object-cover"
      }
    />
  ) : (
    <div className="grid aspect-[16/9] place-items-center bg-gradient-to-br from-blue-50 to-orange-50">
      <CalendarDays className="size-12 text-ieee/40" aria-hidden="true" />
    </div>
  );
}

function JourneyCard({
  event,
  onOpenChange,
}: {
  event: JourneyEvent;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog onOpenChange={onOpenChange}>
      <article className="flex h-full flex-col overflow-hidden rounded-[5px] border border-slate-100 border-b-4 border-b-orange bg-white shadow-[0_12px_30px_-12px_rgba(7,22,56,0.3)]">
        <EventPhoto event={event} />
        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <time dateTime={event.dateLabel} className="text-xs font-bold text-[#b46c2d]">
            {formatDate(event.dateLabel)}
          </time>
          <h4 className="mt-3 line-clamp-2 font-display text-xl leading-snug font-bold text-ieee-deep">
            {event.title}
          </h4>
          <p className="mt-2 line-clamp-1 text-xs font-semibold text-ieee">{event.tag}</p>
          <p className="mt-4 line-clamp-3 whitespace-pre-line break-words text-sm leading-relaxed text-body">
            {event.description}
          </p>
          <DialogTrigger asChild>
            <button
              type="button"
              className="mt-auto inline-flex min-h-11 items-center gap-2 self-start pt-5 text-sm font-bold text-orange underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange"
              aria-label={`Read full details of ${event.title}`}
            >
              {event.description.length > 180 || event.title.length > 65
                ? "Read more"
                : "View details"}
              <ChevronRight className="size-4" />
            </button>
          </DialogTrigger>
        </div>
      </article>
      <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-[5px] p-5 sm:p-8">
        <div className="pr-7">
          <DialogTitle className="text-2xl leading-snug text-ieee-deep">{event.title}</DialogTitle>
          <DialogDescription className="mt-2">
            {formatDate(event.dateLabel)} · {event.tag}
          </DialogDescription>
        </div>
        <EventPhoto event={event} large />
        {event.badge && (
          <p className="flex items-center gap-2 text-sm font-semibold text-ieee">
            <MapPin className="size-4 shrink-0" aria-hidden="true" />
            {event.badge}
          </p>
        )}
        <p className="whitespace-pre-line break-words text-base leading-relaxed text-body">
          {event.description}
        </p>
      </DialogContent>
    </Dialog>
  );
}

function JourneyCards({ events }: { events: JourneyEvent[] }) {
  const [active, setActive] = useState(events.length >= 3 ? 1 : 0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
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
    !dialogOpen &&
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
          className={`relative grid min-w-0 flex-1 touch-pan-y items-stretch gap-4 overflow-hidden py-6 lg:gap-6 ${events.length >= 3 ? "md:grid-cols-3" : events.length === 2 ? "md:grid-cols-2" : "mx-auto max-w-md"}`}
          aria-live={rotating ? "off" : "polite"}
        >
          <AnimatePresence initial={false} mode="popLayout">
            {journeyWindow(events, active).map(({ event, index }) => (
              <motion.div
                layout={!reducedMotion}
                key={`${event.dateLabel}-${event.title}-${index}`}
                initial={reducedMotion ? false : { opacity: 0, x: 30, scale: 0.94 }}
                animate={{
                  opacity: 1,
                  x: 0,
                  scale: index === active ? 1 : 0.94,
                  y: index === active ? -8 : 0,
                }}
                exit={{
                  opacity: 0,
                  x: reducedMotion ? 0 : -30,
                  transition: { duration: reducedMotion ? 0 : 0.35 },
                }}
                transition={{ duration: reducedMotion ? 0 : 0.8, ease: [0.22, 1, 0.36, 1] }}
                className={`min-w-0 ${index === active ? "relative z-10" : "hidden md:block"}`}
              >
                <JourneyCard event={event} onOpenChange={setDialogOpen} />
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
              key={`${event.dateLabel}-${event.title}-${index}`}
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

export function PastSessions({ events }: { events: SiteContent["events"] }) {
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Colombo" });
  const years = [
    ...new Set([
      "2026",
      "2025",
      "2024",
      ...events
        .filter((event) => /^\d{4}-\d{2}-\d{2}$/.test(event.dateLabel) && event.dateLabel < today)
        .map((event) => event.dateLabel.slice(0, 4)),
    ]),
  ]
    .filter((year) => year !== "2023")
    .sort()
    .reverse();
  const year = selectedYear && years.includes(selectedYear) ? selectedYear : years[0]!;
  const pastEvents = journeyEvents(events, year, today);
  return (
    <section id="journey" aria-labelledby="journey-heading" className="scroll-mt-24 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="section-eyebrow">Milestones</span>
          <h2
            id="journey-heading"
            className="mt-5 text-3xl font-bold tracking-tight text-heading sm:text-4xl"
          >
            Our Journey <span className="text-gradient-orange">so far</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-body">
            Celebrating the events, conversations, and industry connections that bring our community
            together.
          </p>
        </div>
        <div
          role="group"
          aria-label="Event year"
          className="mx-auto mt-8 flex w-fit max-w-full flex-wrap justify-center gap-1 rounded-full border border-slate-200 bg-slate-100/90 p-1.5 shadow-soft"
        >
          {years.map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={year === value}
              aria-controls="journey-events"
              onClick={() => setSelectedYear(value)}
              className={`min-h-10 rounded-full px-5 py-2 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-orange ${year === value ? "bg-orange text-white shadow-sm" : "text-ieee hover:bg-white"}`}
            >
              {value}
            </button>
          ))}
        </div>
        <div id="journey-events" className="mt-5">
          <h3 className="text-center text-base font-semibold text-heading">{year} events</h3>
          {pastEvents.length ? (
            <JourneyCards key={`${year}-${JSON.stringify(pastEvents)}`} events={pastEvents} />
          ) : (
            <p role="status" className="py-16 text-center text-body">
              No past events published for {year} yet.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
