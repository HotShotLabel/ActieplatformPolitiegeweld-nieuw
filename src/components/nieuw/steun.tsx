"use client";

import { motion, useReducedMotion } from "motion/react";
import { DonationCard } from "@/components/nieuw/donation-card";
import { Poppetje } from "@/components/nieuw/poppetje";
import { WordReveal } from "@/components/site/word-reveal";

const MENSEN = [
  { rol: "Melder", accent: "#2f7fd1" },
  { rol: "Familie", accent: "#d8302c" },
  { rol: "Onderzoeker", accent: "#004c9d" },
];

export function Steun() {
  const reduce = useReducedMotion();
  const stripeUrl = process.env.NEXT_PUBLIC_STRIPE_DONATIE_URL;

  return (
    <section className="relative overflow-hidden border-t border-line bg-[#07090c] text-foreground">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_20%,rgba(0,76,157,0.24),transparent_34%),radial-gradient(circle_at_88%_78%,rgba(216,48,44,0.1),transparent_32%)]"
      />
      <div className="relative mx-auto grid w-full max-w-[1200px] gap-10 px-6 py-20 md:py-24 lg:grid-cols-[1.05fr_.95fr] lg:gap-16 lg:px-10">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-brand-blue">
            Steun het platform
          </p>
          <h2 className="mt-4 max-w-[15ch] font-display text-4xl font-semibold leading-[1.04] tracking-tight md:text-5xl">
            <WordReveal text="Dit kost het om het draaiende te houden." />
          </h2>
          <p className="mt-5 max-w-[54ch] leading-relaxed text-muted">
            Geen advertenties, geen geld van partijen. Wel live feeds, data,
            onderzoek, moderatie en techniek. Jij houdt het onafhankelijk.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {MENSEN.map((mens, index) => (
              <motion.div
                key={mens.rol}
                className="flex items-center gap-2 rounded-full border border-line bg-surface/60 py-1.5 pl-1.5 pr-3"
                animate={reduce ? undefined : { y: [0, -4, 0] }}
                transition={
                  reduce
                    ? undefined
                    : {
                        duration: 6,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: index * 0.5,
                      }
                }
              >
                <Poppetje
                  accent={mens.accent}
                  rol={mens.rol}
                  className="h-10 w-10 border-0"
                />
                <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted">
                  {mens.rol}
                </span>
              </motion.div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-2">
            Zij dragen dit werk. Jij houdt het mogelijk.
          </p>

          <ul className="mt-8 max-w-[54ch] border-t border-line text-sm">
            {[
              ["Live feeds en databijwerking", "dagelijks"],
              ["Onderzoek en dossieropbouw", "uren"],
              ["Moderatie en veiligheid", "continu"],
              ["Techniek en hosting", "maandelijks"],
            ].map(([label, waarde]) => (
              <li
                key={label}
                className="flex justify-between gap-4 border-b border-line py-3"
              >
                <span className="text-muted">{label}</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-brand-blue">
                  {waarde}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:pt-1">
          <DonationCard stripeUrl={stripeUrl} />
          <p className="mt-4 max-w-[42ch] text-xs leading-relaxed text-muted-2">
            Onafhankelijk betekent: niemand anders bepaalt wat we publiceren.
            Jouw bijdrage gaat naar de basis, niet naar advertenties.
          </p>
        </div>
      </div>
    </section>
  );
}
