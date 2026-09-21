import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, CalendarDays, MapPin, Search, X } from "lucide-react";
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
  const [year, setYear] = useState("all");
  const [search, setSearch] = useState("");
  const query = useQuery({ queryKey: ["site-content"], queryFn: () => getSiteContent() });
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Colombo" });
  const needle = search.trim().toLowerCase();
  const events = (query.data?.events ?? [])
    .filter((event) => (year === "all" || event.dateLabel.startsWith(year + "-")) &&
      [event.title, event.description, event.tag].some((value) => value.toLowerCase().includes(needle)))
    .sort((a, b) => b.dateLabel.localeCompare(a.dateLabel));

  return (
    <>
      <SiteNav />
      <main className="min-h-screen bg-background pt-32 pb-20">
        <div className="mx-auto max-w-7xl px-5">
          <span className="section-eyebrow">IEEE LETs Talk</span>
          <h1 className="mt-3 text-4xl font-bold text-heading">Events</h1>
          <div className="mt-8 flex flex-col gap-4 border-y border-border py-5 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1">
              <label htmlFor="event-search" className="mb-2 block text-sm font-semibold text-heading">Search events</label>
              <div className="relative">
                <Search aria-hidden="true" className="absolute top-3 left-3 size-5 text-body" />
                <input id="event-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by title, location, or description"
                  className="h-11 w-full rounded-md border border-border bg-white pr-10 pl-10 text-sm text-heading focus-visible:outline-2 focus-visible:outline-ieee" />
                {search && <button type="button" aria-label="Clear search" title="Clear search" onClick={() => setSearch("")}
                  className="absolute top-1 right-1 grid size-9 place-items-center rounded-md bg-white text-body"><X className="size-4" /></button>}
              </div>
            </div>
            <div>
              <label htmlFor="event-year" className="mb-2 block text-sm font-semibold text-heading">Year</label>
              <select id="event-year" value={year} onChange={(event) => setYear(event.target.value)}
                className="h-11 w-full rounded-md border border-border bg-white px-3 text-sm text-heading sm:w-40">
                <option value="all">All years</option>
                {["2026", "2025", "2024", "2023"].map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </div>
          </div>
          {query.isPending ? <p role="status" className="py-16 text-body">Loading events...</p> :
            query.isError ? <div role="alert" className="py-16 text-body">
              <p>Unable to load events.</p>
              <button type="button" onClick={() => void query.refetch()} className="mt-3 font-semibold text-ieee underline">Try again</button>
            </div> : <>
              <p role="status" className="my-6 text-sm text-body">{events.length} {events.length === 1 ? "event" : "events"}</p>
              {events.length === 0 ? <div className="py-16 text-center">
                <CalendarDays className="mx-auto size-10 text-ieee" />
                <h2 className="mt-4 text-xl font-bold text-heading">No events found</h2>
                {(search || year !== "all") && <button type="button" onClick={() => { setSearch(""); setYear("all"); }}
                  className="mt-4 font-semibold text-ieee underline">Clear filters</button>}
              </div> : <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {events.map((event, index) => {
                  const dated = /^\d{4}-\d{2}-\d{2}$/.test(event.dateLabel) && !Number.isNaN(Date.parse(event.dateLabel));
                  const past = dated && event.dateLabel < today;
                  const registration = event.registrationUrl && /^https?:\/\//i.test(event.registrationUrl) ? event.registrationUrl : null;
                  return <article key={event.title + event.dateLabel + index} className="flex min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-white transition-shadow hover:shadow-lg">
                    <div className="relative aspect-square bg-ieee-tint">
                      <img src={event.imageUrl || logo} alt={event.title} loading="lazy"
                        className={`size-full object-contain ${event.imageUrl ? "" : "p-12"}`} />
                      <span className="absolute bottom-3 left-3 max-w-[calc(100%-1.5rem)] rounded-md bg-black/80 px-3 py-2 text-sm font-semibold text-white">
                        {dated ? new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(event.dateLabel)) : event.dateLabel}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <span className={`text-xs font-bold ${past ? "text-body" : "text-ieee"}`}>{dated ? (past ? "Past event" : "Upcoming") : "Event"}</span>
                      <h2 className="mt-3 break-words text-xl leading-snug font-bold text-heading">{event.title}</h2>
                      <p className="mt-3 flex items-start gap-2 text-sm text-ieee"><MapPin className="mt-0.5 size-4 shrink-0" /><span className="min-w-0 break-words">{event.tag}</span></p>
                      <p className="mt-4 whitespace-pre-line break-words text-sm leading-relaxed text-body">{event.description}</p>
                      {!past && registration && <a href={registration} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 self-start font-semibold text-ieee">
                        Register <ArrowUpRight className="size-4" />
                      </a>}
                    </div>
                  </article>;
                })}
              </div>}
            </>}
        </div>
      </main>
      <SiteFooter email={query.data?.contact.email ?? defaultSiteContent.contact.email} />
    </>
  );
}
