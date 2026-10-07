/**
 * Robust scroll utility to accurately scroll to a target section by ID/hash.
 * 
 * Takes into account:
 * 1. Fixed floating header height and padding.
 * 2. Asynchronous layout shifts (lazy images loading, skeletons expanding/collapsing, dynamic queries).
 * 3. Does not fight or interfere with intentional user interactions (wheel, touch, keyboard).
 */
export function scrollToHash(rawHash: string, smooth = true): void {
  if (typeof window === "undefined" || !rawHash) return;
  const id = rawHash.replace(/^#/, "");
  if (!id) return;

  const target = document.getElementById(id);
  if (!target) {
    // If the element hasn't mounted yet, retry briefly
    setTimeout(() => {
      const retryTarget = document.getElementById(id);
      if (retryTarget) {
        scrollToHash(rawHash, smooth);
      }
    }, 80);
    return;
  }

  const getHeaderHeight = () => {
    const header = document.querySelector("header");
    return header ? header.getBoundingClientRect().height : 76;
  };

  const getExpectedTop = () => {
    return getHeaderHeight() + 16;
  };

  const getTargetScrollY = (el: HTMLElement) => {
    return Math.max(0, el.getBoundingClientRect().top + window.scrollY - getExpectedTop());
  };

  // Perform initial scroll
  const initialY = getTargetScrollY(target);
  window.scrollTo({
    top: initialY,
    behavior: smooth ? "smooth" : "instant",
  });

  // Track if user manually scrolls so we don't disrupt their manual gesture
  let userInterrupted = false;
  const stopAdjustment = () => {
    userInterrupted = true;
  };

  window.addEventListener("wheel", stopAdjustment, { once: true, passive: true });
  window.addEventListener("touchmove", stopAdjustment, { once: true, passive: true });
  window.addEventListener("keydown", stopAdjustment, { once: true, passive: true });

  const adjustIfNeeded = () => {
    if (userInterrupted) return;
    const currentEl = document.getElementById(id);
    if (!currentEl) return;

    const currentTop = currentEl.getBoundingClientRect().top;
    const expectedTop = getExpectedTop();
    const diff = currentTop - expectedTop;

    // If layout shifts caused the target to end up a bit above or below (> 10px discrepancy),
    // smoothly align it with the expected position.
    if (Math.abs(diff) > 10) {
      window.scrollBy({
        top: diff,
        behavior: "smooth",
      });
    }
  };

  // Run adaptive adjustments at strategic intervals while async content settles
  const timeouts = [
    setTimeout(adjustIfNeeded, 350),
    setTimeout(adjustIfNeeded, 750),
    setTimeout(adjustIfNeeded, 1200),
  ];

  setTimeout(() => {
    window.removeEventListener("wheel", stopAdjustment);
    window.removeEventListener("touchmove", stopAdjustment);
    window.removeEventListener("keydown", stopAdjustment);
    timeouts.forEach(clearTimeout);
  }, 1600);
}

