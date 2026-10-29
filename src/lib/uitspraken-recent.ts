import type { Uitspraak } from "./uitspraken";

/* Recente zaken uit de lokale rechtspraak-database die nog niet in de
   bulk-oogst zaten. Handmatig gecontroleerd op politie als dader/verantwoordelijke. */
export const UITSPRAKEN_RECENT: Uitspraak[] = [
  {
    ecli: "ECLI:NL:GHAMS:2026:2945",
    titel:
      "Beklag over niet-vervolging van verbalisanten in politieonderzoek 13 Adelanto afgewezen",
    instantie: "Gerechtshof Amsterdam",
    datum: "2026-10-15",
    zaaknummer: "K25/230438",
    categorie: "beklag-12sv",
    uitkomst: "Beklag afgewezen",
    samenvatting:
      "Artikel 12 Sv: afwijzing van het beklag over niet-vervolging van betrokken verbalisanten en officier(en) van justitie in het politieonderzoek 13 Adelanto, ter zake van valsheid in geschrift en het valselijk opmaken van ambtsedige processen-verbaal.",
    samenvattingBron: "inhoudsindicatie",
  },
  {
    ecli: "ECLI:NL:RBDHA:2026:30168",
    titel:
      "Politieagent veroordeeld voor verkeersongeval met aanmerkelijke schuld tijdens dienst",
    instantie: "Rechtbank Den Haag",
    datum: "2026-10-13",
    zaaknummer: "09/250534-25",
    categorie: "agent-vervolgd",
    uitkomst: "Veroordeling (taakstraf)",
    samenvatting:
      "Veroordeling voor artikel 6 WVW: aanmerkelijke schuld aan het veroorzaken van een verkeersongeval tijdens dienst als politieagent. Opgelegd is een taakstraf van 80 uur, zonder ontzegging van de bevoegdheid om motorrijtuigen te besturen.",
    samenvattingBron: "inhoudsindicatie",
  },
  {
    ecli: "ECLI:NL:GHDHA:2026:2825",
    titel:
      "Politieagent vrijgesproken van onbevoegde bevragingen in het politiesysteem",
    instantie: "Gerechtshof Den Haag",
    datum: "2026-09-09",
    zaaknummer: "22-003468-24",
    categorie: "agent-vervolgd",
    uitkomst: "Vrijspraak",
    samenvatting:
      "Vrijspraak van computervredebreuk (artikel 138 Sr). De verdachte, werkzaam als politieagent, was tenlastegelegd dat hij onbevoegde bevragingen had gedaan in het politiesysteem. De wederrechtelijkheid van die bevragingen kon niet worden bewezen.",
    samenvattingBron: "inhoudsindicatie",
  },
];
