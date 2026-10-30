import { Marquee } from "@/components/ui/marquee";

const RIGHTS = [
  "Artikel 9 Grondwet: vrijheid van vergadering en betoging",
  "Artikel 11 Grondwet: onaantastbaarheid van het lichaam",
  "Artikel 3 EVRM: verbod op foltering en onmenselijke behandeling",
  "Artikel 8 EVRM: recht op eerbiediging van het privéleven",
  "Artikel 6 EVRM: recht op een eerlijk proces",
  "Artikel 13 EVRM: recht op een daadwerkelijk rechtsmiddel",
  "Artikel 12 Sv: beklag over het niet vervolgen van een strafbaar feit",
];

export function RightsTicker() {
  return (
    <section
      aria-label="Rechten waar dit platform op staat"
      className="border-y border-line bg-surface/40"
    >
      <Marquee
        pauseOnHover
        className="py-4 [--duration:52s] [--gap:3rem]"
        aria-hidden="true"
      >
        {RIGHTS.map((right) => (
          <span
            key={right}
            className="flex items-center gap-3 whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.14em] text-muted-2"
          >
            <span aria-hidden className="h-1 w-1 rounded-full bg-brand-blue" />
            {right}
          </span>
        ))}
      </Marquee>
    </section>
  );
}
