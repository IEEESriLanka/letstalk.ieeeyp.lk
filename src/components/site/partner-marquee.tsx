import { useState } from "react";
import type { SiteContent } from "@/lib/site-content";
import "./partner-marquee.css";

export function Partners({ logos }: { logos: NonNullable<SiteContent["partnerLogos"]> }) {
  const [paused, setPaused] = useState(false);
  if (!logos.length) return null;
  const rows = Array.from({ length: 3 }, (_, row) => {
    const items = logos.filter((_, index) => index % 3 === row);
    const source = items.length ? items : logos;
    return Array.from({ length: Math.max(8, source.length) }, (_, index) => source[index % source.length]);
  });
  return (
    <section aria-labelledby="partners-heading" className="py-20">
      <div className="px-5 text-center">
        <span className="section-eyebrow">Ecosystem</span>
        <h2 id="partners-heading" className="mt-4 text-3xl font-bold sm:text-4xl">Our partners</h2>
        <p className="mx-auto mt-3 max-w-xl text-body">Collaborating with industry organizations, student branches, and IEEE affinity groups.</p>
        <button type="button" onClick={() => setPaused(!paused)} aria-pressed={paused} className="mt-4 rounded-full border border-ieee/20 px-4 py-2 text-xs font-semibold text-ieee">{paused ? "Resume logo animation" : "Pause logo animation"}</button>
      </div>
      <div className={`partner-marquee mt-10 ${paused ? "is-paused" : ""}`}>
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className={`partner-track ${rowIndex === 1 ? "move-left" : "move-right"}`}>
            {[0, 1].map((copy) => (
              <div className="partner-group" key={copy} aria-hidden={copy === 1 ? true : undefined}>
                {row.map((logo, index) => <div className="partner-logo" key={`${logo.logoUrl}-${index}`}><img src={logo.logoUrl} alt={copy === 0 ? logo.name : ""} loading="lazy" /></div>)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
