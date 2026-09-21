import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { ArrowRight, CalendarDays, Linkedin, Mail, Sparkles, Star, UsersRound } from "lucide-react";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteNav } from "@/components/site/site-nav";
import { Reveal, RevealGroup, fadeUp } from "@/components/site/motion-primitives";
import { getSiteContent } from "@/lib/content-actions";
import { defaultSiteContent, getYearTeams } from "@/lib/site-content";
import galleryOne from "@/assets/gallery-1.jpg";
import galleryThree from "@/assets/gallery-3.jpg";

export const Route = createFileRoute("/team")({
  head: () => ({
    meta: [
      { title: "Team | IEEE LETs Talk" },
      {
        name: "description",
        content:
          "Meet the IEEE LETs Talk team and the past members who helped shape the national project.",
      },
    ],
  }),
  component: TeamPage,
});

function TeamPage() {
  const [selectedYear, setYear] = useState<string | null>(null);
  const { data: content = defaultSiteContent } = useQuery({
    queryKey: ["site-content"],
    queryFn: () => getSiteContent(),
  });
  const teamPage = content.teamPage ?? defaultSiteContent.teamPage!;
  const teams = getYearTeams(teamPage);
  const years = [...new Set(teams.map((team) => team.year))].sort().reverse();
  const latestYear = years[0] ?? String(new Date().getFullYear());
  const year = selectedYear ?? latestYear;
  const currentMembers = teams.find((team) => team.year === year)?.members ?? [];
  const pastTeams = teams.filter((team) => team.year < latestYear).sort((a, b) => b.year.localeCompare(a.year));

  return (
    <main id="top" className="min-h-screen overflow-hidden bg-background text-body">
      <SiteNav />

      <section className="relative overflow-hidden bg-ieee-deep pt-32 pb-20 text-white lg:pt-40 lg:pb-28">
        <img
          src={galleryThree}
          alt=""
          className="absolute inset-0 size-full object-cover opacity-24"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(115deg,color-mix(in_oklab,var(--ieee-deep)_96%,transparent),color-mix(in_oklab,var(--ieee-deep)_78%,transparent)_54%,color-mix(in_oklab,var(--orange)_44%,transparent))]"
        />
        <div aria-hidden className="absolute inset-0 bg-grid opacity-20" />

        <div className="relative mx-auto grid max-w-6xl gap-12 px-5 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-orange/40 bg-orange/15 px-4 py-1.5 text-xs font-semibold text-orange">
              <UsersRound className="size-3.5" />
              {teamPage.eyebrow}
            </span>
            <h1 className="mt-6 max-w-3xl text-4xl leading-[1.05] font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              {teamPage.title} <span className="text-orange-soft">{teamPage.highlightedTitle}</span>.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
              {teamPage.description}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#current-team"
                className="inline-flex items-center gap-2 rounded-full bg-[image:var(--gradient-orange)] px-6 py-3 text-sm font-semibold text-white shadow-glow transition-transform duration-300 hover:-translate-y-0.5"
              >
                View members
                <ArrowRight className="size-4" />
              </a>
              <a
                href="#past-members"
                className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/20"
              >
                Past teams
                <CalendarDays className="size-4" />
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <TeamMetric value={String(currentMembers.length)} label={year + " members"} />
              <TeamMetric value={String(pastTeams.length)} label="Past years" />
              <TeamMetric value="1" label="National project" />
            </div>
          </Reveal>
        </div>
      </section>

      <section id="current-team" className="scroll-mt-24 bg-background py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-5">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="section-eyebrow">Our Committee</span>
            <h2 className="mt-5 text-3xl leading-tight font-bold text-heading sm:text-4xl">
              Meet the {year} team.
            </h2>
          </Reveal>

          <div role="group" aria-label="Team year" className="mt-8 flex flex-wrap justify-center gap-2">
            {years.map((value) => <button key={value} type="button" aria-pressed={year === value}
              onClick={() => setYear(value)} className={`rounded-md px-5 py-3 text-sm font-bold ${year === value ? "bg-orange text-white" : "bg-ieee-tint text-ieee"}`}>{value}</button>)}
          </div>
          {currentMembers.length === 0 && <p role="status" className="mt-12 text-center">No team members published for {year} yet.</p>}
          <RevealGroup key={year} className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {currentMembers.map((member, index) => (
              <motion.article
                key={member.name}
                variants={fadeUp}
                className="group overflow-hidden rounded-3xl border border-border bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-orange/35 hover:shadow-lift"
              >
                <div className="relative grid aspect-[4/3] place-items-center overflow-hidden bg-ieee-tint">
                  {member.imageUrl ? (
                    <img
                      src={member.imageUrl}
                      alt={member.name}
                      className="absolute inset-0 size-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <>
                      <div
                        aria-hidden
                        className="absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(255,255,255,0.9),transparent_32%),linear-gradient(135deg,color-mix(in_oklab,var(--ieee)_20%,white),color-mix(in_oklab,var(--orange)_20%,white))]"
                      />
                      <span className="relative grid size-20 place-items-center rounded-full border border-white/70 bg-white/80 font-display text-2xl font-bold text-ieee shadow-soft backdrop-blur-md">
                        {member.initials}
                      </span>
                    </>
                  )}
                  <span className="absolute top-4 right-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-orange shadow-soft">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="p-5">
                  <p className="text-xs font-bold tracking-[0.16em] text-orange uppercase">
                    {member.track}
                  </p>
                  <h3 className="mt-2 text-lg font-bold text-heading">{member.name}</h3>
                  <p className="mt-1 text-sm font-semibold text-ieee">{member.role}</p>
                  <div className="mt-5 flex gap-2">
                    {member.linkedinUrl && /^https:\/\/([a-z0-9-]+\.)*linkedin\.com\//i.test(member.linkedinUrl) && <a
                      href={member.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${member.name} LinkedIn`}
                      className="grid size-9 place-items-center rounded-full border border-border text-body transition-colors hover:border-ieee hover:text-ieee"
                    >
                      <Linkedin className="size-4" />
                    </a>}
                    {member.email && <a
                      href={member.email ? `mailto:${member.email}` : "#contact"}
                      aria-label={`${member.name} email`}
                      className="grid size-9 place-items-center rounded-full border border-border text-body transition-colors hover:border-orange hover:text-orange"
                    >
                      <Mail className="size-4" />
                    </a>}
                  </div>
                </div>
              </motion.article>
            ))}
          </RevealGroup>
        </div>
      </section>

      <section className="relative overflow-hidden bg-ieee-tint py-20 lg:py-28">
        <div aria-hidden className="absolute inset-0 bg-grid opacity-50" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <Reveal>
            <img
              src={galleryOne}
              alt="IEEE LETs Talk team event"
              className="aspect-[5/4] w-full rounded-3xl object-cover shadow-lift"
            />
          </Reveal>
          <Reveal delay={0.1}>
            <span className="section-eyebrow">How We Work</span>
            <h2 className="mt-5 text-3xl leading-tight font-bold text-heading sm:text-4xl">
              A team structure built around clear responsibilities.
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {teamPage.workAreas.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-border bg-white p-5 shadow-soft"
                >
                  <Sparkles className="size-5 text-orange" />
                  <p className="mt-3 text-sm font-bold text-heading">{item}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section id="past-members" className="bg-background py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-5">
          <Reveal className="max-w-2xl">
            <span className="section-eyebrow">Past Members</span>
            <h2 className="mt-5 text-3xl leading-tight font-bold text-heading sm:text-4xl">
              Honoring our past teams.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-body">
              Each year added a new layer to the LETs Talk journey through planning, delivery, and
              volunteer leadership.
            </p>
          </Reveal>

          <div className="mt-10 flex flex-wrap gap-3">
            {pastTeams.map((team) => (
              <a key={team.year} href="#current-team" onClick={() => setYear(team.year)}
                className="rounded-md border border-border px-5 py-3 font-semibold text-ieee">
                {team.year} team ({team.members.length})
              </a>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="bg-ieee-deep py-16 text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-5 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <div>
            <p className="text-xs font-bold tracking-[0.18em] text-orange uppercase">
              Join the story
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
              Want to collaborate with the LETs Talk team?
            </h2>
          </div>
          <a
            href="/#contact"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[image:var(--gradient-orange)] px-6 py-3 text-sm font-semibold text-white shadow-glow transition-transform duration-300 hover:-translate-y-0.5"
          >
            Contact us
            <ArrowRight className="size-4" />
          </a>
        </div>
      </section>

      <SiteFooter email={content.contact.email} />
    </main>
  );
}

function TeamMetric({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-2xl bg-white/95 text-orange">
          <Star className="size-5" />
        </span>
        <div>
          <p className="text-3xl font-bold text-white">{value}</p>
          <p className="text-xs font-semibold text-white/70">{label}</p>
        </div>
      </div>
    </div>
  );
}
