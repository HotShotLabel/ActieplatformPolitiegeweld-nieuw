"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";
import { Reveal } from "@/components/site/reveal";

const STEPS = [
  {
    title: "Jij meldt",
    body: "Vertel wat er is gebeurd: datum, plek en wat je zag. Met naam of anoniem, met of zonder beelden.",
  },
  {
    title: "Wij documenteren",
    body: "We controleren, ordenen en bewaren. Elke melding krijgt een vaste plek, ook als je later iets toevoegt.",
  },
  {
    title: "Er volgt actie",
    body: "Een dossier, een jurist of een patroon dat zichtbaar wordt. Bewijs dat blijft staan.",
  },
];

export function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.75", "end 0.55"],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 22 });

  return (
    <section className="border-t border-line bg-surface/30">
      <div className="mx-auto w-full max-w-[1200px] px-6 py-24 md:py-32 lg:px-10">
        <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
          Hoe het werkt
        </h2>

        <div ref={ref} className="relative mt-16">
          <div
            aria-hidden
            className="absolute inset-x-0 top-5 hidden h-px bg-line md:block"
          />
          <motion.div
            aria-hidden
            className="absolute inset-x-0 top-5 hidden h-px origin-left bg-accent md:block"
            style={reduce ? { scaleX: 1 } : { scaleX: progress }}
          />

          <div className="grid gap-12 md:grid-cols-3 md:gap-10">
            {STEPS.map((step, index) => (
              <Reveal key={step.title} delay={index * 0.08}>
                <div className="flex flex-col gap-5">
                  <span className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border border-line-strong bg-background font-mono text-sm">
                    {index + 1}
                  </span>
                  <h3 className="font-display text-xl font-semibold tracking-tight md:text-2xl">
                    {step.title}
                  </h3>
                  <p className="max-w-[42ch] leading-relaxed text-muted">
                    {step.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
