import { motion } from "motion/react";
import { useEffect, useState } from "react";
import g1 from "@/assets/gallery-1.jpg";
import g2 from "@/assets/gallery-2.jpg";
import g3 from "@/assets/gallery-3.jpg";
import g4 from "@/assets/gallery-4.jpg";

const photos = [g1, g2, g3, g4];

export function PhotoBackdrop() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % photos.length), 6000);
    return () => clearInterval(t);
  }, []);

  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      {photos.map((src, idx) => (
        <motion.div
          key={idx}
          className="absolute inset-0"
          initial={false}
          animate={{ opacity: idx === i ? 1 : 0 }}
          transition={{ duration: 1.6, ease: "easeInOut" }}
        >
          <img src={src} alt="" className="size-full object-cover" />
        </motion.div>
      ))}

      {/* brand wash keeps the bright, premium palette readable */}
      <div className="absolute inset-0 bg-[linear-gradient(115deg,color-mix(in_oklab,var(--background)_96%,transparent)_0%,color-mix(in_oklab,var(--background)_90%,transparent)_45%,color-mix(in_oklab,var(--ieee)_18%,transparent)_100%)]" />
      <div className="absolute inset-0 bg-[color-mix(in_oklab,var(--background)_45%,transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(60%_55%_at_15%_25%,color-mix(in_oklab,var(--orange)_14%,transparent),transparent_70%)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(to_top,var(--background),transparent)]" />
    </div>
  );
}
