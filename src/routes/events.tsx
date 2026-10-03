import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, CalendarDays, MapPin } from "lucide-react";
import { SiteNav } from "@/components/site/site-nav";
import { SiteFooter } from "@/components/site/site-footer";
import { getSiteContent } from "@/lib/content-actions";
import { defaultSiteContent } from "@/lib/site-content";
import logo from "@/assets/lets-talk-logo.png";

export const Route = createFileRoute("/events")({
  head: () => ({ meta: [{ title: "Events | IEEE LETs Talk" }] }),
  component: EventsPage,
});

function EventsPage() {
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const query = useQuery({ queryKey: ["site-content"], queryFn: () => getSiteContent() });
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Colombo" });

  const allEvents = query.data?.events ?? [];

  const isPastEvent = (dateStr: string) => {
    const isFormattedDate = /^\d{4}-\d{2}-\d{2}$/.test(dateStr) && !Number.isNaN(Date.parse(dateStr));
    return isFormattedDate && dateStr < today;
  };

  const upcomingEvents = useMemo(() => {
    return allEvents
      .filter((event) => !isPastEvent(event.dateLabel))
      .sort((a, b) => {
        const aDated = /^\d{4}-\d{2}-\d{2}$/.test(a.dateLabel);
        const bDated = /^\d{4}-\d{2}-\d{2}$/.test(b.dateLabel);
        if (aDated && bDated) return a.dateLabel.localeCompare(b.dateLabel);
        if (aDated) return -1;
        if (bDated) return 1;
        return a.title.localeCompare(b.title);
      });
  }, [allEvents, today]);

  const pastEvents = useMemo(() => {
    return allEvents
      .filter((event) => isPastEvent(event.dateLabel))
      .sort((a, b) => b.dateLabel.localeCompare(a.dateLabel));
  }, [allEvents, today]);

  const pastYears = useMemo(() => {
    const years = Array.from(
      new Set(
        pastEvents
          .map((e) => e.dateLabel.slice(0, 4))
          .filter((y) => /^\d{4}$/.test(y)),
      ),
    ).sort((a, b) => b.localeCompare(a));

    return years.length > 0 ? years : ["2026", "2025", "2024", "2023"];
  }, [pastEvents]);

  const displayedEvents = useMemo(() => {
    if (tab === "upcoming") {
      return upcomingEvents;
    }
    return pastEvents.filter(
      (event) => selectedYear === "all" || event.dateLabel.startsWith(selectedYear + "-"),
    );
  }, [tab, upcomingEvents, pastEvents, selectedYear]);

  return (
    <>
      <SiteNav />
      <main className="min-h-screen bg-background pt-32 pb-20">
        <div className="mx-auto max-w-7xl px-5">
          <div className="mx-auto max-w-3xl text-center">
            <span className="section-eyebrow">IEEE LETs Talk</span>
            <h1 className="mt-3 text-4xl font-bold text-heading sm:text-5xl">Events</h1>
            <p className="mt-4 text-base leading-relaxed text-body">
              Stay updated with our latest workshops, seminars, and networking sessions designed to empower young professionals in Sri Lanka.
            </p>
          </div>

          {/* Filter Section matching reference design */}
          <div className="mt-10 flex flex-col items-center">
            {/* Top Toggle: Upcoming Events | Past Events */}
            <div
              role="tablist"
              aria-label="Event timing"
              className="inline-flex items-center rounded-full bg-slate-100 p-1.5 border border-slate-200/70 shadow-inner"
            >
              <button
                type="button"
                role="tab"
                aria-selected={tab === "upcoming"}
                onClick={() => setTab("upcoming")}
                className={`rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-200 ${
                  tab === "upcoming"
                    ? "bg-white text-heading shadow-sm"
                    : "text-body hover:text-heading"
                }`}
              >
                Upcoming Events
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === "past"}
                onClick={() => setTab("past")}
                className={`rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-200 ${
                  tab === "past"
                    ? "bg-white text-heading shadow-sm"
                    : "text-body hover:text-heading"
                }`}
              >
                Past Events
              </button>
            </div>

            {/* Past Years Pills: Displayed under Upcoming/Past selection when Past Events is active */}
            {tab === "past" && (
              <div
                role="group"
                aria-label="Filter past events by year"
                className="mt-6 flex flex-wrap items-center justify-center gap-2.5"
              >
                <button
                  type="button"
                  aria-pressed={selectedYear === "all"}
                  onClick={() => setSelectedYear("all")}
                  className={`rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 ${
                    selectedYear === "all"
                      ? "bg-orange text-white shadow-soft"
                      : "border border-border bg-white text-heading/80 shadow-sm hover:border-ieee hover:text-heading"
                  }`}
                >
                  All Years
                </button>
                {pastYears.map((yr) => (
                  <button
                    key={yr}
                    type="button"
                    aria-pressed={selectedYear === yr}
                    onClick={() => setSelectedYear(yr)}
                    className={`rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 ${
                      selectedYear === yr
                        ? "bg-orange text-white shadow-soft"
                        : "border border-border bg-white text-heading/80 shadow-sm hover:border-ieee hover:text-heading"
                    }`}
                  >
                    {yr}
                  </button>
                ))}
              </div>
            )}
          </div>

          {query.isPending ? (
            <p role="status" className="py-16 text-center text-body">Loading events...</p>
          ) : query.isError ? (
            <div role="alert" className="py-16 text-center text-body">
              <p>Unable to load events.</p>
              <button
                type="button"
                onClick={() => void query.refetch()}
                className="mt-3 font-semibold text-ieee underline"
              >
                Try again
              </button>
            </div>
          ) : (
            <>
              <p role="status" className="mt-10 mb-6 text-sm text-body">
                {displayedEvents.length} {displayedEvents.length === 1 ? "event" : "events"}
              </p>

              {displayedEvents.length === 0 ? (
                <div className="py-16 text-center">
                  <CalendarDays className="mx-auto size-10 text-ieee" />
                  <h2 className="mt-4 text-xl font-bold text-heading">
                    {tab === "upcoming" ? "No upcoming events scheduled" : "No past events found"}
                  </h2>
                  <p className="mt-2 text-sm text-body">
                    {tab === "upcoming"
                      ? "Check back soon for new announcements, or explore our past events."
                      : selectedYear !== "all"
                        ? `No events recorded for ${selectedYear}.`
                        : "No past events recorded yet."}
                  </p>
                  {tab === "upcoming" ? (
                    <button
                      type="button"
                      onClick={() => setTab("past")}
                      className="mt-4 font-semibold text-ieee underline"
                    >
                      Browse past events
                    </button>
                  ) : selectedYear !== "all" ? (
                    <button
                      type="button"
                      onClick={() => setSelectedYear("all")}
                      className="mt-4 font-semibold text-ieee underline"
                    >
                      View all past years
                    </button>
                  ) : null}
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {displayedEvents.map((event, index) => {
                  const dated = /^\d{4}-\d{2}-\d{2}$/.test(event.dateLabel) && !Number.isNaN(Date.parse(event.dateLabel));
                  const past = dated && event.dateLabel < today;
                  const registration = event.registrationUrl && /^https?:\/\//i.test(event.registrationUrl) ? event.registrationUrl : null;
                  return (
                    <article
                      key={event.title + event.dateLabel + index}
                      className="flex h-[560px] min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
                    >
                      <div className="relative h-72 w-full shrink-0 overflow-hidden border-b border-border/50 bg-slate-950">
                        <img
                          src={event.imageUrl || logo}
                          alt={event.title}
                          loading="lazy"
                          className={`size-full object-contain ${event.imageUrl ? "bg-slate-950" : "bg-ieee-tint p-12"}`}
                        />
                        <span className="absolute bottom-3 left-3 max-w-[calc(100%-1.5rem)] rounded-full bg-black/80 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
                          {dated
                            ? new Intl.DateTimeFormat("en-GB", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                timeZone: "UTC",
                              }).format(new Date(event.dateLabel))
                            : event.dateLabel}
                        </span>
                      </div>
                      <div className="flex flex-1 flex-col p-5">
                        <span className={`text-xs font-bold ${past ? "text-body" : "text-ieee"}`}>
                          {dated ? (past ? "Past event" : "Upcoming") : "Event"}
                        </span>
                        <h2 className="mt-2.5 line-clamp-2 min-h-[3.25rem] break-words text-xl leading-snug font-bold text-heading">
                          {event.title}
                        </h2>
                        <p className="mt-2.5 flex items-start gap-2 text-sm text-ieee line-clamp-1">
                          <MapPin className="mt-0.5 size-4 shrink-0" />
                          <span className="min-w-0 truncate">{event.tag}</span>
                        </p>
                        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-body">
                          {event.description}
                        </p>
                        <div className="mt-auto flex min-h-[2.5rem] items-center pt-3">
                          {!past && registration ? (
                            <a
                              href={registration}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 font-semibold text-ieee transition-colors hover:text-orange"
                            >
                              Register <ArrowUpRight className="size-4" />
                            </a>
                          ) : null}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}
        </div>
      </main>
      <SiteFooter email={query.data?.contact.email ?? defaultSiteContent.contact.email} />
    </>
  );
}
