import { Linkedin, Instagram, Youtube, Mail } from "lucide-react";
import letsTalkLogo from "@/assets/lets-talk-logo.png";

const groups: Array<{
  title: string;
  links: Array<{ label: string; href: string; external?: boolean }>;
}> = [
  {
    title: "Useful Links",
    links: [
      { label: "Home", href: "/" },
      { label: "About Us", href: "/about-us" },
      { label: "Team", href: "/team" },
      { label: "Event Timeline", href: "/#journey" },
      { label: "Partners", href: "/#partners" },
    ],
  },
  {
    title: "National Projects",
    links: [
      { label: "StudPro", href: "https://studpro.ieeeyp.lk/", external: true },
      { label: "SL Inspire", href: "https://slinspire.lk/", external: true },
      { label: "AIDSL", href: "https://aidriven.ieeeyp.lk/", external: true },
      { label: "Y2NPro", href: "https://y2npro.ieeeyp.lk/", external: true },
      { label: "INSL", href: "https://insl.ieeeyp.lk/", external: true },
    ],
  },
  {
    title: "IEEE Links",
    links: [
      { label: "IEEE", href: "https://www.ieee.org/", external: true },
      { label: "IEEE Sri Lanka", href: "https://www.ieee.lk/", external: true },
      { label: "IEEE YP", href: "https://yp.ieee.org/", external: true },
      { label: "IEEE R10", href: "https://r10.ieee.org/", external: true },
    ],
  },
];

export function SiteFooter({ email = "ieeeletstalksl@gmail.com" }: { email?: string }) {
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
                  National Project - IEEE Young Professionals Sri Lanka
                </span>
              </div>
            </div>
            <p className="mt-5 max-w-xs text-sm leading-relaxed">
              Where Future Professionals Meet Industry Leaders. Empowering careers through
              conversations, learning, and leadership since 2017.
            </p>
            <div className="mt-6 flex gap-2">
              {[
                {
                  icon: WhatsAppIcon,
                  href: "https://whatsapp.com/channel/0029VbDKy6v3WHTaI7YQye33",
                  label: "WhatsApp",
                },
                { icon: Linkedin, href: "#contact", label: "LinkedIn" },
                { icon: FacebookIcon, href: "#contact", label: "Facebook" },
                { icon: Instagram, href: "#contact", label: "Instagram" },
                {
                  icon: Youtube,
                  href: "https://youtube.com/playlist?list=PLfD2rmttsnHyr7J6tVklSwM9bgf1mUsbI&si=5H-Xj7oEEDqeu8q0",
                  label: "YouTube",
                },
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
              <h4 className="font-display text-sm font-semibold tracking-wider text-white uppercase">{g.title}</h4>
              <ul className="mt-4 space-y-3 text-sm">
                {g.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      target={l.external ? "_blank" : undefined}
                      rel={l.external ? "noopener noreferrer" : undefined}
                      className="transition-colors hover:text-orange"
                    >
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

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.2 11.4a8.1 8.1 0 0 1-11.9 7.1L4 20l1.5-4.1A8.1 8.1 0 1 1 20.2 11.4Z" />
      <path d="M8.2 8.4c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.7 1.7c.1.2.1.4-.1.6l-.6.7c.6 1.1 1.5 2 2.6 2.6l.7-.6c.2-.2.4-.2.6-.1l1.7.7c.3.1.4.3.4.5v.5c0 .3 0 .5-.4.7-.4.2-1 .3-1.4.2-2.3-.5-5.7-3.9-6.2-6.2-.1-.5 0-1 .3-1.5Z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M13.5 21v-8h2.75l.4-3h-3.15V8.08c0-.87.24-1.46 1.5-1.46h1.75V3.94c-.3-.04-1.33-.13-2.53-.13-2.5 0-4.22 1.53-4.22 4.34V10H7.17v3H10v8h3.5Z" />
    </svg>
  );
}
