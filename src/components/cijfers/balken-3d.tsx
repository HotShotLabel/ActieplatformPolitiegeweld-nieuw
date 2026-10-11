"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReeksPunt } from "@/lib/cijfers";

const getalFormatter = new Intl.NumberFormat("nl-NL");

export function Balken3D({
  balken,
  bron,
}: {
  balken: ReeksPunt[];
  bron: string;
}) {
  const reduce = useReducedMotion();
  const max = Math.max(...balken.map((punt) => punt.waarde));

  return (
    <figure className="my-0">
      <div
        className="rounded-xl border border-line bg-surface p-6 md:p-8"
        style={{ perspective: "1100px" }}
      >
        <div
          className="space-y-4"
          style={{
            transform: "rotateX(9deg) rotateY(-13deg)",
            transformStyle: "preserve-3d",
          }}
        >
          <div className="flex h-[220px] items-end gap-2 md:gap-3">
            {balken.map((punt, index) => (
              <div
                key={punt.label}
                className="flex h-full flex-1 flex-col items-center justify-end gap-2"
              >
                <span className="font-mono text-[11px] text-foreground md:text-xs">
                  {getalFormatter.format(punt.waarde)}
                </span>
                <motion.div
                  className="w-full rounded-t-md bg-[linear-gradient(180deg,#ff5a5f_0%,#d23a3f_55%,rgba(210,58,63,0.35)_100%)] shadow-[0_14px_34px_rgba(229,72,77,0.22)]"
                  initial={reduce ? false : { scaleY: 0, opacity: 0.6 }}
                  whileInView={{ scaleY: 1, opacity: 1 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{
                    duration: 0.9,
                    delay: index * 0.07,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  style={{
                    height: `${Math.max((punt.waarde / max) * 100, 2)}%`,
                    transformOrigin: "bottom center",
                  }}
                />
              </div>
            ))}
          </div>
          <div className="flex gap-2 md:gap-3">
            {balken.map((punt) => (
              <span
                key={punt.label}
                className="flex-1 text-center font-mono text-[11px] uppercase tracking-[0.1em] text-muted-2"
              >
                {punt.label}
              </span>
            ))}
          </div>
        </div>
      </div>
      <figcaption className="mt-3 text-xs leading-relaxed text-muted-2">
        Bron: {bron}
      </figcaption>

      {/* Voor schermlezers: dezelfde cijfers als tekst. */}
      <ul className="sr-only">
        {balken.map((punt) => (
          <li key={punt.label}>
            {punt.label}: {getalFormatter.format(punt.waarde)}
          </li>
        ))}
      </ul>
    </figure>
  );
}
