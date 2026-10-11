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

Fase 1: nieuwe basis en homepage. Daarna: meldformulier met opslag,
eigen meldingenkaart, vraagbaak en juridische modelbrieven.
