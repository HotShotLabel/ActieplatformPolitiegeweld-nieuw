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

Daarna: fase 3 (vraagbaak met gratis AI) en fase 4 (modelbrieven en
uitspraken-databank).
