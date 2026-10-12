export interface ReeksPunt {
  label: string;
  waarde: number;
}

export interface CijferBlok {
  titel: string;
  waarde: string;
  toelichting: string;
  bron: string;
  bronUrl?: string;
}

/* Alle cijfers komen uit de officiële rapportages van de politie
   (Geweldsaanwendingen door politieambtenaren 2025), de Kerncijfers politie
   en de monitoringsrapporten van Bureau Beke en Controle Alt Delete, zoals
   hieronder per blok vermeld. Niets is geschat of verzonnen. */

export const GEWELDSINCIDENTEN_PER_JAAR: ReeksPunt[] = [
  { label: "2021", waarde: 18477 },
  { label: "2022", waarde: 20667 },
  { label: "2023", waarde: 22454 },
  { label: "2024", waarde: 22732 },
  { label: "2025", waarde: 25163 },
];

export const GEWELDSMIDDELEN_2025: ReeksPunt[] = [
  { label: "Fysiek", waarde: 26502 },
  { label: "Anders", waarde: 7854 },
  { label: "Wapenstok", waarde: 3473 },
  { label: "Vuurwapen", waarde: 1679 },
  { label: "Spuugmasker", waarde: 1511 },
  { label: "Stroomstoot", waarde: 1481 },
  { label: "Pepperspray", waarde: 767 },
  { label: "Diensthond", waarde: 172 },
];

export const GERICHTE_SCHOTEN_PER_JAAR: ReeksPunt[] = [
  { label: "2022", waarde: 85 },
  { label: "2023", waarde: 177 },
  { label: "2024", waarde: 219 },
  { label: "2025", waarde: 212 },
];

/* Klachten over geweldstoepassing per jaar, uit de Woo-documenten
   "geweldsaanwendingen door politieambtenaren" (IAT-analyse, politie.nl).
   2021 is tot en met augustus. */
export const KLACHTEN_GEWELD_PER_JAAR: ReeksPunt[] = [
  { label: "2019", waarde: 550 },
  { label: "2020", waarde: 609 },
  { label: "2021*", waarde: 407 },
];

export const RIJKSRECHERCHE_DODELIJK_PER_JAAR: ReeksPunt[] = [
  { label: "2016", waarde: 9 },
  { label: "2017", waarde: 10 },
  { label: "2018", waarde: 9 },
  { label: "2019", waarde: 10 },
  { label: "2020", waarde: 16 },
  { label: "2021", waarde: 12 },
  { label: "2022", waarde: 20 },
  { label: "2023", waarde: 7 },
  { label: "2024", waarde: 11 },
  { label: "2025", waarde: 22 },
];

export const CIJFERBLOKKEN: CijferBlok[] = [
  {
    titel: "Gegronde klachten over geweld",
    waarde: "6",
    toelichting:
      "Klachten over politiegeweld die in 2020 door de klachtencommissie gegrond werden verklaard (van de 22 die in de tweede fase werden behandeld). In 2019 was dat een enkele; in 2021 (t/m augustus) werden 4 klachten in de tweede fase behandeld.",
    bron: "Woo-documenten geweldsaanwendingen door politieambtenaren 2023 (politie.nl)",
    bronUrl:
      "https://www.politie.nl/wet-open-overheid/woo-verzoeken/staf-korpsleiding/woo-verzoeken-per-jaar/2023/2023-geweldsaanwendingen-door-politieambtenaren.html",
  },
  {
    titel: "Geweldsincidenten in 2025",
    waarde: "25.163",
    toelichting:
      "Incidenten waarbij de politie geweld gebruikte. Bij die incidenten wendden 12.681 politieambtenaren samen 39.726 keer geweld aan en gebruikten zij 45.779 keer een geweldsmiddel.",
    bron: "Rapportage Geweldsaanwendingen door politieambtenaren 2025 (politie.nl) en Kerncijfers politie",
    bronUrl:
      "https://www.politie.nl/informatie/cijfers-politiegeweld-hoeveel-geweld-gebruikt-de-politie.html",
  },
  {
    titel: "Aandeel van alle incidenten",
    waarde: "0,95%",
    toelichting:
      "Van alle 2.674.702 incidenten waarbij de politie in 2025 ter plaatse kwam, gebruikte zij in 0,95 procent van de gevallen geweld.",
    bron: "Rapportage Geweldsaanwendingen door politieambtenaren 2025 (politie.nl)",
    bronUrl:
      "https://www.politie.nl/nieuws/2026/mei/13/00-politie-gebruikt-vaker-geweld.html",
  },
  {
    titel: "Geweld tegen politiemedewerkers in 2025",
    waarde: "12.896",
    toelichting:
      "Keer dat politiemedewerkers in 2025 met agressie en geweld werden geconfronteerd. Geweld tegen en door politieambtenaren kunnen in hetzelfde incident voorkomen.",
    bron: "Kerncijfers politie (halfjaarbericht 2026)",
    bronUrl: "https://www.tweedekamer.nl/downloads/document?id=2026D35405",
  },
  {
    titel: "Beoordeling van geweldsregistraties (2025)",
    waarde: "369",
    toelichting:
      "Van de 2.238 geweldsregistraties werden 1.686 beoordeeld. Bij 1.314 daarvan paste het geweld binnen het wettelijke kader, bij 369 niet of ten dele.",
    bron: "Rapportage Geweldsaanwendingen door politieambtenaren 2025 (politie.nl)",
  },
];

export const OVERLEDEN_KERNCIJFERS = [
  {
    waarde: "gemiddeld 10",
    label: "mensen per jaar overlijden binnen de context van een politieoptreden",
    bron: "Bureau Beke, Fatale politie-incidenten (2022), in opdracht van politie en Rijksrecherche",
    bronUrl: "https://bureaubeke.nl/publicaties/fatale-politie-incidenten-2/",
  },
  {
    waarde: "34 van 50",
    label:
      "onderzochte dodelijke incidenten (2016-2020) kwam voort uit geweldsgebruik door de politie",
    bron: "Bureau Beke, Fatale politie-incidenten (2022)",
    bronUrl: "https://bureaubeke.nl/publicaties/fatale-politie-incidenten-2/",
  },
  {
    waarde: "minimaal 116",
    label:
      "mensen overleden tussen 2016 en november 2025 bij of na een aanhouding (registratie Controle Alt Delete)",
    bron: "Controle Alt Delete, dossier fatale incidenten",
    bronUrl: "https://controlealtdelete.nl/dossier-politiedoden/",
  },
  {
    waarde: "minimaal 78",
    label:
      "van hen overleed na politiegeweld (registratie Controle Alt Delete, eigen criteria)",
    bron: "Controle Alt Delete, dossier fatale incidenten",
    bronUrl: "https://controlealtdelete.nl/dossier-politiedoden/",
  },
  {
    waarde: "0",
    label:
      "politieambtenaren sinds 2016 veroordeeld voor politiegeweld met een dodelijke afloop (volgens Controle Alt Delete; twee werden vervolgd)",
    bron: "Controle Alt Delete, dossier fatale incidenten",
    bronUrl: "https://controlealtdelete.nl/dossier-politiedoden/",
  },
];
