import type { Metadata } from "next";
import Link from "next/link";
import { DonationCard } from "@/components/nieuw/donation-card";
import { btnGhost } from "@/lib/ui";

export const metadata: Metadata = {
  title: "Steun het platform",
  description:
    "Steun het Actieplatform Politiegeweld: live feeds, data, onderzoek, moderatie en techniek.",
};

export default function SteunPage() {
  const stripeUrl = process.env.NEXT_PUBLIC_STRIPE_DONATIE_URL;

  return (
    <main id="main" className="flex-1">
      <div className="mx-auto w-full max-w-[1080px] px-6 pb-28 pt-24 md:pt-28 lg:px-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-brand-blue">
          Steun het platform
        </p>
        <h1 className="mt-4 max-w-[16ch] font-display text-4xl font-semibold leading-[1.04] tracking-tight md:text-6xl">
          Dit kost het om het draaiende te houden.
        </h1>
        <p className="mt-6 max-w-[62ch] text-lg leading-relaxed text-muted">
          Geen advertenties, geen geld van partijen. Wel live feeds, data,
          onderzoek, moderatie en techniek. Jij houdt het onafhankelijk.
        </p>

        <div className="mt-10 grid gap-5 lg:grid-cols-[1.05fr_.95fr]">
          <div className="rounded-xl border border-line bg-surface p-6 md:p-8">
            <h2 className="font-display text-xl font-semibold tracking-tight">
              Waar het naartoe gaat
            </h2>
            <p className="mt-3 max-w-[52ch] text-sm leading-relaxed text-muted">
              Dit is geen campagnebudget. Het is de basis: feeds, onderzoek,
              veiligheid en techniek.
            </p>
            <ul className="mt-5 border-t border-line text-sm">
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

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                ["Onafhankelijk", "Geen advertenties of partijgeld."],
                ["Vertrouwelijk", "Meldingen blijven van jou."],
                ["Openbaar", "Bronnen en uitspraken zijn na te lezen."],
              ].map(([titel, tekst]) => (
                <div key={titel} className="border-t border-line pt-3">
                  <p className="font-display text-sm font-semibold">{titel}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-2">
                    {tekst}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <DonationCard stripeUrl={stripeUrl} />
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/nieuw" className={btnGhost}>
            Terug naar de nieuwe homepage
          </Link>
          <Link href="/meedoen" className={btnGhost}>
            Eerst meedoen
          </Link>
        </div>
      </div>
    </main>
  );
}
