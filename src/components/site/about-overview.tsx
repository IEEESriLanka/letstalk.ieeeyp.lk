import { ArrowRight, CalendarDays, ChartNoAxesColumnIncreasing, Users } from "lucide-react";
import type { SiteContent } from "@/lib/site-content";

export function AboutOverview({ content, stats }: { content: SiteContent["about"]; stats: SiteContent["hero"]["stats"] }) {
  const icons = [CalendarDays, Users, ChartNoAxesColumnIncreasing];

  return (
    <section id="about" aria-labelledby="about-heading" className="relative pt-32 pb-20 lg:pt-40 lg:pb-28">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:gap-16">
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
        <div className="rounded-[2rem] border border-white bg-white/85 p-5 shadow-[0_8px_40px_-12px_#00629b20] sm:p-8">
          <div className="inline-flex items-center gap-3 rounded-2xl bg-[#f3f9fd] px-4 py-3 text-sm font-semibold text-[#002855] shadow-sm sm:text-base">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-orange-tint text-orange"><Users aria-hidden="true" className="size-6" /></span>
            IEEE Young Professionals Sri Lanka
          </div>
          <dl className="mt-8 grid grid-cols-3 gap-2 sm:gap-5">
            {stats.slice(0, 3).map((stat, index) => {
              const Icon = icons[index];
              return (
                <div key={stat.label} className={`flex flex-col items-center rounded-2xl px-2 py-6 text-center sm:px-4 sm:py-7 ${index === 1 ? "bg-[#fff8f2]" : "bg-[#f3f9fd]"}`}>
                  <span className={`mb-4 grid size-12 place-items-center rounded-full ${index === 1 ? "bg-orange-tint text-orange" : "bg-[#e4f3ff] text-ieee"}`}><Icon aria-hidden="true" className="size-6" /></span>
                  <dd className={`order-1 text-2xl font-bold tracking-tight sm:text-4xl ${index === 1 ? "text-[#002855]" : "text-ieee"}`}>{stat.value}</dd>
                  <dt className="order-2 mt-2 text-sm leading-snug text-body sm:text-lg">{stat.label}</dt>
                </div>
              );
            })}
          </dl>
        </div>
      </div>
    </section>
  );
}
