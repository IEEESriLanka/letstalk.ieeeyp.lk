import { ArrowRight, GraduationCap, Handshake, Mic, Sparkles, Users } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import type { SiteContent } from "@/lib/site-content";
import { defaultSiteContent } from "@/lib/site-content";

export function AboutOverview({
  content,
}: {
  content: SiteContent["about"];
}) {
  const reduceMotion = useReducedMotion();

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

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-10">
        <div className="max-w-3xl">
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
        <div className="relative hidden min-h-[460px] lg:block" aria-label="LETs Talk connection network">
          <svg
            aria-hidden="true"
            viewBox="0 0 620 460"
            className="absolute inset-0 h-full w-full overflow-visible"
            fill="none"
          >
            <motion.path
              d="M115 92C210 92 214 172 310 172S420 92 520 92"
              stroke="#ff6815"
              strokeOpacity="0.55"
              strokeWidth="1.5"
              initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
              whileInView={reduceMotion ? undefined : { pathLength: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2 }}
            />
            <motion.path
              d="M95 350C205 350 210 275 310 275s130 75 230 75"
              stroke="#0879e8"
              strokeOpacity="0.45"
              strokeWidth="1.5"
              initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
              whileInView={reduceMotion ? undefined : { pathLength: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: 0.15 }}
            />
            <circle cx="310" cy="226" r="126" stroke="#ff6815" strokeOpacity="0.24" />
            <circle cx="310" cy="226" r="98" stroke="#0879e8" strokeOpacity="0.2" />
            <circle cx="310" cy="226" r="66" fill="white" stroke="#ff6815" strokeOpacity="0.3" />
          </svg>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, scale: 0.8 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="absolute top-1/2 left-1/2 z-10 flex size-32 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 px-5 text-center text-sm font-bold leading-snug text-[#102d58] shadow-[0_10px_35px_-18px_rgba(7,22,56,0.55)]"
          >
            Conversations that create <span className="text-orange">opportunities</span>
          </motion.div>

          {[
            { label: "Students & Graduates", position: "top-10 left-0", tone: "orange" },
            { label: "Industry Experts", position: "top-16 right-0", tone: "blue" },
            { label: "Meaningful Connections", position: "bottom-16 left-0", tone: "orange" },
            { label: "Career Growth", position: "right-8 bottom-10", tone: "blue" },
          ].map((item, index) => (
            <motion.div
              key={item.label}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.25 + index * 0.1 }}
              className={`absolute ${item.position} z-10 flex max-w-[170px] items-center gap-3 rounded-full border bg-white/90 px-4 py-3 text-xs font-bold text-[#102d58] shadow-[0_8px_25px_-18px_rgba(7,22,56,0.6)] ${
                item.tone === "orange" ? "border-orange/40" : "border-ieee/30"
              }`}
            >
              <span className={`size-3 shrink-0 rounded-full ${item.tone === "orange" ? "bg-orange" : "bg-ieee"}`} />
              {item.label}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ImpactOverview({ content }: { content: SiteContent["about"] }) {
  const reduceMotion = useReducedMotion();
  const displayStats =
    content.stats && content.stats.length > 0
      ? content.stats
      : defaultSiteContent.about.stats!;
  const statIcons = [Mic, Handshake, Users, GraduationCap];

  return (
    <section id="impact" aria-labelledby="impact-heading" className="relative overflow-hidden py-20 lg:py-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-grid opacity-30 [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,black,transparent)]"
      />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-orange/30 bg-orange-tint px-3.5 py-1.5 text-xs font-bold tracking-wider text-orange uppercase">
            <Sparkles className="size-3.5" />
            <span>{content.yearsOfImpact ?? "10 Years of Impact"}</span>
          </div>
          <h2 id="impact-heading" className="mt-5 max-w-3xl text-3xl font-bold tracking-tight text-[#06172d] sm:text-4xl lg:text-5xl">
            A decade of connecting future professionals with industry leaders.
          </h2>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-body sm:text-lg">
            Over ten years of continuous growth, IEEE LETs Talk has brought together undergraduates,
            seasoned practitioners, and corporate partners to ignite careers and inspire technical
            leadership across Sri Lanka.
          </p>
          <dl className="mt-9 grid gap-4 border-t border-border/70 pt-7 sm:grid-cols-2 lg:grid-cols-4 lg:gap-3">
            {displayStats.map((stat, index) => {
              const Icon = statIcons[index % statIcons.length];
              const match = stat.value.match(/^([^+-]+)(.*)$/);
              const numPart = match ? match[1] : stat.value;
              const suffixPart = match ? match[2] : "";
              const filled = index % 2 === 1;

              return (
                <motion.div
                  key={stat.label}
                  initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.97 }}
                  whileInView={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{
                    duration: 0.55,
                    delay: index * 0.1,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className={`group flex min-h-[104px] items-center gap-3 rounded-3xl px-5 py-4 shadow-[0_12px_25px_-18px_rgba(7,22,56,0.55)] transition-transform duration-300 hover:-translate-y-1 ${
                    filled
                      ? "bg-[#ff6815] text-white"
                      : "border border-[#ff6815]/70 bg-white/80 text-[#102d58]"
                  }`}
                >
                  <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${filled ? "bg-white/15 text-white" : "bg-orange-tint text-orange"}`}>
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <dd className="text-2xl leading-none font-extrabold tracking-tight">
                      {numPart}
                      {suffixPart ? <span className={filled ? "text-white/80" : "text-orange"}>{suffixPart}</span> : null}
                    </dd>
                    <dt className={`mt-1 block text-[0.65rem] font-bold tracking-[0.08em] uppercase ${filled ? "text-white/80" : "text-[#53658b]"}`}>
                      {stat.label}
                    </dt>
                  </span>
                </motion.div>
              );
            })}
          </dl>
        </div>
      </div>
    </section>
  );
}
