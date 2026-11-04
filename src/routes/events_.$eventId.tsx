import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CalendarDays, Clock, MapPin } from "lucide-react";
import { SiteNav } from "@/components/site/site-nav";
import { SiteFooter } from "@/components/site/site-footer";
import { getSiteContent } from "@/lib/content-actions";

export const Route = createFileRoute("/events_/$eventId")({
  loader: async ({ context, params }) => {
    const content = await context.queryClient.ensureQueryData({ queryKey: ["site-content"], queryFn: () => getSiteContent() });
    if (!content.events.some((event) => (event.id || `${event.dateLabel}-${event.title}`) === params.eventId)) throw notFound();
    return content;
  },
  head: ({ loaderData, params }) => ({ meta: [{ title: `${loaderData?.events.find((event) => (event.id || `${event.dateLabel}-${event.title}`) === params.eventId)?.title || "Event"} | IEEE LETs Talk` }] }),
  notFoundComponent: () => <main className="mx-auto max-w-4xl px-6 py-32"><h1 className="text-2xl font-bold">Event not found</h1><Link to="/events" className="mt-5 inline-block text-ieee underline">Browse events</Link></main>,
  component: EventDetails,
});

function EventDetails() {
  const initialData = Route.useLoaderData();
  const { eventId } = Route.useParams();
  const { data } = useQuery({ queryKey: ["site-content"], queryFn: () => getSiteContent(), initialData, staleTime: 0 });
  const event = data.events.find((item) => (item.id || `${item.dateLabel}-${item.title}`) === eventId);
  if (!event) return <main className="px-6 py-32"><p>This event is no longer available.</p><Link to="/events">Browse events</Link></main>;
  const dated = /^\d{4}-\d{2}-\d{2}$/.test(event.dateLabel);
  const date = dated ? new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(event.dateLabel)) : event.dateLabel;
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Colombo" });
  const registration = (!dated || event.dateLabel >= today) && /^https?:\/\//i.test(event.registrationUrl || "") ? event.registrationUrl : null;
  const timeParts = event.startTime?.split(":");
  const time = timeParts ? `${Number(timeParts[0]) % 12 || 12}:${timeParts[1]} ${Number(timeParts[0]) >= 12 ? "PM" : "AM"}` : "To be announced";
  const registrationControl = registration ? <a href={registration} target="_blank" rel="noopener noreferrer" className="block rounded-lg bg-orange px-6 py-4 text-center text-sm font-bold text-white hover:brightness-95">Register now</a> : <div className="rounded-lg border border-slate-200 bg-slate-100 px-6 py-4 text-center text-sm font-bold text-slate-500">{dated && event.dateLabel < today ? "Registration closed" : "Registration unavailable"}</div>;
  return <>
    <SiteNav />
    <main className="min-h-screen bg-slate-50/70 pt-32 pb-20">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Link to="/events" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-ieee"><ArrowLeft className="size-4" /> All events</Link>
        <h1 className="mb-7 text-2xl leading-tight font-bold text-ieee-deep sm:text-4xl">{event.title}</h1>
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
          <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
            {event.imageUrl && <img src={event.imageUrl} alt={event.title} className="mx-auto max-h-[650px] max-w-full rounded-lg object-contain shadow-lg" />}
            <h2 className="mt-9 text-xl font-bold text-ieee-deep">Event Description</h2>
            <p className="mt-5 whitespace-pre-line break-words text-base leading-relaxed text-body">{event.description}</p>
            <div className="mt-8">{registrationControl}</div>
          </article>
          <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-28">
            <dl className="space-y-6">
              <div><dt className="flex items-center gap-2 text-sm text-body"><CalendarDays className="size-4" /> Date</dt><dd className="mt-2 font-semibold text-ieee-deep">{date}</dd></div>
              <div><dt className="flex items-center gap-2 text-sm text-body"><Clock className="size-4" /> Time</dt><dd className="mt-2 font-semibold text-ieee-deep">{time}</dd></div>
              <div><dt className="flex items-center gap-2 text-sm text-body"><MapPin className="size-4" /> Venue / Platform</dt><dd className="mt-2 whitespace-pre-line break-words font-semibold text-ieee-deep">{event.tag}</dd></div>
            </dl>
            <div className="mt-8">{registrationControl}</div>
          </aside>
        </div>
      </div>
    </main>
    <SiteFooter email={data.contact.email} />
  </>;
}
