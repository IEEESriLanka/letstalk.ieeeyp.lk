import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X } from "lucide-react";
import letsTalkLogo from "@/assets/lets-talk-logo.png";
import { useLocation } from "@tanstack/react-router";

const links = [
  { label: "Home", href: "/#top" },
  { label: "About Us", href: "/about-us" },
  { label: "Team", href: "/team" },
  { label: "Events", href: "/events" },
  { label: "Our Journey", href: "/#journey" },
  { label: "Gallery", href: "/#gallery" },
  { label: "Awards", href: "/#awards" },
  { label: "Contact", href: "/#contact" },
];

function getHrefHash(href: string) {
  const hashIndex = href.indexOf("#");
  return hashIndex === -1 ? "" : href.slice(hashIndex);
}

function NavLink({
  href,
  label,
  active,
  className,
  onClick,
}: {
  href: string;
  label: string;
  active: string;
  className: string;
  onClick?: () => void;
}) {
  const hash = getHrefHash(href);
  const pathname = useLocation({ select: (location) => location.pathname });
  const selected = hash ? pathname === "/" && active === hash : pathname === href;
  const children = (
    <>
      {label}
      {selected && (
        <motion.span
          layoutId="nav-active"
          className="absolute -bottom-2 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-orange"
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
        />
      )}
    </>
  );

  return (
    <a href={href} onClick={onClick} className={className} aria-current={selected ? "page" : undefined}>
      {children}
    </a>
  );
}

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("#top");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sectionIds = links.map((link) => getHrefHash(link.href)).filter(Boolean);
    const sections = sectionIds
      .map((href) => document.querySelector(href))
      .filter(Boolean) as Element[];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(`#${visible.target.id}`);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 1] },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
      <nav
        className={`mx-auto flex max-w-6xl items-center justify-between rounded-full px-4 py-2.5 transition-all duration-500 sm:px-5 ${
          scrolled ? "glass-panel shadow-soft" : "border border-transparent bg-transparent"
        }`}
      >
        <a href="/#top" className="group flex items-center gap-2.5">
          <div className="grid size-10 place-items-center rounded-xl border border-white/80 bg-white/95 p-1 shadow-sm backdrop-blur-sm transition-transform duration-300 group-hover:scale-105">
            <img
              src={letsTalkLogo}
              alt="IEEE LETs talk logo"
              className="size-full object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-[0.95rem] leading-tight font-bold tracking-tight text-heading">
              IEEE <span className="text-ieee">LETs</span> talk
            </span>
            <span className="text-[0.62rem] font-medium text-body">YP Sri Lanka</span>
          </div>
        </a>

        <div className="hidden items-center gap-7 lg:flex">
          {links.map((l) => (
            <NavLink
              key={l.href}
              href={l.href}
              label={l.label}
              active={active}
              className="link-underline relative text-sm font-medium text-body transition-colors hover:text-heading"
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            className="grid size-10 place-items-center rounded-full border border-border bg-white text-ieee lg:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="glass-panel mx-auto mt-2 max-w-6xl rounded-3xl p-4 lg:hidden"
          >
            <div className="grid gap-1">
              {links.map((l) => (
                <NavLink
                  key={l.href}
                  href={l.href}
                  label={l.label}
                  active={active}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-4 py-3 text-sm font-medium text-body transition-colors hover:bg-ieee-tint hover:text-ieee"
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
