import type { SiteContent } from "@/lib/site-content";
import "./partner-marquee.css";

export function Partners({ logos }: { logos: NonNullable<SiteContent["partnerLogos"]> }) {
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
      </div>
      <div className="partner-marquee mt-10">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="partner-track">
            {row.map((logo) => <div className="partner-logo" key={logo.logoUrl}><img src={logo.logoUrl} alt={logo.name} loading="lazy" /></div>)}
          </div>
        ))}
      </div>
    </section>
  );
}
