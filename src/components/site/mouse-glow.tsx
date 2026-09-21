import { useEffect, useState } from "react";
import { motion } from "motion/react";

/** Soft orange + blue glow that follows the cursor. Desktop only. */
export function MouseGlow() {
  const [pos, setPos] = useState({ x: -500, y: -500 });
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setEnabled(true);
    const onMove = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-30 hidden lg:block"
      animate={{ x: pos.x - 260, y: pos.y - 260 }}
      transition={{ type: "spring", stiffness: 90, damping: 22, mass: 0.6 }}
      style={{ width: 520, height: 520 }}
    >
      <div className="size-full rounded-full bg-[radial-gradient(circle_at_35%_35%,color-mix(in_oklab,var(--orange)_16%,transparent),transparent_60%),radial-gradient(circle_at_70%_70%,color-mix(in_oklab,var(--ieee)_14%,transparent),transparent_62%)] blur-2xl" />
    </motion.div>
  );
}
