import type { Metadata } from "next";
import Link from "next/link";
import { Balken3D } from "@/components/cijfers/balken-3d";
import { OVERLEDEN_KERNCIJFERS, RIJKSRECHERCHE_DODELIJK_PER_JAAR } from "@/lib/cijfers";

export const metadata: Metadata = {
  title: "Overleden na politieoptreden",
  description:
    "Wat bekend is over mensen die overleden na politieoptreden in Nederland: cijfers uit officiële onderzoeken, achtergronden en de zaak Mitch Henriquez.",
};

const BEKE_BEVINDINGEN = [
  "In de 50 onderzochte dodelijke incidenten (2016-2020) kwam de dood in 34 gevallen voort uit geweldsgebruik door de politie. Acht keer ging het om zelfdestructief gedrag, de rest om onwel wording of een ongeval.",
  "In 84 procent van de gevallen was sprake van meervoudige problematiek, zoals verward gedrag, middelengebruik en psychische, woon- of financiële problemen.",
  "Zes op de tien betrokkenen waren al bekend bij de hulpverlening. Bij 70 procent begon het incident met een melding die anderen bij de politie deden.",
  "De slachtoffers zijn vaker mannen tussen de 30 en 50 jaar met een niet-westerse migratieachtergrond; volgens de onderzoekers is groter onderzoek nodig om dat te duiden.",
];

