import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "Hoe het Actieplatform met meldingen en persoonsgegevens omgaat: kort en zonder kleine lettertjes.",
};

const blokken = [
  {
    titel: "Wat we opslaan bij een melding",
    tekst:
      "Het soort incident, de datum als je die invult, de plek die je beschrijft, je verhaal en je e-mailadres als je dat achterlaat. Meer niet.",
  },
  {
    titel: "Wie kan erbij",
    tekst:
      "Je verhaal is alleen voor ons. Meldingen staan in een afgesloten database bij een Europese dienstverlener, met servers in de Europese Unie. Alleen het platform kan erbij.",
  },
  {
    titel: "Wat er op de kaart komt",
    tekst:
      "Alleen als je dat zelf aanvinkt: een afgerond punt van ongeveer een kilometer, met het soort incident en de maand. Nooit je verhaal, nooit je naam, nooit je e-mailadres.",
  },
  {
    titel: "Wat we niet doen",
    tekst:
      "Geen tracking, geen analytics, geen advertenties en geen verkoop van gegevens aan wie dan ook.",
  },
  {
    titel: "Bewaren en verwijderen",
    tekst:
      "We bewaren een melding zolang dat nodig is voor onderzoek of een dossier. Wil je je melding laten aanpassen of verwijderen? Mail ons en het gebeurt.",
  },
];

export default function PrivacyPage() {
  return (
    <main id="main" className="flex-1">
      <div className="mx-auto w-full max-w-[840px] px-6 pb-28 pt-24 md:pt-28 lg:px-10">
        <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">
          Privacy
        </h1>
        <p className="mt-6 max-w-[62ch] text-lg leading-relaxed text-muted">
          Dit is wat we met je melding doen. Kort, en zonder kleine lettertjes.
          Vragen? Mail naar{" "}
          <a
            href="mailto:label@hot-shot.com"
            className="underline underline-offset-4 hover:text-foreground"
          >
            label@hot-shot.com
          </a>
          .
        </p>

        <div className="mt-12 border-t border-line">
          {blokken.map((blok) => (
            <section
              key={blok.titel}
              className="border-b border-line py-8 md:grid md:grid-cols-[240px_1fr] md:gap-10"
            >
              <h2 className="font-display text-lg font-semibold tracking-tight">
                {blok.titel}
              </h2>
              <p className="mt-3 max-w-[58ch] leading-relaxed text-muted md:mt-0">
                {blok.tekst}
              </p>
            </section>
          ))}
        </div>

        <p className="mt-8 max-w-[62ch] text-sm leading-relaxed text-muted-2">
          Je hebt recht op inzage, correctie en verwijdering van je gegevens.
          Mail ons voor elk van die drie, we reageren binnen een paar dagen.
          Zie ook onze{" "}
          <Link
            href="/melden"
            className="underline underline-offset-4 hover:text-muted"
          >
            meldpagina
          </Link>{" "}
          voor wat je wel en niet hoeft te delen.
        </p>
      </div>
    </main>
  );
}
