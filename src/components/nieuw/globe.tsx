"use client";

import dynamic from "next/dynamic";

const Hero3D = dynamic(
  () => import("@/components/home/hero-3d").then((mod) => mod.Hero3D),
  { ssr: false, loading: () => null }
);

export function Globe() {
  return (
    <div className="relative h-[420px] w-full overflow-hidden rounded-xl border border-line bg-[radial-gradient(circle_at_50%_45%,#101a24_0%,#07090c_62%)]">
      <Hero3D />
      <p className="absolute bottom-4 left-4 right-4 font-mono text-[9px] uppercase tracking-[0.1em] text-muted-2">
        Elke rode stip is een plek in het dossier · 3D-weergave
      </p>
    </div>
  );
}
