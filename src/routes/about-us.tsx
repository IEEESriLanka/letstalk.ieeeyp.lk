import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Globe2,
  Quote,
  Sparkles,
} from "lucide-react";
import { SiteNav } from "@/components/site/site-nav";
import { AboutOverview } from "@/components/site/about-overview";
import { SiteFooter } from "@/components/site/site-footer";
import { Reveal, RevealGroup } from "@/components/site/motion-primitives";
import { getSiteContent } from "@/lib/content-actions";
import { defaultSiteContent } from "@/lib/site-content";

export const Route = createFileRoute("/about-us")({
  head: () => ({
    meta: [
      { title: "About Us | IEEE LETs Talk" },
      {
        name: "description",
        content:
          "Learn about IEEE LETs Talk, the professional development initiative connecting future professionals with industry leaders.",
      },
    ],
  }),
  component: AboutUsPage,
});

function AboutUsPage() {
  const { data: content = defaultSiteContent } = useQuery({
    queryKey: ["site-content"],
    queryFn: () => getSiteContent(),
  });
  const organizations = (
    content.about.organizations?.length
      ? content.about.organizations
      : defaultSiteContent.about.organizations ?? []
  ).filter((organization) => organization.title !== "IEEE LETs Talk");

  return (
    <main id="top" className="min-h-screen overflow-hidden bg-background text-body">
      <SiteNav />
      <AboutOverview content={content.about} />

      <section aria-labelledby="vision-mission-heading" className="relative border-y border-border/60 bg-gradient-to-b from-[#f8fbff] to-white py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 id="vision-mission-heading" className="mt-4 text-3xl font-bold tracking-tight text-[#061025] sm:text-4xl lg:text-5xl">
              Our Vision & Mission
            </h2>
            <p className="mt-4 text-base leading-relaxed text-body sm:text-lg">
              The strategic vision and foundational mission driving professional excellence across Sri Lanka.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-8 md:grid-cols-2">
            <Reveal delay={0.1}>
              <div className="relative isolate flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-[#dceafa] bg-white p-8 shadow-[0_4px_24px_-10px_rgba(0,98,155,0.12)] transition-all duration-300 hover:border-ieee/40 hover:shadow-[0_12px_36px_-12px_rgba(0,98,155,0.18)] sm:p-10">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-16 -right-16 size-48 rounded-full bg-ieee-tint/70 blur-3xl"
                />
                <div>
                  <h3 className="text-2xl font-bold tracking-tight text-[#061025] sm:text-3xl">
                    Our Vision
                  </h3>
                  <p className="mt-4 text-base leading-relaxed text-body sm:text-lg">
                    {content.about.vision ?? defaultSiteContent.about.vision}
                  </p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="relative isolate flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-[#ffeedf] bg-white p-8 shadow-[0_4px_24px_-10px_rgba(255,104,21,0.12)] transition-all duration-300 hover:border-orange/40 hover:shadow-[0_12px_36px_-12px_rgba(255,104,21,0.18)] sm:p-10">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-16 -right-16 size-48 rounded-full bg-orange-tint/70 blur-3xl"
                />
                <div>
                  <h3 className="text-2xl font-bold tracking-tight text-[#061025] sm:text-3xl">
                    Our Mission
                  </h3>
                  <p className="mt-4 text-base leading-relaxed text-body sm:text-lg">
                    {content.about.mission ?? defaultSiteContent.about.mission}
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section aria-labelledby="ieee-network-heading" className="relative overflow-hidden bg-[#f8fbff] py-20 lg:py-28">
        <div className="pointer-events-none absolute -top-24 left-1/3 size-80 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(0,98,155,0.08),transparent_68%)]" />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal className="mx-auto max-w-3xl text-center">
            <span className="section-eyebrow">The IEEE Community Behind Us</span>
            <h2 id="ieee-network-heading" className="mt-4 text-3xl font-bold tracking-tight text-[#061025] sm:text-4xl lg:text-5xl">
              Our IEEE Network
            </h2>
            <p className="mt-4 text-base leading-relaxed text-body sm:text-lg">
              LETs Talk is strengthened by the global, national, and professional communities that make learning and collaboration possible.
            </p>
          </Reveal>

          <RevealGroup className="mx-auto mt-14 grid max-w-4xl gap-6">
            {organizations.map((organization, index) => (
              <OrganizationCard
                key={organization.title}
                title={organization.title}
                copy={organization.copy}
                warm={index % 2 === 1}
              />
            ))}
          </RevealGroup>
        </div>
      </section>

      <section className="relative overflow-hidden bg-ieee-deep py-20 text-white lg:py-28">
        <div
          aria-hidden
          className="absolute -top-32 -right-20 size-[420px] rounded-full bg-[color-mix(in_oklab,var(--orange)_22%,transparent)] blur-[130px]"
        />
        <div className="relative mx-auto max-w-5xl px-5 text-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-orange/40 bg-orange/15 px-4 py-1.5 text-xs font-semibold text-orange">
              <Sparkles className="size-3.5" />
              Let us collaborate
            </span>
            <h2 className="mx-auto mt-5 max-w-3xl text-3xl leading-tight font-bold text-white sm:text-4xl">
              Bring an industry story, workshop idea, or partnership opportunity to LETs Talk.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/75">
              We welcome speakers, mentors, partners, student branches, and volunteers who want to
              create meaningful learning experiences for the engineering community.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-4">
              <a
                href="/#contact"
                className="inline-flex items-center gap-2 rounded-full bg-[image:var(--gradient-orange)] px-7 py-3.5 text-sm font-semibold text-white shadow-glow transition-transform duration-300 hover:-translate-y-0.5"
              >
                Contact the team
                <ArrowRight className="size-4" />
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-surface-gray py-16">
        <div className="mx-auto max-w-4xl px-5">
          <Reveal>
            <div className="card-surface flex flex-col gap-5 p-7 sm:flex-row sm:items-start">
              <Quote className="size-8 shrink-0 text-orange" />
              <div>
                <p className="text-base leading-relaxed text-heading italic">
                  "{content.about.quote}"
                </p>
                <p className="mt-3 text-sm font-semibold text-ieee">{content.about.quoteBy}</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <SiteFooter email={content.contact.email} />
    </main>
  );
}

function OrganizationCard({ title, copy, warm = false }: { title: string; copy: string; warm?: boolean }) {
  return (
    <article className={`relative isolate overflow-hidden rounded-3xl border bg-white p-7 shadow-[0_5px_24px_-12px_#00629b20] transition-all duration-300 hover:-translate-y-1 sm:p-8 ${warm ? "border-[#ffeddf] hover:border-orange/40 hover:shadow-[0_12px_36px_-12px_rgba(255,104,21,0.18)]" : "border-[#e3eef9] hover:border-ieee/40 hover:shadow-[0_12px_36px_-12px_rgba(0,98,155,0.18)]"}`}>
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -top-12 -right-12 size-36 rounded-full blur-2xl ${warm ? "bg-orange-tint/70" : "bg-ieee-tint/70"}`}
      />
      <div className={`grid size-12 place-items-center rounded-2xl ${warm ? "bg-orange-tint text-orange" : "bg-ieee-tint text-ieee"}`}>
        <Globe2 className="size-6" />
      </div>
      <h3 className="mt-6 text-xl font-bold tracking-tight text-[#061025] sm:text-2xl">{title}</h3>
      <span className="mt-4 block h-0.5 w-9 bg-orange" aria-hidden="true" />
      <p className="mt-5 text-base leading-relaxed text-body">{copy}</p>
    </article>
  );
}
