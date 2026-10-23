import { motion, useReducedMotion, type Variants } from "motion/react";
import { Children, cloneElement, isValidElement, type ReactNode } from "react";
import { motionTokens as timing } from "@/lib/motion-tokens";

const easeOut = timing.ease;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: timing.distance },
  show: (index: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: timing.reveal, ease: easeOut, delay: Math.min(index * timing.stagger, timing.maxStagger) },
  }),
};

export const stagger: Variants = {
  hidden: {},
  show: {},
};

export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      variants={{
        hidden: { opacity: 0, y: timing.distance },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: reduceMotion ? 0 : timing.reveal, ease: easeOut, delay: reduceMotion ? 0 : Math.min(delay, timing.maxStagger) },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function RevealGroup({ children, className }: { children: ReactNode; className?: string }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      variants={stagger}
    >
      {Children.map(children, (child, index) => isValidElement<{ custom?: number }>(child)
        ? cloneElement(child, { custom: index })
        : child)}
    </motion.div>
  );
}

export const MotionItem = motion.div;
