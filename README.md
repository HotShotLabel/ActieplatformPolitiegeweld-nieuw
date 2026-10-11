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

Fase 4b klaar: /uitspraken met een doorzoekbare databank van 175 uitspraken
over politiebetrokkenheid, in beide richtingen: politie als verdachte
(agent vervolgd, beklag artikel 12 Sv, civiele zaken) en politie als
slachtoffer (geweld tegen politie). De curated kern (15 uitspraken met
eigen samenvatting) staat in `src/lib/uitspraken.ts`; de bulk (160
uitspraken met de officiële inhoudsindicatie) wordt gegenereerd door
`scripts/uitspraken-oogst.py` in `src/lib/uitspraken-bulk.ts`.

Fase 5 klaar: twee cijferpagina's. /overleden (overleden na politieoptreden:
Rijksrecherche-onderzoeken per jaar 2016-2025, cijfers van Bureau Beke en
Controle Alt Delete, achtergronden, de zaak Mitch Henriquez) en /cijfers
(politiegeweld in cijfers: geweldsincidenten per jaar, geweldsmiddelen
2025, gerichte schoten; 3D-staafdiagrammen). Alle cijfers uit officiële
rapportages, met bron per grafiek. De data staat in `src/lib/cijfers.ts`,
de grafiekcomponent in `src/components/cijfers/balken-3d.tsx`.

Let op: de meldingen staan in een eigen Firestore-database met id `default`
(naast `(default)`), omdat de standaarddatabase op dit gratis project om
billing vraagt. De web-config staat in `src/lib/firebase.ts`; dat is geen
geheim. Meldingen gaan via de server (Admin SDK, `FIREBASE_SERVICE_ACCOUNT`
als Vercel-env): `src/app/api/melden/route.ts` valideert, begrenst (10 per
uur per bezoeker) en schrijft; de database-regels staan alles dicht op
`kaartpunten` lezen na. Beheer van meldingen: /beheer (wachtwoord =
`ADMIN_TOKEN` uit de env; verwijderen wist ook het gekoppelde kaartpunt).

De uitspraken-bulk verversen: `python3 scripts/uitspraken-oogst.py`
(gebruikt de publieke zoek-API van uitspraken.rechtspraak.nl en de Open
Data; duurt een paar minuten).

Op de kaart heeft elke laag een eigen icoon in een badge (zichtbaar op
donker én licht): schild = politiebureau, zuilen = rechtbank, hamer =
rechterlijke uitspraak, bloem = overleden na politieoptreden,
waarschuwingsdriehoek = melding. De politie- en rechtbanklaag komen uit
`public/voorzieningen.json` (OpenStreetMap via `scripts/voorzieningen-oogst.py`).

De kaart draait op MapLibre GL met de gratis stijlen van OpenFreeMap
(geen API-sleutel, geen account). De worker wordt zelf gehost in
`public/maplibre-gl-worker.mjs`; dat is nodig omdat de worker-load onder
Turbopack anders faalt.

De kaartlaag 'overleden' verversen: `python3 scripts/cad-oogst.py` (haalt de
openbare database van Controle Alt Delete op, geocodeert plaatsen via PDOK,
schrijft `src/lib/cad-zaken.ts`; namen staan er bewust niet in).

## Uitrollen

- Site: automatisch via Vercel bij elke push naar `main`.
- Firestore-regels: `firebase deploy --only firestore:rules` (staat in
  `firebase.json`, database `default`).

Daarna: fase 4 (modelbrieven en uitspraken-databank).
