import type { SiteContent } from "@/lib/site-content";
import "./partner-marquee.css";

const ROW_1_SPEC = [
  "IEEE R10",
  "IEEE YP R10",
  "IFS",
  "IIT",
  "SLTC Uni",
  "Techverse",
  "IEEE SL Section",
];

const ROW_2_SPEC = [
  "NCINGA",
  "Rootcode",
  "Codimite",
  "Ascentic",
  "Short Circuit",
  "Barista",
  "99x",
  "Nagarro",
];

const ROW_3_SPEC = [
  "Octave",
  "WSO2",
  "Zone 24x7",
  "Gapstars",
  "Articom",
  "LSEG",
  "The Makers",
  "Business Agility Tune Up",
];

const FALLBACK_LOGOS: Record<string, string> = {
  "IEEE SL Section":
    "https://eesnqxheovublqojrgcu.supabase.co/storage/v1/object/public/IEEE-logos/ieee-slsection-logo.png",
  "IEEE R10":
    "https://eesnqxheovublqojrgcu.supabase.co/storage/v1/object/public/partner-logos/partners/1a238a92-d26c-4c04-8605-78cafab9c0ab.png",
  "IEEE YP R10":
    "https://eesnqxheovublqojrgcu.supabase.co/storage/v1/object/public/partner-logos/partners/1f1d92db-e28f-4833-90c0-2d4e5ddd174c.png",
  "IFS":
    "https://eesnqxheovublqojrgcu.supabase.co/storage/v1/object/public/partner-logos/partners/d5fbc261-366c-471f-a912-47b2bdba866e.png",
  "IIT":
    "https://eesnqxheovublqojrgcu.supabase.co/storage/v1/object/public/partner-logos/partners/4af4f5e2-4e43-4883-8e87-6a1a35b2110c.png",
  "SLTC Uni":
    "https://eesnqxheovublqojrgcu.supabase.co/storage/v1/object/public/partner-logos/partners/7d003125-34b3-4bc9-8807-b97b554ab76b.png",
  "Techverse":
    "https://eesnqxheovublqojrgcu.supabase.co/storage/v1/object/public/partner-logos/partners/920331f3-5f86-4e26-a54e-5b054c1a1448.png",
  "NCINGA":
    "https://eesnqxheovublqojrgcu.supabase.co/storage/v1/object/public/partner-logos/partners/2d31fa98-a546-466f-bffa-16149d62242a.png",
  "Rootcode":
    "https://eesnqxheovublqojrgcu.supabase.co/storage/v1/object/public/partner-logos/partners/ec21cf05-ef17-46bb-a05c-1fd4ee3c9ad1.png",
  "Codimite":
    "https://eesnqxheovublqojrgcu.supabase.co/storage/v1/object/public/partner-logos/partners/51d4695d-81d5-435f-a20d-9ebf8d9c1fb2.png",
  "Ascentic":
    "https://eesnqxheovublqojrgcu.supabase.co/storage/v1/object/public/partner-logos/partners/dc4ab0e1-35dc-4764-b503-e6f197b9f552.png",
  "Short Circuit":
    "https://eesnqxheovublqojrgcu.supabase.co/storage/v1/object/public/partner-logos/partners/38c6ec38-5ec0-467c-b644-5418eb2fe495.png",
  "Barista":
    "https://eesnqxheovublqojrgcu.supabase.co/storage/v1/object/public/partner-logos/partners/2d24d1e8-58bf-4a64-bc94-91233465d8be.png",
  "99x":
    "https://eesnqxheovublqojrgcu.supabase.co/storage/v1/object/public/partner-logos/partners/e95bbe2f-1290-4220-9c36-597d590016db.png",
  "Nagarro":
    "https://eesnqxheovublqojrgcu.supabase.co/storage/v1/object/public/partner-logos/partners/f2ff7df2-5b6d-410a-aaa6-9185afdcb304.png",
  "Octave":
    "https://eesnqxheovublqojrgcu.supabase.co/storage/v1/object/public/partner-logos/partners/07b8cde2-f549-4ed0-8758-66a2bda10ba6.png",
  "WSO2":
    "https://eesnqxheovublqojrgcu.supabase.co/storage/v1/object/public/partner-logos/partners/2e968155-d59e-49ab-ac1e-3d113ed62acb.png",
  "Zone 24x7":
    "https://eesnqxheovublqojrgcu.supabase.co/storage/v1/object/public/partner-logos/partners/a8eff5f3-a651-437d-8b59-35e1dbb6d7d9.jpeg",
  "Gapstars":
    "https://eesnqxheovublqojrgcu.supabase.co/storage/v1/object/public/partner-logos/partners/3ae558c1-9b7a-4c8b-973b-fd95cd19d388.png",
  "Articom":
    "https://eesnqxheovublqojrgcu.supabase.co/storage/v1/object/public/partner-logos/partners/a7d2c143-3dc9-4e53-909d-6b693f531089.png",
  "LSEG":
    "https://eesnqxheovublqojrgcu.supabase.co/storage/v1/object/public/partner-logos/partners/2bc3001b-17d8-47d3-8e71-7423e8bccc00.jpeg",
  "The Makers":
    "https://eesnqxheovublqojrgcu.supabase.co/storage/v1/object/public/partner-logos/partners/9dd8da95-db90-4219-84d5-9472f882a6e7.png",
  "Business Agility Tune Up":
    "https://eesnqxheovublqojrgcu.supabase.co/storage/v1/object/public/partner-logos/partners/2b806145-c2bf-452c-bea9-c3a658ce9174.jpg",
};

