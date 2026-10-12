/* Aanvullingen op de overledenen: gevallen die (nog) niet in de
   CAD-database staan maar wel gedocumenteerd zijn in nieuwsberichten.
   Gecontroleerd tegen data.json op 12 oktober 2026. */

export interface AanvullingDood {
  id: string;
  datum: string;
  jaar: string;
  plaats: string;
  lat: number;
  lng: number;
  titel: string;
  toelichting: string;
  bronLabel: string;
  bronUrl: string;
}

export const AANVULLINGEN_DODEN: AanvullingDood[] = [
  {
    id: "kapellebrug-2026",
    datum: "25 juni 2026",
    jaar: "2026",
    plaats: "Kapellebrug",
    lat: 51.2516,
    lng: 4.0611,
    titel: "Man (28) uit Terneuzen overleed na crash tijdens politieachtervolging",
    toelichting:
      "Na een melding over een conflict in een woning gaf de politie een stopteken; de man negeerde dat en vluchtte. Hij raakte bij de Brouwerijstraat van de weg en overleed aan zijn verwondingen. Staat niet in de CAD-database (gecontroleerd 12-10-2026).",
    bronLabel: "Omroep Zeeland",
    bronUrl:
      "https://www.omroepzeeland.nl/nieuws/18567331/man-28-overleden-na-crash-tegen-boom-na-politieachtervolging",
  },
  {
    id: "spijkenisse-2025",
    datum: "13 december 2025",
    jaar: "2025",
    plaats: "Spijkenisse",
    lat: 51.8427,
    lng: 4.3429,
    titel: "Gedetineerde maakte einde aan zijn leven in cel op het politiebureau",
    toelichting:
      "Op het politiebureau van Spijkenisse maakte een gedetineerde een einde aan zijn leven; de Rijksrecherche deed onderzoek. Mogelijk niet in de CAD-database (die heeft anonieme records zonder plaats; niet vast te stellen).",
    bronLabel: "Rijnmond",
    bronUrl:
      "https://www.rijnmond.nl/nieuws/2121999/gedetineerde-maakt-einde-aan-leven-in-politiecel",
  },
];
