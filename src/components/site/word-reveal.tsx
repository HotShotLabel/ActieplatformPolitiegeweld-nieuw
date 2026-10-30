"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Rustige woord-voor-woord reveal voor koppen.
 * De hele kop is de trigger; de woorden erven de stagger.
 * De volledige tekst blijft één keer in de accessibility tree staan.
 */
export function WordReveal({
  text,
  className,
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();

  if (reduce) return <>{text}</>;

  const woorden = text.split(" ");

  return (
    <motion.span
      data-word-reveal=""
      className={cn("inline", className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.35 }}
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: 0.045, delayChildren: delay },
        },
      }}
    >
      <span className="sr-only">{text}</span>
      {woorden.map((woord, index) => (
        <span key={`${woord}-${index}`} aria-hidden="true">
          <span className="inline-flex overflow-hidden pb-[0.12em] align-bottom">
            <motion.span
              className="inline-block"
              variants={{
                hidden: { y: "110%" },
                visible: {
                  y: "0%",
                  transition: { type: "spring", stiffness: 150, damping: 24 },
                },
              }}
            >
              {woord}
            </motion.span>
          </span>
          {index < woorden.length - 1 ? " " : null}
        </span>
      ))}
    </motion.span>
  );
}
