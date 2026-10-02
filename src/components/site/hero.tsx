import { motion, useReducedMotion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { PhotoBackdrop } from "./photo-backdrop";
import type { SiteContent } from "@/lib/site-content";

export function Hero({ content }: { content: SiteContent["hero"] }) {
  const reduceMotion = useReducedMotion();
  const hasPhotos = Boolean(content.backgroundImages?.length);
  return (
    <section
      id="top"
      aria-labelledby="hero-title"
      className="relative isolate overflow-hidden bg-[#fbfcff] pt-28 pb-24 lg:min-h-svh lg:pt-[clamp(6rem,12svh,8rem)] lg:pb-0"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,#edf4ff,transparent_55%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-36 left-[45%] hidden h-24 w-24 bg-[radial-gradient(#cbd8ea_1.5px,transparent_1.5px)] [background-size:18px_18px] lg:block"
      />
      <div className="relative mx-auto max-w-7xl px-6 sm:px-10 lg:flex lg:min-h-[calc(100svh-clamp(6rem,12svh,8rem))] lg:max-w-none lg:items-center lg:px-[clamp(2rem,6vw,10rem)]">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className={`relative z-10 py-10 sm:py-14 lg:py-[clamp(2rem,5svh,5rem)] ${hasPhotos ? "lg:w-1/2 lg:pr-[clamp(1rem,2vw,3rem)]" : "max-w-3xl"}`}
        >
          <p className="flex items-center gap-4 text-[0.65rem] font-bold tracking-[0.19em] text-[#53658b] uppercase sm:text-xs">
            <span aria-hidden className="h-0.5 w-8 shrink-0 bg-orange" />
            {content.eyebrow}
          </p>
          <h1
            id="hero-title"
            className="mt-6 text-[clamp(2.6rem,4.5vw,4.5rem)] leading-[1.04] font-bold tracking-[-0.045em] text-[#071638] lg:mt-[clamp(1rem,3svh,2rem)] lg:text-[clamp(2.5rem,min(4.3vw,7svh),6rem)]"
          >
            {content.title}{" "}
            <span className="block text-[#ff6815]">
              {content.highlightedTitle.replace(/\.$/, "")}.
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-[#596b8d] sm:text-lg lg:mt-[clamp(1rem,3svh,2rem)] lg:max-w-[38em] lg:text-[clamp(0.9375rem,min(1.1vw,2svh),1.25rem)]">
            {content.description}
          </p>
          <div className="mt-8 flex flex-wrap gap-3 sm:gap-4 lg:mt-[clamp(1.25rem,3.5svh,2.5rem)]">
            <a
              href="/about-us"
              className="inline-flex min-h-14 items-center justify-center gap-4 rounded-2xl bg-[#ff6815] px-6 text-sm font-semibold text-white shadow-[0_8px_24px_-10px_#ff6815] transition-colors hover:bg-[#ed5705] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange sm:text-base"
            >
              About Us <ArrowRight className="size-5" />
            </a>
            <a
              href="/#journey"
              className="inline-flex min-h-14 items-center justify-center gap-4 rounded-2xl border border-[#254d80] bg-white/90 px-6 text-sm font-semibold text-[#102d58] transition-colors hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ieee sm:text-base"
            >
              Explore Our Journey <ArrowRight className="size-5" />
            </a>
          </div>
        </motion.div>
      </div>
      {hasPhotos && (
        <div className="relative h-[360px] sm:h-[460px] lg:absolute lg:top-[clamp(6rem,12svh,8rem)] lg:right-0 lg:bottom-0 lg:h-auto lg:w-[51%]">
          <div className="absolute inset-0 [mask-image:linear-gradient(to_bottom,black_0%,black_calc(100%_-_120px),transparent_100%)]">
            <div className="absolute inset-0 lg:[clip-path:polygon(30%_0,100%_0,100%_100%,0_100%)] lg:[mask-image:radial-gradient(ellipse_80%_75%_at_0%_100%,transparent_0%,transparent_25%,black_80%)]">
              <PhotoBackdrop images={content.backgroundImages} />
            </div>
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute -top-2 left-[22%] hidden h-24 w-10 skew-x-[-26deg] rounded-xl bg-gradient-to-b from-[#ff9954] to-[#ff6815] lg:block"
          />
          <svg
            aria-hidden="true"
            viewBox="0 0 1000 120"
            preserveAspectRatio="none"
            fill="none"
            className="pointer-events-none absolute right-0 bottom-0 h-24 w-full sm:h-28"
          >
            <path d="M180 102C430 102 610 28 970 28" stroke="#0879E8" strokeOpacity="0.12" strokeWidth="1" />
            <path d="M390 108C610 108 730 51 1000 51" stroke="#003B6F" strokeOpacity="0.08" strokeWidth="1" />
            <path d="M770 37C811 33 851 30 890 29" stroke="#FF6B00" strokeOpacity="0.65" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>
      )}
      <a
        href="#events"
        aria-label="Scroll down to explore events"
        onClick={(event) => {
          const section = document.getElementById("events");
          if (section) {
            event.preventDefault();
            section.scrollIntoView({ behavior: reduceMotion ? "instant" : "smooth", block: "start" });
          }
        }}
        className="absolute bottom-6 left-1/2 z-20 flex h-16 w-12 -translate-x-1/2 items-center justify-center rounded-full text-[#222] transition-colors hover:text-orange focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ieee"
      >
        <span aria-hidden="true" className="relative block h-7 w-4 rounded-full border-[1.5px] border-current">
          <motion.span
            className="absolute top-1 left-1/2 size-[3px] -translate-x-1/2 rounded-full bg-current"
            animate={reduceMotion ? { y: 9, opacity: 1 } : { y: [0, 0, 10, 10], opacity: [0, 1, 1, 0] }}
            transition={reduceMotion ? { duration: 0 } : { duration: 1.8, times: [0, 0.15, 0.8, 1], repeat: Infinity, repeatDelay: 0.25, ease: "easeInOut" }}
          />
        </span>
      </a>
    </section>
  );
}
