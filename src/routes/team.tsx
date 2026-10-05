import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { ArrowRight, Linkedin, Mail } from "lucide-react";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteNav } from "@/components/site/site-nav";
import { Reveal, RevealGroup, fadeUp } from "@/components/site/motion-primitives";
import { getSiteContent } from "@/lib/content-actions";
import { defaultSiteContent, getYearTeams } from "@/lib/site-content";

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
  const currentMembers = [...(teams.find((team) => team.year === year)?.members ?? [])].sort((a, b) => {
    const roleRank = (role: string) => {
      const normalized = role.toLowerCase();
      if (normalized.includes("vice chair")) return 2;
      if (normalized.includes("chair")) return 0;
      if (normalized.includes("secretary")) return 1;
      if (normalized.includes("coordinator")) return 3;
      return 4;
    };
    return roleRank(a.role) - roleRank(b.role);
  });
  const leadership = currentMembers.filter((member) => /chair|secretary/i.test(member.role) && !/vice chair/i.test(member.role));
  const coLeaders = currentMembers.filter((member) => /vice chair/i.test(member.role));
  const otherMembers = currentMembers.filter((member) => !leadership.includes(member) && !coLeaders.includes(member));
  const memberRows = [leadership, coLeaders, otherMembers].filter((row) => row.length > 0);
  const pastTeams = teams
    .filter((team) => team.year < latestYear)
    .sort((a, b) => b.year.localeCompare(a.year));

  return (
    <main id="top" className="min-h-screen overflow-hidden bg-background text-body">
      <SiteNav />

      <section
        id="current-team"
        className="relative scroll-mt-24 overflow-hidden bg-background py-20 lg:py-28"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 -right-32 size-96 rounded-full bg-orange/5 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-32 size-96 rounded-full bg-ieee/5 blur-3xl"
        />
        <div className="relative mx-auto max-w-6xl px-5">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="section-eyebrow">Our Committee</span>
            <h2 className="mt-5 text-3xl leading-tight font-bold text-heading sm:text-4xl">
              Meet the {year} team.
            </h2>
          </Reveal>

          <div className="mt-8 flex justify-center">
            <div
              role="group"
              aria-label="Team year"
              className="inline-flex flex-wrap items-center justify-center gap-3 p-2 rounded-3xl bg-slate-100/80 border border-white/80 shadow-[inset_0_2px_4px_rgba(15,23,42,0.06),0_8px_24px_-6px_rgba(15,23,42,0.06)] backdrop-blur-lg"
            >
              {years.map((value) => {
                const isActive = year === value;
                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setYear(value)}
                    className={`group relative inline-flex items-center gap-2.5 rounded-2xl px-6 sm:px-7 py-3 text-sm font-bold transition-all duration-200 active:translate-y-0.5 active:border-b-[2px] ${
                      isActive
                        ? "border border-white/40 border-t-2 border-t-white/60 border-b-[4px] border-b-[#b83d00] bg-gradient-to-b from-[#ff7e14] via-[#ff6815] to-[#e65300] text-white shadow-[0_10px_22px_-4px_rgba(255,115,0,0.5),0_4px_8px_-2px_rgba(255,115,0,0.3),inset_0_1.5px_0_0_rgba(255,255,255,0.5)]"
                        : "border border-white/90 border-t-2 border-t-white border-b-[4px] border-b-slate-300 bg-white/90 text-slate-700 shadow-[0_4px_12px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,1)] hover:-translate-y-1 hover:border-b-[5px] hover:border-b-ieee hover:text-ieee hover:shadow-[0_10px_20px_-4px_rgba(0,98,155,0.25)]"
                    }`}
                  >
                    {isActive && (
                      <span className="relative flex size-2">
                        <span className="absolute inline-flex size-full animate-ping rounded-full bg-white opacity-75" />
                        <span className="relative inline-flex size-2 rounded-full bg-white shadow-[0_0_6px_#ffffff]" />
                      </span>
                    )}
                    <span
                      className={`font-display text-base sm:text-lg font-extrabold tracking-tight ${
                        isActive
                          ? "drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)] text-white"
                          : "text-heading group-hover:text-ieee transition-colors"
                      }`}
                    >
                      {value}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          {currentMembers.length === 0 && (
            <p role="status" className="mt-12 text-center">
              No team members published for {year} yet.
            </p>
          )}
          <div className="mt-14 space-y-8">
          {memberRows.map((row, rowIndex) => <RevealGroup key={`${year}-${rowIndex}`} className={`mx-auto grid w-full gap-5 ${rowIndex === 0 ? "max-w-2xl grid-cols-2" : rowIndex === 1 ? "max-w-5xl grid-cols-1 sm:grid-cols-3" : "max-w-6xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"}`}>
            {row.map((member) => (
              <motion.article
                key={member.name}
                variants={fadeUp}
                className="group relative min-w-0 overflow-hidden rounded-3xl border border-white/80 border-b-[5px] border-b-slate-300/80 bg-white/70 shadow-[0_12px_30px_-6px_rgba(15,23,42,0.08),0_4px_8px_-2px_rgba(15,23,42,0.04),inset_0_1px_1px_0_rgba(255,255,255,0.95)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-b-[5px] hover:border-b-orange hover:bg-white/85 hover:shadow-[0_24px_42px_-6px_rgba(255,115,0,0.24),0_10px_16px_-4px_rgba(15,23,42,0.06),inset_0_1px_1px_0_rgba(255,255,255,1)]"
              >
                {/* Border Beam: Bold, radiant light line along the edge on hover */}
                <div
                  aria-hidden
                  className="border-beam-line opacity-0 transition-opacity duration-300 group-hover:opacity-100 z-30"
                >
                  <div
                    className="animate-border-beam absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350%] aspect-square"
                    style={{
                      background:
                        "conic-gradient(from 0deg, transparent 0deg, transparent 230deg, rgba(255,115,0,0.35) 265deg, #ff6b00 310deg, #ff9e3b 340deg, #ffffff 354deg, transparent 360deg)",
                      filter: "drop-shadow(0 0 8px #ff7300) drop-shadow(0 0 16px rgba(255, 115, 0, 0.95))",
                    }}
                  />
                </div>

                <div className="relative grid aspect-[4/5] place-items-center overflow-hidden bg-slate-100/60">
                  {member.imageUrl ? (
                    <>
                      <img
                        src={member.imageUrl}
                        alt={member.name}
                        className="absolute inset-0 size-full object-cover transition-transform duration-500 will-change-transform group-hover:scale-105"
                        style={{ objectPosition: member.imagePosition || "center 18%" }}
                        loading="lazy"
                      />
                      <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      />
                    </>
                  ) : (
                    <>
                      <div
                        aria-hidden
                        className="absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(255,255,255,0.9),transparent_32%),linear-gradient(135deg,color-mix(in_oklab,var(--ieee)_20%,white),color-mix(in_oklab,var(--orange)_20%,white))]"
                      />
                      <span className="relative grid size-20 place-items-center rounded-full border border-white/80 bg-white/70 font-display text-2xl font-bold text-ieee shadow-soft backdrop-blur-md">
                        {member.initials}
                      </span>
                    </>
                  )}
                </div>
                <div className="border-t border-white/60 bg-gradient-to-b from-white/80 via-white/60 to-white/70 p-5 backdrop-blur-lg shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9)]">
                  <h3 className="text-lg font-bold text-heading tracking-tight">{member.name}</h3>
                  <p className="mt-1 text-sm font-semibold text-ieee">{member.role}</p>
                  <div className="mt-5 flex gap-2">
                    {member.linkedinUrl &&
                      /^https?:\/\/([a-z0-9-]+\.)*linkedin\.com\//i.test(member.linkedinUrl) && (
                        <a
                          href={member.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${member.name} LinkedIn`}
                          className="grid size-9 place-items-center rounded-full border border-white/80 border-b-2 border-b-slate-300/80 bg-white/80 text-body shadow-xs backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-ieee hover:border-b-ieee hover:text-ieee hover:shadow-sm active:translate-y-0 active:border-b"
                        >
                          <Linkedin className="size-4" />
                        </a>
                      )}
                    {member.email && (
                      <a
                        href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(member.email)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Email ${member.name} via Gmail`}
                        className="grid size-9 place-items-center rounded-full border border-white/80 border-b-2 border-b-slate-300/80 bg-white/80 text-body shadow-xs backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-orange hover:border-b-orange hover:text-orange hover:shadow-sm active:translate-y-0 active:border-b"
                      >
                        <Mail className="size-4" />
                      </a>
                    )}
                  </div>
                </div>
              </motion.article>
            ))}
          </RevealGroup>)}
          </div>
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
              <a
                key={team.year}
                href="#current-team"
                onClick={() => setYear(team.year)}
                className="group inline-flex items-center gap-2.5 rounded-2xl border border-white/90 border-t-2 border-t-white border-b-[4px] border-b-slate-300 bg-white/90 px-5 py-3 font-semibold text-slate-700 shadow-[0_4px_12px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,1)] backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:border-b-[5px] hover:border-b-ieee hover:text-ieee hover:shadow-[0_10px_20px_-4px_rgba(0,98,155,0.25)] active:translate-y-0.5 active:border-b-[2px]"
              >
                <span className="font-display text-base font-extrabold text-heading transition-colors group-hover:text-ieee">
                  {team.year}
                </span>
                <span className="rounded-full bg-slate-100 border border-slate-200/80 px-2 py-0.5 font-mono text-xs font-bold text-slate-500 transition-colors group-hover:border-ieee/30 group-hover:bg-ieee-tint group-hover:text-ieee">
                  {team.members.length} members
                </span>
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
