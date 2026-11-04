import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { SiteNav } from "@/components/site/site-nav";
import { SiteFooter } from "@/components/site/site-footer";
import { getSiteContent } from "@/lib/content-actions";
import { getMainEventDetails } from "@/lib/main-events";

export const Route = createFileRoute("/main-events/$eventId")({
  loader: async ({ context, params }) => {
    const content = await context.queryClient.ensureQueryData({ queryKey: ["site-content"], queryFn: () => getSiteContent() });
    if (!getMainEventDetails(content).some((event) => event.id === params.eventId)) throw notFound();
    return content;
  },
  head: ({ loaderData, params }) => ({ meta: [{ title: `${getMainEventDetails(loaderData ?? {}).find((event) => event.id === params.eventId)?.title || "Our Main Events"} | IEEE LETs Talk` }] }),
  notFoundComponent: () => <main className="px-6 py-32"><h1 className="text-2xl font-bold">Event not found</h1><Link to="/" hash="journey" className="mt-5 inline-block text-ieee underline">Our Main Events</Link></main>,
  component: MainEventDetails,
});

function MainEventDetails() {
  const initialData = Route.useLoaderData();
  const { eventId } = Route.useParams();
  const { data } = useQuery({ queryKey: ["site-content"], queryFn: () => getSiteContent(), initialData, staleTime: 0 });
  const event = getMainEventDetails(data).find((item) => item.id === eventId)!;
  return <>
    <SiteNav />
    <main className="min-h-screen bg-slate-50/70 pt-32 pb-20">
      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        <Link to="/" hash="journey" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-ieee"><ArrowLeft className="size-4" /> Our Main Events</Link>
        <h1 className="mb-7 text-2xl leading-tight font-bold text-ieee-deep sm:text-4xl">{event.title}</h1>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          {event.imageUrl && <img src={event.imageUrl} alt={event.title} className="mx-auto max-h-[650px] max-w-full rounded-lg object-contain shadow-lg" />}
          <h2 className="mt-8 text-xl font-bold text-ieee-deep">Event Description</h2>
          <p className="mt-5 whitespace-pre-line break-words text-base leading-relaxed text-body">{event.description}</p>
        </article>
      </div>
    </main>
    <SiteFooter email={data.contact.email} />
  </>;
}
