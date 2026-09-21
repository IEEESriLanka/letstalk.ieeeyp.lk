import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import {
  ArrowRight,
  Award,
  BrainCircuit,
  CheckCircle2,
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
import { SiteFooter } from "@/components/site/site-footer";
import { Reveal, RevealGroup, fadeUp } from "@/components/site/motion-primitives";
import { getSiteContent } from "@/lib/content-actions";
import { defaultSiteContent } from "@/lib/site-content";
import letsTalkLogo from "@/assets/lets-talk-logo.png";
import heroIllustration from "@/assets/hero-illustration.png";
import galleryOne from "@/assets/gallery-1.jpg";
import galleryTwo from "@/assets/gallery-2.jpg";

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

      <section className="relative overflow-hidden bg-mesh pt-32 pb-20 lg:pt-40 lg:pb-28">
        <div
          aria-hidden
          className="absolute inset-0 bg-grid opacity-70 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]"
        />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-5 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <Reveal>
            <span className="section-eyebrow">About IEEE LETs Talk</span>
            <h1 className="mt-6 text-4xl leading-[1.05] font-bold tracking-tight text-heading sm:text-5xl lg:text-6xl">
              Empowering careers through{" "}
              <span className="text-gradient-orange">conversations that matter.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-body sm:text-lg">
              {content.about.copy}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="/#events"
                className="inline-flex items-center gap-2 rounded-full bg-[image:var(--gradient-orange)] px-6 py-3 text-sm font-semibold text-white shadow-glow transition-transform duration-300 hover:-translate-y-0.5"
              >
                Explore events
                <ArrowRight className="size-4" />
              </a>
              <a
                href="/#contact"
                className="inline-flex items-center gap-2 rounded-full border border-ieee/25 bg-white px-6 py-3 text-sm font-semibold text-ieee shadow-soft transition-colors hover:bg-ieee-tint"
              >
                Collaborate with us
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="relative">
              <div className="absolute -inset-8 rounded-[3rem] bg-ieee-tint/80 blur-3xl" />
              <div className="glass-panel relative overflow-hidden rounded-[2rem] p-5">
                <div className="rounded-[1.5rem] bg-white p-7">
                  <div className="flex items-center gap-4">
                    <div className="grid size-16 place-items-center rounded-2xl border border-border bg-white p-2 shadow-soft">
                      <img
                        src={letsTalkLogo}
                        alt="IEEE LETs Talk logo"
                        className="size-full object-contain"
                      />
                    </div>
                    <div>
                      <p className="text-xs font-semibold tracking-[0.18em] text-ieee uppercase">
                        National Project
                      </p>
                      <h2 className="mt-1 text-xl font-bold text-heading">
                        IEEE Young Professionals Sri Lanka
                      </h2>
                    </div>
                  </div>
                  <div className="mt-8 grid grid-cols-3 gap-3">
                    {content.hero.stats.map((stat) => (
                      <div key={stat.label} className="rounded-2xl bg-surface-gray p-4 text-center">
                        <p className="text-2xl font-bold text-ieee">{stat.value}</p>
                        <p className="mt-1 text-xs font-medium text-body">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                  <img
                    src={heroIllustration}
                    alt="IEEE LETs Talk professional learning illustration"
                    className="mt-8 max-h-72 w-full object-contain"
                  />
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-background py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-5">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <Reveal>
              <span className="section-eyebrow">Who We Are</span>
              <h2 className="mt-5 text-3xl leading-tight font-bold text-heading sm:text-4xl">
                A bridge between ambition, industry, and IEEE community.
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="grid gap-5 sm:grid-cols-2">
                {(content.about.storyCards ?? defaultSiteContent.about.storyCards ?? []).map(
                  (card, index) => (
                    <StoryCard
                      key={card.title}
                      icon={storyIcons[index % storyIcons.length]}
                      title={card.title}
                      copy={card.copy}
                    />
                  ),
                )}
              </div>
            </Reveal>
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

      <section className="bg-background py-20 lg:py-28">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <Reveal>
            <div className="grid grid-cols-2 gap-4">
              <img
                src={galleryOne}
                alt="IEEE LETs Talk session with an audience"
                className="aspect-[4/5] rounded-3xl object-cover shadow-soft"
              />
              <img
                src={galleryTwo}
                alt="IEEE LETs Talk workshop collaboration"
                className="mt-10 aspect-[4/5] rounded-3xl object-cover shadow-soft"
              />
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <span className="section-eyebrow">Our Journey</span>
            <h2 className="mt-5 text-3xl leading-tight font-bold text-heading sm:text-4xl">
              Growing a national platform for professional development.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-body">{content.about.quote}</p>
            <div className="mt-8 space-y-4">
              {(content.about.milestones ?? defaultSiteContent.about.milestones ?? []).map((item) => (
                <div
                  key={item}
                  className="flex gap-3 rounded-2xl border border-border bg-white p-4 shadow-soft"
                >
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-orange" />
                  <p className="text-sm font-medium leading-relaxed text-heading">{item}</p>
                </div>
              ))}
            </div>
          </Reveal>
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

function StoryCard({ icon, title, copy }: { icon: ReactNode; title: string; copy: string }) {
  return (
    <div className="rounded-3xl border border-border bg-white p-6 shadow-soft">
      <div className="grid size-11 place-items-center rounded-2xl bg-ieee-tint text-ieee">
        {icon}
      </div>
      <h3 className="mt-5 text-lg font-bold text-heading">{title}</h3>
      <p className="mt-2.5 text-sm leading-relaxed text-body">{copy}</p>
    </div>
  );
}
