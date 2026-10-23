let cancelPendingScroll: (() => void) | undefined;

/** One native scroll per navigation. Pending work yields to user input. */
export function scrollToHash(rawHash: string, smooth = true): () => void {
  cancelPendingScroll?.();
  if (typeof window === "undefined" || !rawHash) return () => {};
  let id: string;
  try {
    id = decodeURIComponent(rawHash.replace(/^#/, ""));
  } catch {
    return () => {};
  }
  if (!id) return () => {};
  let frame = 0;
  let attempts = 0;
  let cancelled = false;
  const cancel = () => {
    cancelled = true;
    window.cancelAnimationFrame(frame);
    window.removeEventListener("wheel", cancel);
    window.removeEventListener("touchstart", cancel);
    window.removeEventListener("keydown", cancel);
    if (cancelPendingScroll === cancel) cancelPendingScroll = undefined;
  };
  cancelPendingScroll = cancel;
  window.addEventListener("wheel", cancel, { passive: true });
  window.addEventListener("touchstart", cancel, { passive: true });
  window.addEventListener("keydown", cancel);
  const scroll = () => {
    if (cancelled) return;
    const target = document.getElementById(id);
    // Allow a deferred mount, but never reposition after scrolling.
    if (!target && attempts++ < 30) {
      frame = window.requestAnimationFrame(scroll);
      return;
    }
    if (target) {
      const nav = document.querySelector("header nav");
      const offset = nav ? nav.getBoundingClientRect().bottom + 16 : 96;
      const contactAdjustment = id === "contact" ? 72 : 0;
      const top = id === "top" ? 0 : Math.max(0, target.getBoundingClientRect().top + window.scrollY - offset + contactAdjustment);
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      // Home and Contact open directly instead of traversing the whole page.
      const returningHome = id === "top" && window.scrollY > 96;
      window.scrollTo({ top, behavior: smooth && !reducedMotion && id !== "contact" && id !== "top" ? "smooth" : "instant" });
      if (returningHome && !reducedMotion) {
        document.querySelector(".public-site main")?.animate?.(
          [{ opacity: 0.85 }, { opacity: 1 }],
          { duration: 240, easing: "ease-out" },
        );
      }
    }
    cancel();
  };
  // Let the menu close and the document unlock before measuring.
  frame = window.requestAnimationFrame(() => {
    if (!cancelled) frame = window.requestAnimationFrame(scroll);
  });
  return cancel;
}
