"use client";

import { motion, useReducedMotion } from "motion/react";
import {
  Crosshair,
  Dog,
  Ellipsis,
  Hand,
  Minus,
  SprayCan,
  VenetianMask,
  Zap,
} from "lucide-react";
import type { ReeksPunt } from "@/lib/cijfers";

const getalFormatter = new Intl.NumberFormat("nl-NL");

const BALK_ICONEN: Record<string, typeof Hand> = {
  hand: Hand,
  ellipsis: Ellipsis,
  minus: Minus,
  crosshair: Crosshair,
  "venetian-mask": VenetianMask,
  zap: Zap,
  "spray-can": SprayCan,
  dog: Dog,
};

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
        className="rounded-xl border border-line bg-surface px-4 py-8 sm:px-6 md:px-10 md:py-10"
        style={{ perspective: "1500px" }}
      >
        <div
          className="space-y-3"
          style={{
            transform: "rotateX(6deg) rotateY(-8deg)",
            transformStyle: "preserve-3d",
          }}
        >
          <div className="relative h-[220px] md:h-[240px]">
            {/* vloer */}
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-px bg-line-strong"
            />
            <div className="flex h-full items-end gap-1.5 md:gap-3">
              {balken.map((punt, index) => {
                const percentage = Math.max((punt.waarde / max) * 100, 2.5);
                const Icoon = punt.icoon ? BALK_ICONEN[punt.icoon] : undefined;
                return (
                  <div key={punt.label} className="relative h-full flex-1">
                    <span
                      className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[9px] leading-none text-foreground sm:text-[10px] md:text-xs"
                      style={{ bottom: `calc(${percentage}% + 10px)` }}
                    >
                      {getalFormatter.format(punt.waarde)}
                    </span>
                    {Icoon ? (
                      <span
                        aria-hidden
                        className="absolute left-1/2 -translate-x-1/2 text-muted-2"
                        style={{ bottom: `calc(${percentage}% + 26px)` }}
                      >
                        <Icoon size={14} strokeWidth={1.8} />
                      </span>
                    ) : null}
                    <motion.div
                      className="absolute inset-x-0 bottom-0 rounded-t-md bg-[linear-gradient(180deg,#ff5a5f_0%,#d23a3f_55%,rgba(210,58,63,0.35)_100%)] shadow-[0_14px_34px_rgba(229,72,77,0.22)]"
                      initial={reduce ? false : { scaleY: 0, opacity: 0.6 }}
                      whileInView={{ scaleY: 1, opacity: 1 }}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{
                        duration: 0.9,
                        delay: index * 0.06,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      style={{
                        height: `${percentage}%`,
                        transformOrigin: "bottom center",
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex gap-1.5 md:gap-3">
            {balken.map((punt) => (
              <span
                key={punt.label}
                className="flex-1 text-center font-mono text-[9px] uppercase tracking-[0.06em] text-muted-2 sm:text-[10px] md:text-[11px]"
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
