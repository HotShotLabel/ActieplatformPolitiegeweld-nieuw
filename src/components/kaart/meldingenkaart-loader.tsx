"use client";

import dynamic from "next/dynamic";

const MeldingenKaart = dynamic(
  () =>
    import("@/components/kaart/meldingenkaart").then(
      (mod) => mod.MeldingenKaart
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[62vh] min-h-[420px] w-full items-center justify-center rounded-xl border border-line bg-surface text-sm text-muted-2">
        Kaart laden…
      </div>
    ),
  }
);

export function MeldingenKaartLoader() {
  return <MeldingenKaart />;
}