export default function OverledenPage() {
  return (
    <main id="main" className="flex-1">
      <div className="mx-auto w-full max-w-[1200px] px-6 pb-28 pt-24 md:pt-28 lg:px-10">
        <h1 className="font-display text-4xl font-semibold leading-[1.08] tracking-tight md:text-5xl">
          Overleden na politieoptreden
        </h1>
        <p className="mt-6 max-w-[66ch] text-lg leading-relaxed text-muted">
          Mensen die overlijden bij of na een aanhouding, in een politiecel, na
          een achtervolging of na geweld door de politie. Nederland heeft geen
          openbaar centraal register van deze overlijdens. Wat er wél is,
          bundelen we hier: cijfers uit officiële onderzoeken, met de bron
          erbij.
        </p>

        <section className="mt-14">
          <h2 className="mb-6 font-display text-2xl font-semibold tracking-tight md:text-3xl">
            Onderzoeken naar dodelijke incidenten per jaar
          </h2>
          <Balken3D
            balken={RIJKSRECHERCHE_DODELIJK_PER_JAAR}
            bron="Bureau Beke (2016-2020, in opdracht van politie en Rijksrecherche) en de OM-jaarverslagen (2021-2025), samengebracht in het overzicht van Controle Alt Delete (dossier fatale incidenten)."
          />
          <p className="mt-4 max-w-[70ch] text-sm leading-relaxed text-muted-2">
            Deze cijfers gaan over de onderzoeken van de Rijksrecherche naar
            overlijdens in de context van politieoptreden. Niet elk overlijden
            wordt onderzocht: het Openbaar Ministerie bepaalt per zaak of de
            Rijksrecherche onderzoek doet.
          </p>
        </section>

        <section
          aria-label="Kerncijfers overleden na politieoptreden"
          className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          {OVERLEDEN_KERNCIJFERS.map((cijfer) => (
            <article
              key={cijfer.waarde + cijfer.label.slice(0, 20)}
              className="rounded-xl border border-line bg-surface p-6"
            >
              <p className="font-display text-3xl font-semibold tracking-tight">
                {cijfer.waarde}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {cijfer.label}
              </p>
              <p className="mt-4 text-xs leading-relaxed text-muted-2">
                Bron:{" "}
                <a
                  href={cijfer.bronUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4 hover:text-muted"
                >
                  {cijfer.bron}
                </a>
              </p>
            </article>
          ))}
        </section>

        <section className="mt-16">
          <h2 className="mb-6 font-display text-2xl font-semibold tracking-tight md:text-3xl">
            Wat het onderzoek laat zien
          </h2>
          <ul className="max-w-[74ch] space-y-4">
            {BEKE_BEVINDINGEN.map((bevinding) => (
              <li key={bevinding.slice(0, 24)} className="flex gap-3 leading-relaxed text-muted">
                <span
                  aria-hidden
                  className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-accent"
                />
                <span>{bevinding}</span>
              </li>
            ))}
          </ul>
          <p className="mt-5 max-w-[70ch] text-xs leading-relaxed text-muted-2">
            Bron: Bureau Beke, Fatale politie-incidenten (2022),{" "}
            <a
              href="https://bureaubeke.nl/wp-content/uploads/2022/02/Download_Bekereeks_Fatale_politie_incidenten.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:text-muted"
            >
              het volledige rapport
            </a>
            .
          </p>
        </section>

        <section className="mt-16">
          <h2 className="mb-6 font-display text-2xl font-semibold tracking-tight md:text-3xl">
            Een zaak die Nederland kent: Mitch Henriquez
          </h2>
          <article className="rounded-xl border border-line bg-surface p-6 md:p-8">
            <p className="max-w-[74ch] leading-relaxed text-muted">
              In juni 2015 arresteerde de politie in het Haagse Zuiderpark de
              42-jarige Mitch Henriquez, tijdens het festival Night at the
              Park. Agenten hielden hem in een nekklem. Hij overleed een dag
              later. De Rijksrecherche onderzocht de zaak; twee agenten werden
              vervolgd. De rechtbank Den Haag veroordeelde hen in 2017 tot een
              voorwaardelijke gevangenisstraf voor mishandeling met de dood tot
              gevolg. In 2019 sprak het gerechtshof één agent vrij en hield de
              veroordeling van de ander in stand. De Hoge Raad bevestigde die
              veroordeling in 2021. Dit is een van de zeldzame zaken waarin een
              strafrechtelijke veroordeling standhield.
            </p>
            <p className="mt-4 text-xs leading-relaxed text-muted-2">
              Bronnen:{" "}
              <a
                href="https://www.rechtspraak.nl/bekende-rechtszaken/mitch-henriquez"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 hover:text-muted"
              >
                rechtspraak.nl (bekende rechtszaken, met alle ECLI-nummers)
              </a>{" "}
              en{" "}
              <a
                href="https://nos.nl/artikel/2067517-hardhandige-arrestatie-werd-mitch-henriquez-fataal"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 hover:text-muted"
              >
                NOS
              </a>
              . De uitspraken zelf: ECLI:NL:HR:2021:211 en de uitspraken van
              rechtbank en hof die daar worden vermeld.
            </p>
          </article>
        </section>

        <section className="mt-16 max-w-[74ch]">
          <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
            Wat wij hiermee doen
          </h2>
          <p className="mt-4 leading-relaxed text-muted">
            Deze pagina groeit. Overlijdensgevallen zijn verspreid over
            nieuwsberichten, jaarverslagen en onderzoeksrapporten; een centraal
            openbaar register ontbreekt. Ken je een zaak die hier ontbreekt, of
            heb je zelf iets meegemaakt? Gebruik het{" "}
            <Link
              href="/melden"
              className="underline underline-offset-4 hover:text-foreground"
            >
              meldformulier
            </Link>{" "}
            of mail naar{" "}
            <a
              href="mailto:label@hot-shot.com"
              className="underline underline-offset-4 hover:text-foreground"
            >
              label@hot-shot.com
            </a>
            . We documenteren elke melding vertrouwelijk. Nabestaanden die de
            juridische weg willen bewandelen, vinden de routes (klacht,
            artikel 12 Sv, schadevergoeding) op de pagina{" "}
            <Link
              href="/juridisch"
              className="underline underline-offset-4 hover:text-foreground"
            >
              Juridische hulp
            </Link>
            .
          </p>
          <p className="mt-4 leading-relaxed text-muted">
            De volledige registratie van Controle Alt Delete, inclusief alle
            gedocumenteerde gevallen, staat in hun{" "}
            <a
              href="https://controlealtdelete.nl/dossier-politiedoden/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:text-foreground"
            >
              dossier fatale incidenten
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
