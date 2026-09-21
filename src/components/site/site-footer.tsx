import { Linkedin, Twitter, Instagram, Youtube, Mail, MessageCircle } from "lucide-react";
import letsTalkLogo from "@/assets/lets-talk-logo.png";

const groups = [
  {
    title: "Initiatives",
    links: [
      { label: "Road to Ignite", href: "/#journey" },
      { label: "Upskill Series", href: "/#journey" },
      { label: "Creative Sri Lanka", href: "/#journey" },
      { label: "Workshop Series", href: "/#journey" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "Upcoming Events", href: "/#events" },
      { label: "Awards & Recognition", href: "/#awards" },
      { label: "WhatsApp Channel", href: "/#whatsapp" },
      { label: "YPSL Summit", href: "/#journey" },
    ],
  },
  {
    title: "Connect",
    links: [
      { label: "About LETs Talk", href: "/about-us" },
      { label: "Meet the Team", href: "/team" },
      { label: "Photo Gallery", href: "/#gallery" },
      { label: "Get in Touch", href: "/#contact" },
    ],
  },
];

export function SiteFooter({ email = "contact@ieeeyp.lk" }: { email?: string }) {
  return (
    <footer className="relative overflow-hidden bg-ieee-deep text-white/70">
      <div
        aria-hidden
        className="absolute -top-32 left-1/4 size-[420px] rounded-full bg-[color-mix(in_oklab,var(--orange)_18%,transparent)] blur-[130px]"
      />
      <div className="relative mx-auto max-w-6xl px-5 py-16">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_repeat(3,1fr)]">
          <div>
            <div className="flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-xl border border-white/20 bg-white/95 p-1.5 shadow-sm">
                <img
                  src={letsTalkLogo}
                  alt="IEEE LETs talk logo"
                  className="size-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-base font-bold text-white">IEEE LETs talk</span>
                <span className="text-[0.65rem] text-white/60">
                  National project — IEEE Young Professionals Sri Lanka
                </span>
              </div>
            </div>
            <p className="mt-5 max-w-xs text-sm leading-relaxed">
              Where Future Professionals Meet Industry Leaders. Empowering careers through
              conversations, learning, and leadership since 2017.
            </p>
            <div className="mt-6 flex gap-2">
              {[
                { icon: MessageCircle, href: "#whatsapp", label: "WhatsApp" },
                { icon: Linkedin, href: "#contact", label: "LinkedIn" },
                { icon: Twitter, href: "#contact", label: "Twitter" },
                { icon: Instagram, href: "#contact", label: "Instagram" },
                { icon: Youtube, href: "#contact", label: "YouTube" },
                { icon: Mail, href: `mailto:${email}`, label: "Email" },
              ].map(({ icon: Icon, href, label }, i) => (
                <a
                  key={i}
                  href={href}
                  aria-label={label}
                  className="grid size-9 place-items-center rounded-full border border-white/15 text-white/80 transition-colors hover:border-orange hover:text-orange"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {groups.map((g) => (
            <div key={g.title}>
              <h4 className="font-display text-sm font-semibold text-white">{g.title}</h4>
              <ul className="mt-4 space-y-3 text-sm">
                {g.links.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} className="transition-colors hover:text-orange">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-7 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} IEEE LETs talk. IEEE Young Professionals Sri Lanka.</p>
          <p>Advancing Technology for Humanity.</p>
        </div>
      </div>
    </footer>
  );
}
