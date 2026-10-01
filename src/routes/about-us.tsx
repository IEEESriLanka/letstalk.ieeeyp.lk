import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import {
  ArrowRight,
  Award,
  BrainCircuit,
  Rocket,
  Link2,
  Trophy,
  GraduationCap,
  Handshake,
  Lightbulb,
  MessagesSquare,
  Network,
  Quote,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { SiteNav } from "@/components/site/site-nav";
import { AboutOverview } from "@/components/site/about-overview";
import { SiteFooter } from "@/components/site/site-footer";
import { Reveal, RevealGroup, fadeUp } from "@/components/site/motion-primitives";
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

const valueIcons = [Handshake, BrainCircuit, Target, Network];
const journeyIcons = [Rocket, Users, Link2, Trophy];
const storyIcons = [
  <Lightbulb className="size-5" />,
  <Users className="size-5" />,
  <MessagesSquare className="size-5" />,
  <Award className="size-5" />,
];

function AboutUsPage() {
  const { data: content = defaultSiteContent } = useQuery({
    queryKey: ["site-content"],
    queryFn: () => getSiteContent(),
  });

  return (
    <main id="top" className="min-h-screen overflow-hidden bg-background text-body">
      <SiteNav />
      <AboutOverview content={content.about} stats={content.hero.stats} />


      <section aria-labelledby="who-we-are-heading" className="relative py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <span className="inline-flex rounded-full bg-[#eaf6ff] px-4 py-2 text-sm font-bold tracking-[0.1em] text-ieee uppercase">Who We Are</span>
              <h2 id="who-we-are-heading" className="mt-6 text-4xl leading-[1.15] font-bold tracking-tight text-[#061025] sm:text-5xl lg:text-[clamp(2.5rem,3.2vw,3.5rem)]">
                A bridge between <span className="text-gradient-orange">ambition, industry</span>, and IEEE community.
              </h2>
            </div>
            <div>
              <div className="grid items-stretch gap-3 sm:grid-cols-2">
                {(content.about.storyCards?.length ? content.about.storyCards : defaultSiteContent.about.storyCards ?? []).map(
                  (card, index) => (
                    <StoryCard
                      key={card.title}
                      icon={storyIcons[index % storyIcons.length]}
                      title={card.title}
                      copy={card.copy}
                      warm={index % 2 === 1}
                    />
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-ieee-tint py-20 lg:py-28">
        <div
          aria-hidden
          className="absolute inset-0 bg-grid opacity-60 [mask-image:radial-gradient(60%_50%_at_50%_50%,black,transparent)]"
        />
        <div className="relative mx-auto max-w-6xl px-5">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="section-eyebrow">Our Values</span>
            <h2 className="mt-5 text-3xl leading-tight font-bold text-heading sm:text-4xl">
              Built for a community that learns, leads, and collaborates.
            </h2>
          </Reveal>
          <RevealGroup className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {(content.about.values ?? defaultSiteContent.about.values ?? []).map((value, index) => {
              const Icon = valueIcons[index % valueIcons.length];
              return (
                <motion.article key={value.title} variants={fadeUp} className="card-surface p-7">
                  <span className="grid size-12 place-items-center rounded-2xl bg-orange-tint text-orange">
                    <Icon className="size-5.5" />
                  </span>
                  <h3 className="mt-6 text-lg font-bold text-heading">{value.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-body">{value.copy}</p>
                </motion.article>
              );
            })}
          </RevealGroup>
        </div>
      </section>

      <section aria-labelledby="about-journey-heading" className="relative py-20 lg:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <div>
            <span className="section-eyebrow">Our Journey</span>
            <h2 id="about-journey-heading" className="mt-8 text-4xl leading-[1.15] font-bold tracking-tight text-[#06172d] sm:text-5xl xl:text-[3.5rem]">
              Growing a national platform for <span className="text-gradient-orange">professional development.</span>
            </h2>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-body lg:text-xl">{content.about.quote}</p>
          </div>
          <ol className="relative space-y-4 border-l-2 border-[#dceafa] pl-6 sm:pl-8">
            {(content.about.milestones?.length ? content.about.milestones : defaultSiteContent.about.milestones ?? []).map((item, index) => {
              const Icon = journeyIcons[index % journeyIcons.length];
              const warm = index % 2 === 1;
              return (
                <li key={item} className="relative">
                  <span aria-hidden="true" className="absolute top-1/2 -left-[33px] size-3.5 -translate-y-1/2 rounded-full border-2 border-orange-100 bg-orange shadow-[0_0_0_6px_#fff0e4] sm:-left-[41px]" />
                  <article className={`relative isolate flex items-start gap-4 overflow-hidden rounded-2xl border bg-white/85 p-5 shadow-[0_5px_24px_-12px_#00629b20] sm:gap-6 sm:p-6 ${warm ? "border-[#ffeddf]" : "border-[#e5effa]"}`}>
                    <span aria-hidden="true" className={`absolute top-0 right-0 -z-10 grid size-24 place-items-start justify-items-end rounded-bl-full pt-4 pr-5 text-3xl font-bold ${warm ? "bg-[#fff8f2] text-[#ffd1ad]" : "bg-[#f0f8ff] text-[#aed6ff]"}`}>{String(index + 1).padStart(2, "0")}</span>
                    <span className={`grid size-14 shrink-0 place-items-center rounded-full sm:size-16 ${warm ? "bg-orange-tint text-orange" : "bg-ieee-tint text-ieee"}`}><Icon aria-hidden="true" className="size-7" /></span>
                    <div className="relative flex-1 pr-6 sm:pr-10">
                      <h3 className="text-xl font-bold text-[#06172d]">{item.trim().split(/\s+/)[0]}</h3>
                      <p className="mt-2 text-base leading-relaxed text-body">{item.replace(/[.!?]?$/, ".")}</p>
                    </div>
                  </article>
                </li>
              );
            })}
          </ol>
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
              <a
                href="/#journey"
                className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                View initiatives
                <GraduationCap className="size-4" />
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

function StoryCard({ icon, title, copy, warm = false }: { icon: ReactNode; title: string; copy: string; warm?: boolean }) {
  return (
    <article className="relative isolate overflow-hidden rounded-[1.75rem] border border-[#e3eef9] bg-white/85 p-7 shadow-[0_4px_16px_-8px_#00629b26] sm:p-8">
      <div aria-hidden="true" className={`pointer-events-none absolute top-1 right-1 -z-10 size-24 rounded-bl-full rounded-tr-[1.5rem] ${warm ? "bg-orange-tint/50" : "bg-ieee-tint/60"}`} />
      <div className={`grid size-14 place-items-center rounded-full [&>svg]:size-7 [&>svg]:stroke-[1.6] ${warm ? "bg-orange-tint text-orange" : "bg-ieee-tint text-ieee"}`}>
        {icon}
      </div>
      <h3 className="mt-4 text-2xl font-bold tracking-tight text-[#061025]">{title}</h3>
      <span aria-hidden="true" className="mt-4 block h-0.5 w-9 bg-orange" />
      <p className="mt-5 text-base leading-relaxed text-body lg:text-lg">{copy}</p>
    </article>
  );
}
