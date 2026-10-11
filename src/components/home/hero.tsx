"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useReducedMotion } from "motion/react";
import { VerticalCutReveal } from "@/components/ui/vertical-cut-reveal";
import { Magnetic } from "@/components/site/magnetic";
import { btnGhost, btnPrimary } from "@/lib/ui";

const Hero3D = dynamic(
  () => import("@/components/home/hero-3d").then((mod) => mod.Hero3D),
  {
    ssr: false,
    loading: () => null,
  }
);

export function Hero() {
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 top-1/3 h-[480px] w-[480px] rounded-full bg-accent/10 blur-[130px]"
      />
      <div className="mx-auto grid w-full max-w-[1200px] gap-10 px-6 pb-20 pt-24 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-6 lg:px-10">
        <div>
          <h1 className="font-display text-4xl font-semibold leading-[1.12] tracking-tight md:text-6xl">
            {reduce ? (
              "Wij documenteren wat niet vergeten mag worden."
            ) : (
              <VerticalCutReveal
                splitBy="words"
                staggerDuration={0.075}
                transition={{ type: "spring", stiffness: 150, damping: 24 }}
              >
                Wij documenteren wat niet vergeten mag worden.
              </VerticalCutReveal>
            )}
          </h1>
          <p className="mt-6 max-w-[46ch] text-base leading-relaxed text-muted md:text-lg">
            Het Actieplatform verzamelt meldingen van politiegeweld, ondersteunt
            wie het meemaakt en werkt aan openbare verantwoording.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Magnetic>
              <Link href="/melden" className={btnPrimary}>
                Melding doen
              </Link>
            </Magnetic>
            <Link href="/kaart" className={btnGhost}>
              Bekijk de kaart
            </Link>
          </div>
        </div>

        <div className="relative h-[320px] sm:h-[420px] lg:h-[560px]">
          <Hero3D reduce={reduce === true} />
          <p className="absolute bottom-1 right-0 font-mono text-[11px] tracking-[0.14em] text-muted-2">
            52.13° N · 5.29° O
          </p>
        </div>
      </div>
    </section>
  );
}
