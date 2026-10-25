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
      // Land on the heading/form row, skipping the contact section's large top padding.
      const landingTarget = id === "contact" ? document.getElementById("contact-content") ?? target : target;
      const top = id === "top" ? 0 : Math.max(0, landingTarget.getBoundingClientRect().top + window.scrollY - offset);
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top, behavior: smooth && !reducedMotion ? "smooth" : "instant" });
    }
    cancel();
  };
  // Let the menu close and the document unlock before measuring.
  frame = window.requestAnimationFrame(() => {
    if (!cancelled) frame = window.requestAnimationFrame(scroll);
  });
  return cancel;
}
