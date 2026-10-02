import { motion, useInView, useReducedMotion, type Variants } from "motion/react";
import { useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  BrainCircuit,
  CalendarDays,
  CheckCircle2,
  Lightbulb,
  Mail,
  MessageCircle,
  MessagesSquare,
  Mic,
  Network,
  Quote,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import { Reveal, RevealGroup, fadeUp } from "./motion-primitives";
import { submitContactMessage } from "@/lib/content-actions";
import { getPublishedGalleryAlbums } from "@/lib/gallery-albums";
import type { SiteContent } from "@/lib/site-content";
import g1 from "@/assets/gallery-1.jpg";
import g2 from "@/assets/gallery-2.jpg";
import g3 from "@/assets/gallery-3.jpg";
import g4 from "@/assets/gallery-4.jpg";

function SectionHead({
  eyebrow,
  title,
  copy,
  center = false,
}: {
  eyebrow: string;
  title: React.ReactNode;
  copy?: string;
  center?: boolean;
}) {
  return (
    <Reveal className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <span className="section-eyebrow">{eyebrow}</span>
      <h2 className="mt-5 text-3xl leading-[1.14] font-bold tracking-tight sm:text-[2.6rem]">
        {title}
      </h2>
      {copy && <p className="mt-4 text-base leading-relaxed text-body">{copy}</p>}
    </Reveal>
  );
}

function WaveDivider({ flip = false }: { flip?: boolean }) {
  return (
    <div aria-hidden className={`pointer-events-none -mt-px ${flip ? "rotate-180" : ""}`}>
      <svg viewBox="0 0 1440 60" className="block h-10 w-full" preserveAspectRatio="none">
        <path
          d="M0 30 C240 60 480 0 720 22 C960 44 1200 58 1440 26 L1440 60 L0 60 Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}

const pillarIcons = {
  lightbulb: Lightbulb,
  mic: Mic,
  brain: BrainCircuit,
  network: Network,
};

const eventVisuals = [g1, g2, g3, g4];
const journeyYears = ["2024", "2025", "2026"];

export function About({ content }: { content: SiteContent["about"] }) {
  return (
    <section id="about" className="relative overflow-hidden bg-ieee-tint py-24 lg:py-32">
      <div
        aria-hidden
        className="absolute inset-0 bg-grid opacity-60 [mask-image:radial-gradient(60%_50%_at_50%_50%,black,transparent)]"
      />
      <div className="relative mx-auto max-w-6xl px-5">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <SectionHead
            eyebrow={content.eyebrow}
            title={
              <>
                {content.title} <span className="text-ieee">{content.highlightedWords}</span> and{" "}
                <span className="text-gradient-orange">{content.accentWords}</span>.
              </>
            }
            copy={content.copy}
          />
          <Reveal delay={0.1} className="lg:pb-2">
            <div className="card-surface flex gap-4 p-6 shadow-soft">
              <Quote className="size-7 shrink-0 text-orange" />
              <div>
                <p className="text-[0.95rem] leading-relaxed text-body italic">"{content.quote}"</p>
                <span className="mt-3 block text-xs font-semibold text-ieee not-italic">
                  {content.quoteBy}
                </span>
              </div>
            </div>
          </Reveal>
        </div>

        <RevealGroup className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {content.pillars.map((p) => {
            const Icon = pillarIcons[p.icon];
            return (
              <motion.div key={p.title} variants={fadeUp} className="card-surface group p-7">
                <span
                  className={`grid size-12 place-items-center rounded-2xl ${
                    p.accent ? "bg-orange-tint" : "bg-ieee-tint"
                  }`}
                >
                  <Icon className={`size-5.5 ${p.accent ? "text-orange" : "text-ieee"}`} />
                </span>
                <h3 className="mt-6 text-lg font-semibold text-heading">{p.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-body">{p.copy}</p>
              </motion.div>
            );
          })}
        </RevealGroup>
      </div>
      <div className="absolute inset-x-0 bottom-0 text-background">
        <WaveDivider />
      </div>
    </section>
  );
}

export function Events({ events }: { events: SiteContent["events"] }) {
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Colombo" });
  const upcomingEvents = events
    .filter((event) => /^\d{4}-\d{2}-\d{2}$/.test(event.dateLabel) && event.dateLabel >= today)
    .sort((a, b) => a.dateLabel.localeCompare(b.dateLabel));

  return (
    <section id="events" className="bg-background py-24 lg:py-32">
      <div className="mx-auto max-w-6xl px-5">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHead
            eyebrow="Events"
            title={
              <>
                Coming up <span className="text-gradient-orange">next...</span>
              </>
            }
            copy="Explore our upcoming leadership talks, industry workshops, and networking experiences designed to inspire, connect, and prepare the next generation of professionals."
          />
          <Reveal delay={0.1}>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-full border border-ieee/30 bg-white px-5 py-3 text-sm font-semibold text-ieee shadow-sm transition-colors hover:bg-ieee-tint"
            >
              Get notified for sessions
              <ArrowUpRight className="size-4" />
            </a>
          </Reveal>
        </div>

        {upcomingEvents.length > 0 ? (
          <EventCarousel
            key={JSON.stringify(upcomingEvents.map((event) => [event.dateLabel, event.title]))}
            events={upcomingEvents}
          />
        ) : (
          <p className="mt-14 text-center text-body">No upcoming events announced yet.</p>
        )}
      </div>
    </section>
  );
}

function EventCarousel({ events }: { events: SiteContent["events"] }) {
  const [active, setActive] = useState(0);
  const reduceMotion = useReducedMotion();
  const emptyVariants: Variants = {};
  const textReveal: Variants = {
    hidden: { opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 16 },
    visible: (order: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: reduceMotion ? 0 : 0.5,
        delay: reduceMotion ? 0 : 0.18 + order * 0.09,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    }),
  };

  return (
    <Reveal className="mt-14">
      <div className="relative mx-auto max-w-6xl overflow-hidden">
        <div className="relative flex h-[520px] items-stretch gap-0 overflow-hidden pt-14 sm:h-[540px]">
          {events.map((event, index) => {
            const isActive = index === active;
            const image = event.imageUrl || eventVisuals[index % eventVisuals.length];

            return (
              <motion.div
                layout
                key={event.title}
                onClick={() => setActive(index)}
                onKeyDown={(keyboardEvent) => {
                  if (keyboardEvent.key === "Enter" || keyboardEvent.key === " ") {
                    keyboardEvent.preventDefault();
                    setActive(index);
                  }
                }}
                tabIndex={0}
                role="group"
                aria-label={event.title}
                className="group min-w-0 transform-gpu text-left outline-none will-change-transform"
                animate={{
                  flex: isActive ? 4.8 : 1,
                  scale: isActive ? 1 : 0.98,
                }}
                transition={{
                  layout: { type: "spring", stiffness: 70, damping: 30, mass: 1.1 },
                  flex: { type: "spring", stiffness: 70, damping: 30, mass: 1.1 },
                  scale: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
                }}
              >
                <article
                  className={`relative h-[420px] overflow-hidden bg-ieee-deep shadow-[0_30px_80px_rgba(0,20,43,0.28)] transition-shadow duration-500 sm:h-[440px] ${
                    isActive ? "shadow-[0_34px_90px_rgba(0,20,43,0.34)]" : "shadow-soft"
                  }`}
                >
                  <img
                    src={image}
                    alt=""
                    className={`absolute inset-0 size-full object-cover transition duration-700 ${
                      isActive ? "scale-105 grayscale-0" : "scale-100 grayscale-[35%]"
                    }`}
                    loading="lazy"
                  />
                  <div
                    aria-hidden
                    className={`absolute inset-0 transition-opacity duration-500 ${
                      isActive
                        ? "bg-[linear-gradient(90deg,color-mix(in_oklab,var(--ieee-deep)_80%,transparent),color-mix(in_oklab,var(--ieee-deep)_38%,transparent)_55%,color-mix(in_oklab,var(--orange)_36%,transparent))]"
                        : "bg-[linear-gradient(90deg,color-mix(in_oklab,var(--ieee-deep)_70%,transparent),color-mix(in_oklab,var(--ieee-deep)_58%,transparent))]"
                    }`}
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-[radial-gradient(circle_at_72%_18%,rgba(255,255,255,0.22),transparent_28%)]"
                  />

                  <div
                    className={`relative flex h-full flex-col justify-between p-7 text-white transition-opacity duration-500 sm:p-9 ${
                      isActive ? "opacity-100" : "opacity-80"
                    }`}
                  >
                    <div className="flex items-start justify-end">
                      <span className="rounded-full border border-white/25 bg-white/15 px-3 py-1 text-[0.72rem] font-semibold tracking-wide text-white uppercase backdrop-blur-md">
                        {event.badge}
                      </span>
                    </div>

                    <motion.div
                      key={isActive ? "expanded" : "collapsed"}
                      initial={isActive ? "hidden" : false}
                      whileInView="visible"
                      viewport={{ once: true, amount: 0.2 }}
                      className={`${
                        isActive ? "max-w-md opacity-100" : "max-w-[7rem] opacity-90"
                      }`}
                    >
                      <motion.span
                        variants={isActive ? textReveal : emptyVariants}
                        custom={0}
                        style={{ display: "inline-block" }}
                        className={`text-xs font-bold tracking-[0.18em] text-orange-soft uppercase ${
                          isActive ? "" : ""
                        }`}
                      >
                        {event.tag}
                      </motion.span>
                      <motion.h3
                        variants={isActive ? textReveal : emptyVariants}
                        custom={1}
                        className={`mt-3 font-bold leading-tight text-white ${
                          isActive
                            ? "text-3xl sm:text-4xl"
                            : "line-clamp-4 text-xl [writing-mode:vertical-rl]"
                        }`}
                      >
                        {event.title}
                      </motion.h3>
                      {isActive && (
                        <>
                          <motion.p variants={textReveal} custom={2} className="mt-4 line-clamp-3 text-sm leading-relaxed text-white/82">
                            {event.description}
                          </motion.p>
                          <motion.div variants={textReveal} custom={3} className="mt-7 flex flex-wrap items-center gap-3">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-2 text-xs font-semibold text-white backdrop-blur-md">
                              <CalendarDays className="size-3.5 text-orange-soft" />
                              {event.dateLabel}
                            </span>
                            <a
                              href={event.registrationUrl || "#contact"}
                              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-ieee shadow-soft transition-transform hover:-translate-y-0.5"
                            >
                              Register Interest
                              <ArrowUpRight className="size-3.5" />
                            </a>
                          </motion.div>
                        </>
                      )}
                    </motion.div>
                  </div>
                </article>
              </motion.div>
            );
          })}
        </div>

        <div className="relative mt-5 flex justify-center gap-2">
          {events.map((event, index) => (
            <button
              key={event.title}
              type="button"
              aria-label={`Show ${event.title}`}
              onClick={() => setActive(index)}
              className={`h-2.5 rounded-full transition-all ${
                active === index ? "w-9 bg-orange" : "w-2.5 bg-ieee/20 hover:bg-ieee/40"
              }`}
            />
          ))}
        </div>
      </div>
    </Reveal>
  );
}

function JourneyEvent({ event, last }: { event: SiteContent["events"][number]; last: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-20% 0px -25% 0px" });
  const reducedMotion = useReducedMotion();
  const active = inView || Boolean(reducedMotion);

  return (
    <div ref={ref} className="relative grid min-h-[50vh] gap-8 py-8 pl-9 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:gap-12 lg:pl-11">
      {!last && <div aria-hidden="true" className="absolute top-10 bottom-[-2.5rem] left-[9px] w-px bg-ieee/25" />}
      <div aria-hidden="true" className={`absolute top-10 left-0 size-5 rounded-full border transition-colors ${active ? "border-ieee bg-ieee shadow-[0_0_0_6px_rgba(0,114,178,0.12)]" : "border-ieee/35 bg-white"}`} />
      <motion.div
        initial={false}
        animate={{ opacity: active ? 1 : 0.34, y: active ? 0 : 12 }}
        transition={{ duration: reducedMotion ? 0 : 0.5 }}
        className="min-w-0"
      >
        <time dateTime={event.dateLabel} className="text-sm font-semibold text-orange">
          {new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(event.dateLabel))}
        </time>
        <h4 className="mt-3 break-words text-2xl font-bold text-heading">{event.title}</h4>
        <p className="mt-2 break-words text-sm font-semibold text-ieee">{event.tag}</p>
        <p className="mt-4 whitespace-pre-line break-words text-sm leading-relaxed text-body">{event.description}</p>
      </motion.div>
      <motion.div
        initial={false}
        animate={{ opacity: active ? 1 : 0.18, x: active ? 0 : 24, scale: active ? 1 : 0.96 }}
        transition={{ duration: reducedMotion ? 0 : 0.62, ease: [0.22, 1, 0.36, 1] }}
        className="flex min-w-0 items-center justify-center py-4"
      >
        {event.imageUrl ? (
          <img src={event.imageUrl} alt={event.title} loading="lazy" className="block h-auto max-h-[280px] w-auto max-w-full rounded-sm object-contain shadow-[0_12px_28px_-8px_rgba(0,38,76,0.28)] sm:max-h-[320px] sm:max-w-[360px]" />
        ) : (
          <div className="grid aspect-[4/3] w-full max-w-[360px] place-items-center rounded-lg bg-ieee-tint" aria-hidden="true">
            <CalendarDays className="size-12 text-ieee" />
          </div>
        )}
      </motion.div>
    </div>
  );
}

export function PastSessions({ events }: { events: SiteContent["events"] }) {
  const [year, setYear] = useState("2026");
  const [visibleCount, setVisibleCount] = useState(3);
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Colombo" });
  const availableYears = [...new Set([...journeyYears, ...events
    .filter((event) => /^\d{4}-\d{2}-\d{2}$/.test(event.dateLabel) && event.dateLabel < today)
    .map((event) => event.dateLabel.slice(0, 4))])]
    .filter((item) => item !== "2023")
    .sort((a, b) => b.localeCompare(a));
  const pastEvents = events
    .filter((event) => /^\d{4}-\d{2}-\d{2}$/.test(event.dateLabel) &&
      event.dateLabel.startsWith(year + "-") && event.dateLabel < today)
    .sort((a, b) => b.dateLabel.localeCompare(a.dateLabel));
  const visibleEvents = pastEvents.slice(0, visibleCount);

  return (
    <section id="journey" className="bg-orange-tint/40 py-24 lg:py-32">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal className="max-w-2xl">
          <span className="section-eyebrow">Milestones</span>
          <h2 className="mt-5 text-3xl leading-[1.14] font-bold text-heading sm:text-[2.6rem]">
            Our journey <span className="text-gradient-orange">so far</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-body">
            Celebrating the events, conversations, and industry connections that bring our community together.
          </p>
        </Reveal>
        <div role="group" aria-label="Event year" className="sticky top-20 z-20 mt-10 flex w-fit max-w-full flex-wrap gap-2 rounded-lg border border-border bg-white/95 p-1.5 shadow-soft backdrop-blur-xl">
          {availableYears.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={year === item}
              aria-controls="journey-events"
              onClick={() => {
                if (item !== year) {
                  setYear(item);
                  setVisibleCount(3);
                }
              }}
              className={`min-h-10 rounded-md px-2 py-2 text-sm font-bold transition-colors sm:px-6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ieee ${year === item ? "bg-orange text-white" : "bg-ieee-tint text-ieee hover:bg-orange-tint"}`}
            >
              {item}
            </button>
          ))}
        </div>
        <div id="journey-events" aria-live="polite" className="mt-10 min-h-48">
          <h3 className="mb-6 text-xl font-bold text-heading">{year} events</h3>
          {pastEvents.length === 0 ? (
            <p className="py-10 text-center text-body">No past events published for {year} yet.</p>
          ) : (
            <div key={year} className="overflow-x-clip">
              {visibleEvents.map((event, index) => (
                <JourneyEvent key={`${event.dateLabel}-${event.title}-${index}`} event={event} last={index === visibleEvents.length - 1} />
              ))}
            </div>
          )}
        </div>
        {visibleEvents.length < pastEvents.length && (
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              aria-controls="journey-events"
              onClick={() => setVisibleCount((count) => count + 3)}
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-orange px-7 py-3 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-[#e85f00] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ieee"
            >
              Read more
              <span className="sr-only"> events from {year}</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export function Gallery() {
  const { data: albums = [], isLoading, isError } = useQuery({
    queryKey: ["gallery-albums"],
    queryFn: getPublishedGalleryAlbums,
  });

  const visibleAlbums = albums.filter((album) => album.images.length > 0);

  // Statically pick 6 moments across albums (no dynamic swapping)
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
    <section id="gallery" className="bg-background py-24 lg:py-32">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHead
          center
          eyebrow="Visit our gallery"
          title={
            <>
              Moments from the <span className="text-gradient-orange">community</span>
            </>
          }
          copy="Snapshots of passion, collaboration, and learning from IEEE LETs Talk sessions across Sri Lanka."
        />
        {isLoading ? <p className="mt-14 text-center text-body/70">Loading photos…</p> : null}
        {isError ? (
          <p className="mt-14 rounded-2xl border border-red-200 bg-red-50 p-5 text-center text-red-700">
            Unable to load photos.
          </p>
        ) : null}
        {!isLoading && !isError && staticPhotos.length === 0 ? (
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
  );
}

export { Awards } from "./awards";

export { Partners } from "./partner-marquee";

export function StayConnected({ content }: { content: SiteContent["connected"] }) {
  return (
    <section id="whatsapp" className="bg-background px-5 py-20">
      <Reveal className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-[image:linear-gradient(135deg,#002B5B_0%,#001833_100%)] px-8 py-16 text-center text-white shadow-lift sm:px-16">
          <div
            aria-hidden
            className="absolute -top-24 -right-24 size-80 rounded-full bg-[color-mix(in_oklab,var(--orange)_25%,transparent)] blur-[100px]"
          />
          <div
            aria-hidden
            className="absolute inset-0 opacity-20 [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]"
          />
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-orange/40 bg-orange/15 px-4 py-1.5 text-xs font-semibold text-orange">
              <MessageCircle className="size-3.5" />
              Official Channel
            </span>
            <h2 className="mx-auto mt-5 max-w-2xl text-3xl leading-tight font-bold text-white sm:text-[2.6rem]">
              {content.title}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[0.98rem] leading-relaxed text-white/85">
              {content.copy}
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-4">
              <a
                href="#contact"
                className="group inline-flex items-center gap-2.5 rounded-full bg-[image:var(--gradient-orange)] px-7 py-3.5 text-sm font-semibold text-white shadow-glow transition-transform duration-300 hover:-translate-y-0.5"
              >
                <MessageCircle className="size-4.5" />
                {content.primaryCta}
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
              <a
                href="#events"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-colors duration-300 hover:bg-white/20"
              >
                <CalendarDays className="size-4" />
                {content.secondaryCta}
              </a>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

export function Contact({ content }: { content: SiteContent["contact"] }) {
  return (
    <section id="contact" className="relative overflow-hidden bg-ieee-tint py-24 lg:py-32">
      <div
        aria-hidden
        className="absolute -bottom-24 -left-16 size-[360px] rounded-full bg-[color-mix(in_oklab,var(--orange)_16%,transparent)] blur-[110px]"
      />
      <div className="relative mx-auto grid max-w-6xl gap-12 px-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <SectionHead
            eyebrow="Get in Touch"
            title={
              <>
                Connect, collaborate or <span className="text-gradient-orange">partner</span> with
                us
              </>
            }
            copy={content.copy}
          />
          <Reveal delay={0.1} className="mt-9 space-y-3">
            {[
              {
                icon: Mail,
                label: content.email,
                desc: "Official inquiries & proposals",
              },
              {
                icon: MessageCircle,
                label: content.whatsappLabel,
                desc: "Instant event alerts & community updates",
              },
              {
                icon: MessagesSquare,
                label: content.organization,
                desc: "National professional development platform",
              },
            ].map((c) => (
              <div
                key={c.label}
                className="flex items-center gap-3.5 rounded-2xl border border-border bg-white px-5 py-4 shadow-soft"
              >
                <div className="grid size-10 place-items-center rounded-xl bg-orange-tint text-orange">
                  <c.icon className="size-4.5" />
                </div>
                <div>
                  <span className="block text-sm font-bold text-heading">{c.label}</span>
                  <span className="text-xs text-body">{c.desc}</span>
                </div>
              </div>
            ))}
          </Reveal>
        </div>

        <Reveal delay={0.15}>
          <form
            className="card-surface p-7 sm:p-9"
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget as HTMLFormElement;
              const formData = new FormData(form);
              submitContactMessage({
                data: {
                  name: String(formData.get("name") ?? ""),
                  email: String(formData.get("email") ?? ""),
                  topic: String(formData.get("topic") ?? ""),
                  message: String(formData.get("message") ?? ""),
                },
              })
                .then(() => {
                  form.reset();
                  alert("Thank you! Your message has been received.");
                })
                .catch(() => alert("Sorry, your message could not be sent. Please try again."));
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-semibold tracking-wide text-body uppercase">
                  Full name
                </span>
                <input
                  required
                  name="name"
                  className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-heading outline-none transition-colors focus:border-ieee"
                  placeholder="Your Name"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold tracking-wide text-body uppercase">
                  Email
                </span>
                <input
                  required
                  name="email"
                  type="email"
                  className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-heading outline-none transition-colors focus:border-ieee"
                  placeholder="name@organization.com"
                />
              </label>
            </div>
            <label className="mt-4 block">
              <span className="text-xs font-semibold tracking-wide text-body uppercase">
                Topic / Inquiry
              </span>
              <input
                name="topic"
                className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-heading outline-none transition-colors focus:border-ieee"
                placeholder="Upcoming sessions, Partnership, Speaking, General inquiry..."
              />
            </label>
            <label className="mt-4 block">
              <span className="text-xs font-semibold tracking-wide text-body uppercase">
                Message
              </span>
              <textarea
                rows={4}
                name="message"
                className="mt-2 w-full resize-none rounded-xl border border-border bg-surface px-4 py-3 text-sm text-heading outline-none transition-colors focus:border-ieee"
                placeholder="How would you like to connect with IEEE LETs Talk?"
              />
            </label>
            <button
              type="submit"
              className="mt-6 w-full rounded-full bg-[image:var(--gradient-orange)] px-6 py-3.5 text-sm font-semibold text-white shadow-glow transition-transform duration-300 hover:-translate-y-0.5"
            >
              Send Message
            </button>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