function normalize(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function resolvePartnerRow(
  spec: string[],
  available: Array<{ name: string; logoUrl: string }>,
  matchedUrls: Set<string>,
) {
  return spec
    .map((name) => {
      const norm = normalize(name);
      let match = available.find((item) => normalize(item.name) === norm);
      if (!match && norm === "sltcuni") {
        match = available.find((item) => normalize(item.name).includes("sltc"));
      }
      if (!match && norm === "ieeeslsection") {
        match = available.find(
          (item) =>
            normalize(item.name).includes("slsection") ||
            (normalize(item.name).includes("ieee") && normalize(item.name).includes("section")),
        );
      }
      if (!match) {
        match = available.find((item) => {
          const n = normalize(item.name);
          return n.includes(norm) || norm.includes(n);
        });
      }

      if (match) {
        matchedUrls.add(match.logoUrl);
        return { name, logoUrl: match.logoUrl };
      }

      const fallbackUrl = FALLBACK_LOGOS[name];
      if (fallbackUrl) {
        matchedUrls.add(fallbackUrl);
        return { name, logoUrl: fallbackUrl };
      }

      return null;
    })
    .filter((item): item is { name: string; logoUrl: string } => Boolean(item));
}

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

  const matchedUrls = new Set<string>();
  const row1 = resolvePartnerRow(ROW_1_SPEC, uniqueLogos, matchedUrls);
  const row2 = resolvePartnerRow(ROW_2_SPEC, uniqueLogos, matchedUrls);
  const row3 = resolvePartnerRow(ROW_3_SPEC, uniqueLogos, matchedUrls);

  // Distribute any new or unassigned partners dynamically
  const unassigned = uniqueLogos.filter((item) => !matchedUrls.has(item.logoUrl));
  unassigned.forEach((item, index) => {
    if (index % 3 === 0) row1.push(item);
    else if (index % 3 === 1) row2.push(item);
    else row3.push(item);
  });

  const rows = [row1, row2, row3].filter((row) => row.length > 0);
  if (!rows.length) return null;

  return (
    <section id="partners" aria-labelledby="partners-heading" className="py-20">
      <div className="px-5 text-center">
        <span className="section-eyebrow">Our Network</span>
        <h2 id="partners-heading" className="mt-4 text-3xl font-bold sm:text-4xl">
          Our Partners
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-body">
          Collaborating with industry organizations, student branches, and IEEE affinity groups.
        </p>
      </div>
      <div className="partner-marquee mt-10">
        {rows.map((row, rowIndex) => {
          const displayRow = row.length < 12 ? [...row, ...row] : row;
          return (
            <div
              key={rowIndex}
              className={`partner-track track-${rowIndex}${rowIndex === 1 ? " move-right" : ""}`}
            >
              {[0, 1].map((copy) => (
                <div className="partner-group" key={copy} aria-hidden={copy === 1 ? true : undefined}>
                  {displayRow.map((logo, logoIndex) => (
                    <div className="partner-logo" key={`${logo.logoUrl}-${logoIndex}`}>
                      <img src={logo.logoUrl} alt={copy === 0 ? logo.name : ""} loading="lazy" />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </section>
  );
}
