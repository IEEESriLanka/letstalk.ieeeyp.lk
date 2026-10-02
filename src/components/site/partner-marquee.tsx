import { useState } from "react";
import type { SiteContent } from "@/lib/site-content";
import "./partner-marquee.css";

export function Partners({ logos }: { logos: NonNullable<SiteContent["partnerLogos"]> }) {
  const [paused, setPaused] = useState(false);
  const names = new Set<string>();
  const urls = new Set<string>();
  const uniqueLogos = logos.filter((logo) => {
    const name = logo.name.trim().toLowerCase();
    const url = logo.logoUrl.trim();
    if (names.has(name) || urls.has(url)) return false;
    names.add(name);
    urls.add(url);
    return true;
  });
  if (!uniqueLogos.length) return null;
  const midpoint = Math.ceil(uniqueLogos.length / 2);
  const rows = [uniqueLogos.slice(0, midpoint), uniqueLogos.slice(midpoint)];
  return (
    <section aria-labelledby="partners-heading" className="py-20">
      <div className="px-5 text-center">
        <span className="section-eyebrow">Ecosystem</span>
        <h2 id="partners-heading" className="mt-4 text-3xl font-bold sm:text-4xl">Our partners</h2>
        <p className="mx-auto mt-3 max-w-xl text-body">Collaborating with industry organizations, student branches, and IEEE affinity groups.</p>
        <button type="button" onClick={() => setPaused((value) => !value)} aria-pressed={paused} className="mt-4 rounded-full border border-ieee/20 px-4 py-2 text-xs font-semibold text-ieee">
          {paused ? "Resume logo animation" : "Pause logo animation"}
        </button>
      </div>
      <div className={`partner-marquee mt-10${paused ? " is-paused" : ""}`}>
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className={`partner-track${rowIndex === 1 ? " move-right" : ""}`}>
            {[0, 1].map((copy) => (
              <div className="partner-group" key={copy} aria-hidden={copy === 1 ? true : undefined}>
                {row.map((logo) => <div className="partner-logo" key={logo.logoUrl}><img src={logo.logoUrl} alt={copy === 0 ? logo.name : ""} loading="lazy" /></div>)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
