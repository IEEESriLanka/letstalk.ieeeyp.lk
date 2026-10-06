import { ArrowRight, GraduationCap, Handshake, Mic, Sparkles, Users } from "lucide-react";
import type { SiteContent } from "@/lib/site-content";
import { defaultSiteContent } from "@/lib/site-content";

export function AboutOverview({
  content,
  stats,
}: {
  content: SiteContent["about"];
  stats?: SiteContent["hero"]["stats"];
}) {
  const displayStats =
    content.stats && content.stats.length > 0
      ? content.stats
      : defaultSiteContent.about.stats!;

  const statIcons = [Mic, Handshake, Users, GraduationCap];

  return (
    <section id="about" aria-labelledby="about-heading" className="relative pt-20 pb-20 lg:pt-28 lg:pb-28">
      {/* Subtle brand ambient accents */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-grid opacity-30 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,black,transparent)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 right-1/4 size-[420px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(0,114,178,0.07),transparent_65%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-10 left-10 size-[360px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,104,21,0.06),transparent_65%)]"
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="flex items-center gap-4 text-xs font-bold tracking-[0.14em] text-body uppercase">
            <span aria-hidden="true" className="h-0.5 w-9 bg-orange" />
            {content.eyebrow}
          </p>
          <h1 id="about-heading" className="mt-5 text-[2.5rem] leading-[1.06] font-bold tracking-tight text-[#06172d] sm:text-5xl xl:text-[3.5rem]">
            Empowering<br />careers through<br />
            <span className="text-gradient-orange">conversations<br />that matter.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-body lg:text-lg">{content.copy}</p>
          <div className="mt-7 flex flex-wrap gap-4">
            <a href="/#events" className="inline-flex items-center justify-center gap-3 rounded-full bg-[image:var(--gradient-orange)] px-7 py-3.5 font-semibold text-white transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange">
              Explore Events <ArrowRight aria-hidden="true" className="size-5" />
            </a>
            <a href="/#contact" className="inline-flex items-center justify-center gap-3 rounded-full border border-ieee bg-white/50 px-7 py-3.5 font-semibold text-ieee transition hover:bg-ieee-tint focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ieee">
              Collaborate with Us <ArrowRight aria-hidden="true" className="size-5" />
            </a>
          </div>
        </div>

        {/* Right side: 10 Years Impact Showcase - NOT IN BOXES */}
        <div className="flex flex-col justify-center lg:pl-4">
          <div className="inline-flex items-center gap-2 self-start rounded-full border border-orange/30 bg-orange-tint px-3.5 py-1.5 text-xs font-bold tracking-wider text-orange uppercase">
            <Sparkles className="size-3.5" />
            <span>{content.yearsOfImpact ?? "10 Years of Impact"}</span>
          </div>

          <h2 className="mt-4 text-2xl font-bold tracking-tight text-[#06172d] sm:text-3xl lg:text-[2.15rem] lg:leading-[1.18]">
            A decade of connecting future professionals with industry leaders.
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-body sm:text-base">
            Over ten years of continuous growth, IEEE LETs Talk has brought together undergraduates, seasoned practitioners, and corporate partners to ignite careers and inspire technical leadership across Sri Lanka.
          </p>

          <dl className="mt-8 grid grid-cols-2 gap-x-8 gap-y-7 border-t border-border/70 pt-7 sm:gap-x-12 sm:gap-y-8">
            {displayStats.map((stat, index) => {
              const Icon = statIcons[index % statIcons.length];
              const isWarm = index % 2 === 0;
              const match = stat.value.match(/^([^+-]+)(.*)$/);
              const numPart = match ? match[1] : stat.value;
              const suffixPart = match ? match[2] : "";

              return (
                <div key={stat.label} className="group">
                  <dd className="flex items-baseline text-3xl font-extrabold tracking-tight text-[#06172d] sm:text-4xl lg:text-[2.65rem]">
                    <span>{numPart}</span>
                    {suffixPart ? <span className="text-orange">{suffixPart}</span> : null}
                  </dd>
                  <dt className="mt-1.5 flex items-center gap-2 text-sm font-bold text-[#06172d] sm:text-base">
                    <Icon className={`size-4 shrink-0 ${isWarm ? "text-orange" : "text-ieee"}`} aria-hidden="true" />
                    <span>{stat.label}</span>
                  </dt>
                  {stat.description ? (
                    <p className="mt-0.5 text-xs text-body leading-relaxed">
                      {stat.description}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </dl>
        </div>
      </div>
    </section>
  );
}
