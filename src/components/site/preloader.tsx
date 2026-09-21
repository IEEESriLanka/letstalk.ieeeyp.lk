import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles } from "lucide-react";
import letsTalkLogo from "@/assets/lets-talk-logo.png";

export function Preloader() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Lock body scroll during initial loading
    document.body.style.overflow = "hidden";

    const duration = 5000; // 5 seconds duration
    const interval = 25; // update every 25ms
    const step = 100 / (duration / interval);

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + step + (Math.random() * 0.4 - 0.2);
        if (next >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            setLoading(false);
            document.body.style.overflow = "";
          }, 350);
          return 100;
        }
        return next;
      });
    }, interval);

    return () => {
      clearInterval(timer);
      document.body.style.overflow = "";
    };
  }, []);

  const getStatusText = (prog: number) => {
    if (prog < 25) return "Connecting to IEEE Young Professionals network…";
    if (prog < 50) return "Loading leadership talks & speaker sessions…";
    if (prog < 75) return "Preparing interactive workshops & skill tracks…";
    if (prog < 95) return "Where Future Professionals Meet Industry Leaders…";
    return "Welcome to IEEE LETs talk";
  };

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          exit={{
            y: "-100%",
            opacity: 0.9,
            transition: {
              duration: 0.85,
              ease: [0.76, 0, 0.24, 1],
            },
          }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden bg-[#00142B] text-white select-none"
        >
          {/* Ambient luminous glows */}
          <div
            aria-hidden
            className="animate-pulse absolute -top-20 -left-20 size-96 rounded-full bg-[color-mix(in_oklab,var(--orange)_24%,transparent)] blur-[120px]"
          />
          <div
            aria-hidden
            className="animate-pulse absolute -bottom-20 -right-20 size-96 rounded-full bg-[color-mix(in_oklab,var(--ieee)_35%,transparent)] blur-[140px]"
            style={{ animationDelay: "1s" }}
          />
          <div
            aria-hidden
            className="absolute inset-0 opacity-15 [background-image:radial-gradient(#ffffff_1px,transparent_1px)] [background-size:32px_32px]"
          />

          <div className="relative z-10 flex flex-col items-center px-6 text-center">
            {/* Pulsing Emblem with expanding rings */}
            <div className="relative mb-8 grid place-items-center">
              <motion.div
                animate={{ scale: [1, 1.45, 1], opacity: [0.35, 0, 0.35] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute size-24 rounded-full border border-orange/40"
              />
              <motion.div
                animate={{ scale: [1, 1.85, 1], opacity: [0.2, 0, 0.2] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: 0.4, ease: "easeInOut" }}
                className="absolute size-28 rounded-full border border-white/20"
              />
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative grid size-20 place-items-center rounded-2xl border border-white/20 bg-white/95 p-3 shadow-[0_0_50px_rgba(255,107,0,0.45)] backdrop-blur-md"
              >
                <img
                  src={letsTalkLogo}
                  alt="IEEE LETs talk logo"
                  className="size-full object-contain"
                />
              </motion.div>
            </div>

            {/* Brand Titles */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex flex-col items-center"
            >
              <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1 text-[0.7rem] font-medium tracking-wide text-white/70 backdrop-blur-md">
                <Sparkles className="size-3 text-orange" />
                IEEE Young Professionals Sri Lanka
              </div>

              <h1 className="font-display text-gradient-orange mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                IEEE LETs talk
              </h1>
            </motion.div>

            {/* Status indicator */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-6 h-5 text-xs font-medium tracking-wide text-white/70 sm:text-sm"
            >
              {getStatusText(progress)}
            </motion.p>

            {/* Progress Bar & Counter */}
            <div className="mt-8 w-64 max-w-[80vw] sm:w-80">
              <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/10 p-0.5">
                <motion.div
                  className="h-full rounded-full bg-[image:var(--gradient-orange)] shadow-[0_0_12px_rgba(255,107,0,0.8)]"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                  transition={{ ease: "easeOut" }}
                />
              </div>
              <div className="mt-3 flex items-center justify-between text-[0.7rem] font-semibold text-white/50">
                <span>LOADING EXPERIENCE</span>
                <span className="font-mono text-xs text-orange">{Math.round(progress)}%</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
