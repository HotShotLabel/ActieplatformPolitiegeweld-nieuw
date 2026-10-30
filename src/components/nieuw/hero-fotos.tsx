"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { VerticalCutReveal } from "@/components/ui/vertical-cut-reveal";
import { btnGhost, btnPrimary } from "@/lib/ui";

const FOTOS = [
  {
    src: "/nieuw/charge-politie.jpg",
    alt: "Bereden politie tijdens een charge",
    caption:
      "Bereden politie tijdens een charge. Beeld: Anefo / Nationaal Archief · CC0.",
  },
  {
    src: "/nieuw/utrecht-politie.jpg",
    alt: "Politiegeweld op de Drift in Utrecht",
    caption:
      "Politiegeweld op de Drift, Utrecht, 19 mei 2025. Beeld: Afonso Dimas Martins / Wikimedia Commons · CC BY-SA 4.0.",
  },
  {
    src: "/nieuw/boeren-politie.jpg",
    alt: "Politie bij een boerenprotest",
    caption: "Politie bij een boerenprotest. Beeld: Ministerie van Defensie · CC0.",
  },
  {
    src: "/nieuw/azc-protest.jpg",
    alt: "Protest bij een azc",
    caption:
      "Anti-AZC-protest, Nieuwerkerk aan den IJssel. Beeld: Kniesoor / Wikimedia Commons · CC BY-SA 4.0.",
  },
  {
    src: "/nieuw/waterkanon.jpg",
    alt: "Waterkanon tijdens een demonstratie",
    caption:
      "Waterkanon tijdens een demonstratie. Beeld: Mauritsvink / Wikimedia Commons · publiek domein.",
  },
  {
    src: "/nieuw/me-amsterdam.jpg",
    alt: "Mobiele Eenheid in Amsterdam",
    caption:
      "Mobiele Eenheid in Amsterdam. Beeld: Maurits90 / Wikimedia Commons · publiek domein.",
  },
];

export function HeroFotos({
  counts,
}: {
  counts: { meldingen: number; uitspraken: number; beelden: number; om: number };
}) {
  const reduce = useReducedMotion();
  const [actief, setActief] = useState(0);
  const [liveCounts, setLiveCounts] = useState(counts);

  useEffect(() => {
    let levend = true;
    Promise.all([
      fetch("/api/beelden").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/nieuws").then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([beelden, nieuws]) => {
        if (!levend) return;
        const aantalBeelden = Array.isArray(beelden?.beelden) ? beelden.beelden.length : null;
        const aantalOm = Array.isArray(nieuws?.berichten)
          ? nieuws.berichten.filter((b: { bron?: string }) => b.bron === "Openbaar Ministerie").length
          : null;
        setLiveCounts((huidig) => ({
          ...huidig,
          ...(aantalBeelden !== null ? { beelden: aantalBeelden } : {}),
          ...(aantalOm !== null ? { om: aantalOm } : {}),
        }));
      })
      .catch(() => undefined);
    return () => {
      levend = false;
    };
  }, []);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(
      () => setActief((huidig) => (huidig + 1) % FOTOS.length),
      6000
    );
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative flex min-h-[92vh] flex-col justify-end overflow-hidden border-b border-line">
      <div className="absolute inset-0">
        {FOTOS.map((foto, index) => (
          <img
            key={foto.src}
            src={foto.src}
            alt={foto.alt}
            className={`absolute inset-0 h-full w-full object-cover brightness-[.58] grayscale-[.62] transition-opacity duration-[1500ms] ${
              index === actief ? "opacity-100" : "opacity-0"
            }`}
            loading={index === 0 ? "eager" : "lazy"}
          />
        ))}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,9,12,.58)_0%,rgba(7,9,12,.12)_30%,rgba(7,9,12,.94)_80%,#07090c_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,9,12,.88),transparent_64%)]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1200px] px-6 pb-8 pt-32 lg:px-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-brand-blue">
            Nederland · archief 2012–2026
          </p>
          <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-foreground">
            <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-accent" />
            Live bijgewerkt
          </span>
        </div>

        <h1 className="mt-4 max-w-[22ch] font-display text-[clamp(2.4rem,6vw,5.4rem)] font-semibold leading-[.96] tracking-[-0.055em]">
          <span className="block">
            {reduce ? (
              "Wij leggen het vast,"
            ) : (
              <VerticalCutReveal
                splitBy="words"
                staggerDuration={0.075}
                transition={{ type: "spring", stiffness: 150, damping: 24 }}
              >
                Wij leggen het vast,
              </VerticalCutReveal>
            )}
          </span>
          <span className="block text-accent">
            {reduce ? (
              "zodat het geen nummer wordt."
            ) : (
              <VerticalCutReveal
                splitBy="words"
                staggerDuration={0.06}
                transition={{
                  type: "spring",
                  stiffness: 150,
                  damping: 24,
                  delay: 0.12,
                }}
              >
                zodat het geen nummer wordt.
              </VerticalCutReveal>
            )}
          </span>
          <motion.span
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="mt-3 block font-mono text-[11px] tracking-[0.16em] text-brand-blue md:text-[12px]"
          >
            Politiegeweld
          </motion.span>
        </h1>
        <p className="mt-5 max-w-[52ch] text-base leading-relaxed text-[#c9d4e5] md:text-lg">
          Van melding tot uitspraak. Voor wie het meemaakt, en voor iedereen die
          het wil stoppen.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link href="/melden" className={btnPrimary}>
            Melding doen
          </Link>
          <Link href="/steun" className={btnGhost}>
            Steun het platform
          </Link>
        </div>
        <p className="mt-4 max-w-[52ch] text-sm leading-relaxed text-white/65">
          Anoniem kan. Je houdt zelf de regie over wat je deelt.
        </p>
        <p className="mt-5 max-w-[74ch] font-mono text-[9px] leading-relaxed tracking-[0.04em] text-white/55">
          {FOTOS[actief].caption} Geen slachtoffers in beeld gebracht zonder
          toestemming.
        </p>
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-[1200px] grid-cols-2 border-t border-white/15 bg-[#07090c]/60 backdrop-blur-sm lg:grid-cols-4">
        {[
          ["meldingen", counts.meldingen],
          ["uitspraken", counts.uitspraken],
          ["beelden", liveCounts.beelden],
          ["OM-berichten", liveCounts.om],
        ].map(([label, value]) => (
          <div key={String(label)} className="border-r border-white/15 px-4 py-4 last:border-r-0">
            <strong className="block font-display text-2xl tracking-tight md:text-3xl">
              {Number(value).toLocaleString("nl-NL")}
            </strong>
            <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#93a0b9]">
              {label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
