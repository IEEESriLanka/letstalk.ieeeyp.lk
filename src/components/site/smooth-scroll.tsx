import { useEffect } from "react";
import { useLocation } from "@tanstack/react-router";

/** Enhance mouse wheels while leaving touch, nested scrollers and dialogs native. */
export function SmoothScroll() {
  const href = useLocation({ select: (location) => location.href });

  useEffect(() => {
    if (/^\/admin(?:\/|$)/.test(window.location.pathname)) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let target = window.scrollY;
    let frame = 0;
    let previousTime = 0;
    let direction = 0;

    const isLocked = () =>
      /hidden|clip/.test(getComputedStyle(document.body).overflowY) ||
      /hidden|clip/.test(getComputedStyle(document.documentElement).overflowY);

    const reset = () => {
      window.cancelAnimationFrame(frame);
      frame = 0;
      previousTime = 0;
      direction = 0;
    };

    const animate = (time: number) => {
      if (reducedMotion.matches || isLocked()) {
        reset();
        return;
      }
      const elapsed = Math.min(64, Math.max(0, time - previousTime));
      previousTime = time;
      target = Math.min(target, Math.max(0, document.documentElement.scrollHeight - window.innerHeight));
      const distance = target - window.scrollY;
      // Time-based easing feels consistent on both 60 Hz and high-refresh screens.
      const next = Math.abs(distance) < 0.75
        ? target
        : window.scrollY + distance * (1 - Math.exp(-elapsed / 140));
      window.scrollTo({ top: next, behavior: "instant" });
      if (Math.abs(target - next) < 0.75) {
        window.scrollTo({ top: target, behavior: "instant" });
        reset();
      } else {
        frame = window.requestAnimationFrame(animate);
      }
    };

    const onWheel = (event: WheelEvent) => {
      if (
        event.defaultPrevented || !event.cancelable || reducedMotion.matches ||
        event.ctrlKey || event.metaKey || event.shiftKey ||
        Math.abs(event.deltaX) > Math.abs(event.deltaY) ||
        event.deltaY === 0 ||
        // Small pixel deltas normally come from an already smooth trackpad.
        (event.deltaMode === 0 && Math.abs(event.deltaY) < 40) ||
        isLocked()
      ) {
        reset();
        return;
      }

      let element = event.target instanceof Element ? event.target : null;
      while (element && element !== document.body && element !== document.documentElement) {
        if (
          element.matches("input, textarea, select, [contenteditable], [role='dialog'], [role='menu']") ||
          (/auto|scroll/.test(getComputedStyle(element).overflowY) &&
            element.scrollHeight > element.clientHeight)
        ) {
          reset();
          return;
        }
        element = element.parentElement;
      }

      const nextDirection = Math.sign(event.deltaY);
      if (!frame || direction !== nextDirection) target = window.scrollY;
      direction = nextDirection;
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1;
      const maximum = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      target = Math.max(0, Math.min(maximum, target + event.deltaY * unit));
      event.preventDefault();
      if (!frame) {
        previousTime = performance.now();
        frame = window.requestAnimationFrame(animate);
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("pointerdown", reset, { passive: true });
    window.addEventListener("touchstart", reset, { passive: true });
    window.addEventListener("keydown", reset);
    return () => {
      reset();
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("pointerdown", reset);
      window.removeEventListener("touchstart", reset);
      window.removeEventListener("keydown", reset);
    };
  }, [href]);

  return null;
}
