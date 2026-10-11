# Actieplatform Politiegeweld

Nieuwe site voor het Actieplatform Politiegeweld: meldingen vastleggen,
mensen ondersteunen en werken aan openbare verantwoording.

## Stack

Next.js 16 (App Router) + Tailwind 4 + Motion + GSAP + three.js (react-three-fiber)
+ Lenis. Alles gratis en open source. Uitrollen op Vercel.

## Lokaal draaien

```bash
pnpm install
pnpm dev        # ontwikkelserver op http://localhost:3000
```

## Controleren voor een commit

```bash
pnpm check      # typecheck + lint + build
```

## Structuur

- `src/app/` pagina's (home + melden, kaart, uitspraken, juridisch, chat, meedoen, privacy)
- `src/components/home/` secties van de homepage
- `src/components/site/` nav, footer, scroll en hulpcomponenten
- `src/components/ui/` basiscomponenten (marquee, tekst-reveal)

## Status

Fase 1 klaar: nieuwe basis en homepage.
Fase 2 klaar: echt meldformulier met opslag (Firebase Firestore, servers in
de EU) en een eigen meldingenkaart (Leaflet, vrije kaarttegels).
Fase 3 klaar: vraagbaak met een gratis AI-model (Google Gemini, gratis
tier). De sleutel staat als `GEMINI_API_KEY` in Vercel (alle omgevingen) en
lokaal in `.env.local`; die twee bestanden zijn geen onderdeel van git. De
API-route zit in `src/app/api/chat/route.ts`, met een fallback-keten van
modellen (eerst `gemini-flash-latest`, dan lite-modellen) en een zachte
limiet van 30 vragen per uur per bezoeker.

Fase 4a klaar: /juridisch met vijf routes (klacht politie, Nationale
ombudsman, artikel 12 Sv, Woo, schadevergoeding) en een generator die
modelbrieven in de browser opstelt (kopiëren of downloaden, niets wordt
opgeslagen). De route-uitleg is geverifieerd tegen primaire bronnen:
Wetboek van Strafvordering (art. 12-12l), Wet open overheid (art. 4.1 en
4.4), politie.nl/Uitvoeringsregeling klachtbehandeling en de Nationale
ombudsman. Zie `src/lib/modelbrieven.ts`.

Fase 4b klaar: /uitspraken met een doorzoekbare selectie van 15 echte
uitspraken over politieoptreden (strafzaken tegen agenten, beklag artikel
12 Sv, civiele aansprakelijkheidszaken). Alle gegevens (ECLI, instantie,
datum, zaaknummer) zijn gehaald uit de officiële Open Data van
rechtspraak.nl; de samenvattingen zijn daarop gebaseerd. De lijst staat in
`src/lib/uitspraken.ts` en groeit. Nieuwe uitspraak toevoegen: tekst
ophalen via `https://data.rechtspraak.nl/uitspraken/content?id=<ECLI>`,
samenvatting maken, item toevoegen.

Let op: de meldingen staan in een eigen Firestore-database met id `default`
(naast `(default)`), omdat de standaarddatabase op dit gratis project om
billing vraagt. De web-config staat in `src/lib/firebase.ts`; dat is geen
geheim. De beveiliging zit in `firestore.rules`:

- `meldingen`: alleen schrijven (met strenge validatie), nooit publiek lezen.
- `kaartpunten`: publiek leesbaar, alleen toevoegen, alleen afgeronde punten.

Nog te harden: misbruikbescherming op het formulier (bijv. Firebase App Check).

## Uitrollen

- Site: automatisch via Vercel bij elke push naar `main`.
- Firestore-regels: `firebase deploy --only firestore:rules` (staat in
  `firebase.json`, database `default`).

Daarna: fase 4 (modelbrieven en uitspraken-databank).
