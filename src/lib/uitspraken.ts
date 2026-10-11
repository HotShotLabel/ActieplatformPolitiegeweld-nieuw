import { UITSPRAKEN_BULK } from "./uitspraken-bulk";

export type UitspraakCategorie =
  | "agent-vervolgd"
  | "beklag-12sv"
  | "strafzaak-burger"
  | "geweld-tegen-politie"
  | "civiel"
  | "overig";

export interface Uitspraak {
  ecli: string;
  titel: string;
  instantie: string;
  datum: string;
  zaaknummer: string;
  categorie: UitspraakCategorie;
  uitkomst?: string;
  samenvatting: string;
  samenvattingBron?: "platform" | "inhoudsindicatie";
}

export const CATEGORIE_LABEL: Record<UitspraakCategorie, string> = {
  "agent-vervolgd": "Agent vervolgd",
  "beklag-12sv": "Beklag artikel 12 Sv",
  "strafzaak-burger": "Strafzaak tegen burger",
  "geweld-tegen-politie": "Geweld tegen politie",
  civiel: "Civiele zaak",
  overig: "Overig",
};

/* De richting van de zaak: wie staat er terecht of moet zich verantwoorden? */
export type UitspraakRichting = "politie-verdachte" | "burger-verdachte" | "overig";

export const RICHTING_LABEL: Record<UitspraakRichting, string> = {
  "politie-verdachte": "Politie als verdachte",
  "burger-verdachte": "Burger als verdachte",
  overig: "Overig",
};

export function richtingVan(uitspraak: Uitspraak): UitspraakRichting {
  switch (uitspraak.categorie) {
    case "agent-vervolgd":
    case "beklag-12sv":
    case "civiel":
      return "politie-verdachte";
    case "geweld-tegen-politie":
    case "strafzaak-burger":
      return "burger-verdachte";
    default:
      return "overig";
  }
}

export function rechtspraakUrl(ecli: string): string {
  return `https://uitspraken.rechtspraak.nl/details?id=${encodeURIComponent(ecli)}`;
}

/*
  Curated selectie. Elke samenvatting is gemaakt op basis van de officiële
  tekst van de uitspraak zelf (via de Open Data van rechtspraak.nl); lees
  altijd de volledige uitspraak via de link. Deze lijst groeit.
*/
const CURATED: Uitspraak[] = [
  {
    ecli: "ECLI:NL:GHARL:2025:6354",
    titel: "Agent in hoger beroep veroordeeld voor vuistslag bij aanhouding",
    instantie: "Gerechtshof Arnhem-Leeuwarden (Blauwe Kamer)",
    datum: "2025-10-09",
    zaaknummer: "21-003684-24",
    categorie: "agent-vervolgd",
    uitkomst: "Veroordeling (taakstraf)",
    samenvatting:
      "Het hof achtte bewezen dat een politieagent tijdens een aanhouding een man met kracht met zijn gebalde vuist tegen zijn gezicht sloeg. De agent verklaarde dat het een verkeerd uitgevoerde afleidingstechniek (atemi) was, maar dat vond het hof niet aannemelijk: getuigen zagen een bewuste vuistslag. Dit handelen was volgens het hof evident niet conform de geweldsinstructie en de Politiewet, en kan het vertrouwen van burgers in de politie aantasten. Straf: taakstraf van 60 uur, waarvan 30 uur voorwaardelijk met een proeftijd van twee jaar.",
  },
  {
    ecli: "ECLI:NL:GHAMS:2023:984",
    titel: "Beklag over wapenstokgebruik bij een vechtpartij afgewezen",
    instantie: "Gerechtshof Amsterdam",
    datum: "2023-03-09",
    zaaknummer: "K22/230237",
    categorie: "beklag-12sv",
    uitkomst: "Beklag ongegrond",
    samenvatting:
      "Het hof toetste het gebruik van de wapenstok rond een vechtpartij bij een uitgaansgelegenheid. De slagen waren volgens het hof onder de gegeven omstandigheden niet buitensporig, en van de agenten kon niet worden gevergd dat zij anders hadden gehandeld. Geen sprake van wederrechtelijke mishandeling, beklag ongegrond.",
  },
  {
    ecli: "ECLI:NL:GHAMS:2024:1801",
    titel: "Vuurwapen en politiehond bij aanhouding overvallers rechtmatig",
    instantie: "Gerechtshof Amsterdam",
    datum: "2024-07-02",
    zaaknummer: "K22/230327",
    categorie: "beklag-12sv",
    uitkomst: "Beklag ongegrond",
    samenvatting:
      "Na een gewapende overval in Amsterdam schoot de politie op vluchtende verdachten in Broek in Waterland en zette een politiehond in. Het hof oordeelde dat de dreiging onverkort aanwezig was, dat de agenten gerechtigd waren te schieten en dat er geen minder ingrijpende middelen voorhanden waren. Ook de inzet van de politiehond was geoorloofd. Beklag ongegrond.",
  },
  {
    ecli: "ECLI:NL:RBDHA:2025:21376",
    titel: "Politie aansprakelijk voor letsel door beenklem bij aanhouding",
    instantie: "Rechtbank Den Haag",
    datum: "2025-11-12",
    zaaknummer: "C/09/662824",
    categorie: "civiel",
    uitkomst: "Politie aansprakelijk",
    samenvatting:
      "Bij een aanhouding in Den Haag in 2022 is een beenklem toegepast; de man liep rupturen van de quadricepspezen van beide bovenbenen op. Na een NFI-rapport achtte de rechtbank het voorshands bewezen dat het letsel door de beenklem met te veel druk ontstond en bood de politie de kans tegenbewijs te leveren. Dat lukte niet: de rechtbank verklaarde de politie aansprakelijk voor de schade. De hoogte van het voorschot volgt later.",
  },
  {
    ecli: "ECLI:NL:RBAMS:2025:1753",
    titel: "Geen straf voor mishandeling agent: eerst disproportioneel politiegeweld",
    instantie: "Rechtbank Amsterdam",
    datum: "2025-03-20",
    zaaknummer: "13/218200-24 (A) + 13/330056-24 (B)",
    categorie: "strafzaak-burger",
    uitkomst: "Geen straf opgelegd",
    samenvatting:
      "Op het Centraal Station in Amsterdam mishandelde een man een politieagente en bedreigde hij een tweede agente. Uit de camerabeelden bleek dat die tweede agente hem meermalen in het gezicht stompte toen hij haar collega al had losgelaten, en dat zij haar voet op zijn gezicht en haar knie in zijn nek zette terwijl hij al onder controle was. De rechtbank noemde dat geweld disproportioneel en legde geen straf op; hij moet wel 500 euro schadevergoeding betalen.",
  },
  {
    ecli: "ECLI:NL:RBMNE:2024:5976",
    titel: "Hoofdagent vrijgesproken na wapenstokslagen (Blauwe Kamer-zaak)",
    instantie: "Rechtbank Midden-Nederland",
    datum: "2024-10-28",
    zaaknummer: "16.333522.22 (P)",
    categorie: "agent-vervolgd",
    uitkomst: "Vrijspraak",
    samenvatting:
      "Een hoofdagent stond terecht voor het schenden van de geweldsinstructie door in de nacht van 17 december 2022 in Amersfoort driemaal met zijn wapenstok richting het lichaam en hoofd van een man te slaan. De rechtbank oordeelde dat hij gebruik mocht maken van zijn afweerbevoegdheid, dat de slagen als proportioneel, redelijk en gematigd moesten worden aangemerkt en dat hij conform de geweldsinstructie handelde. Vrijspraak.",
  },
  {
    ecli: "ECLI:NL:GHAMS:2024:252",
    titel: "Vuistslagen en politiehond bij aanhouding waren rechtmatig",
    instantie: "Gerechtshof Amsterdam",
    datum: "2024-01-30",
    zaaknummer: "K22/230178",
    categorie: "beklag-12sv",
    uitkomst: "Beklag ongegrond",
    samenvatting:
      "Beklag over vuistslagen in het gezicht en de inzet van een politiehond bij een aanhouding in een woning. Het hof oordeelde dat er sprake was van hevig verzet en gevaar voor de agenten, en dat er door de krappe ruimte geen minder ingrijpend middel voorhanden was. Het geweld bleef binnen de geldende kaders. Beklag ongegrond.",
  },
  {
    ecli: "ECLI:NL:RBAMS:2023:478",
    titel: "Politie aansprakelijk voor klappen in het gezicht tijdens vervoer",
    instantie: "Rechtbank Amsterdam",
    datum: "2023-02-03",
    zaaknummer: "C/13/718807 / HA ZA 22-469",
    categorie: "civiel",
    uitkomst: "Politie aansprakelijk",
    samenvatting:
      "Een geboeide man werd tijdens het vervoer naar het politiebureau in zijn gezicht geslagen. De politie betwistte en voerde geen rechtvaardigingsgrond aan voor het geweld. De rechtbank oordeelde dat de onrechtmatigheid daarmee vaststond en dat de politie als werkgever aansprakelijk is voor de schade; de omvang wordt in een schadestaatprocedure bepaald.",
  },
  {
    ecli: "ECLI:NL:GHAMS:2022:3869",
    titel: "Letsel bij aanhouding wees niet op buitensporig geweld",
    instantie: "Gerechtshof Amsterdam",
    datum: "2022-10-24",
    zaaknummer: "K22/230131",
    categorie: "beklag-12sv",
    uitkomst: "Beklag ongegrond",
    samenvatting:
      "Een man liep letsel op bij zijn aanhouding op de Dam in Zaandam in 2021. Het hof oordeelde dat het dossier geen steun bevatte voor de stelling dat het letsel op buitensporig politiegeweld wees: de man verloor onverwacht zijn evenwicht bij een aanhoudingstechniek en nam de agenten mee in zijn val. Beklag ongegrond.",
  },
  {
    ecli: "ECLI:NL:RBMNE:2023:3245",
    titel: "Agent vrijgesproken van mishandeling bij aanhouding (Blauwe Kamer-zaak)",
    instantie: "Rechtbank Midden-Nederland",
    datum: "2023-07-04",
    zaaknummer: "08-071876-21 (P)",
    categorie: "agent-vervolgd",
    uitkomst: "Vrijspraak",
    samenvatting:
      "Een politieagent werd ervan beschuldigd dat hij een man bij een aanhouding buiten heterdaad (Diepenveen, september 2020) meermalen in het gezicht had geslagen. De rechtbank oordeelde dat het toegepaste geweld binnen de grenzen van proportionaliteit en subsidiariteit bleef en dat de agent in de rechtmatige uitoefening van zijn bediening handelde. Vrijspraak.",
  },
  {
    ecli: "ECLI:NL:GHAMS:2018:1172",
    titel: "Schot op benen was noodweer: beklag ongegrond",
    instantie: "Gerechtshof Amsterdam",
    datum: "2018-04-04",
    zaaknummer: "K17/230404",
    categorie: "beklag-12sv",
    uitkomst: "Beklag ongegrond",
    samenvatting:
      "Bij politieoptreden in Hoogkarspel in 2016 schoot een politieambtenaar op de benen van een man; een deel van zijn rechterbeen moest worden geamputeerd. Het hof oordeelde dat lichtere geweldsmiddelen met oplopende intensiteit geen enkel effect hadden en dat het schieten op de benen noodzakelijk en proportioneel was. Een beroep op noodweer zou slagen, dus vervolging had geen kans. Beklag ongegrond.",
  },
  {
    ecli: "ECLI:NL:RBDHA:2020:7032",
    titel: "Agent vrijgesproken van mishandeling en onjuist proces-verbaal",
    instantie: "Rechtbank Den Haag",
    datum: "2020-07-30",
    zaaknummer: "09/837071-19",
    categorie: "agent-vervolgd",
    uitkomst: "Vrijspraak",
    samenvatting:
      "Een politieagent werd verdacht van mishandeling bij een aanhouding in Den Haag en van het opmaken van een onjuist proces-verbaal. De rechtbank oordeelde dat het gebruikte geweld binnen de grenzen van proportionaliteit en subsidiariteit bleef en dat niet kon worden vastgesteld dat hij bewust onjuistheden had vermeld. Vrijspraak.",
  },
  {
    ecli: "ECLI:NL:GHAMS:2018:2431",
    titel: "Vuistslag in gezicht ontoelaatbaar, maar vervolging niet gerechtvaardigd",
    instantie: "Gerechtshof Amsterdam",
    datum: "2018-07-16",
    zaaknummer: "K17/230367",
    categorie: "beklag-12sv",
    uitkomst: "Beklag ongegrond",
    samenvatting:
      "Beklag over pepperspray, tegen de grond werken en een vuistslag in het gezicht bij een aanhouding na een achtervolging. Het hof vond de vuistslag in het gezicht in beginsel niet toelaatbaar en sloot niet uit dat de strafrechter dit als mishandeling zou zien, maar oordeelde dat vervolging voor alleen die klap niet gerechtvaardigd was. Beklag ongegrond.",
  },
  {
    ecli: "ECLI:NL:GHDHA:2016:3418",
    titel: "Agent in hoger beroep vrijgesproken van mishandeling arrestant",
    instantie: "Gerechtshof Den Haag",
    datum: "2016-11-17",
    zaaknummer: "22-000447-16",
    categorie: "agent-vervolgd",
    uitkomst: "Vrijspraak (hoger beroep)",
    samenvatting:
      "Een politieagent stond terecht voor het gebruik van pepperspray en een vuistslag bij de aanhouding van een arrestant in Den Haag. De rechtbank veroordeelde hem eerst tot een geldboete; het hof sprak hem in hoger beroep vrij. Het toegepaste geweld was volgens het hof niet disproportioneel en niet in strijd met het subsidiariteitsbeginsel.",
  },
  {
    ecli: "ECLI:NL:RBDHA:2024:489",
    titel: "Schot in de knie bij coronademonstratie: geen aansprakelijkheid",
    instantie: "Rechtbank Den Haag",
    datum: "2024-01-31",
    zaaknummer: "C/09/640202 / HA ZA 22-1073",
    categorie: "civiel",
    uitkomst: "Vorderingen afgewezen",
    samenvatting:
      "Tijdens de coronademonstratie in Rotterdam op 19 november 2021 werd een man door een ME'er in zijn knie geschoten. De rechtbank oordeelde dat het schot in strijd was met de Ambtsinstructie, maar dat de schutter zich op noodweer kon beroepen vanwege de dreigende situatie. Omdat er een rechtvaardigingsgrond bestond, werd de politie niet aansprakelijk gehouden.",
  },
  {
    ecli: "ECLI:NL:GHSHE:2012:BX4873",
    titel: "Aanwijzingen voor te veel geweld, toch geen vervolging",
    instantie: "Gerechtshof 's-Hertogenbosch",
    datum: "2012-08-14",
    zaaknummer: "K11/0424",
    categorie: "beklag-12sv",
    uitkomst: "Beklag afgewezen",
    samenvatting:
      "Beklag over geweld bij een aanhouding in Someren in 2009. Het hof zag aanwijzingen dat de politieambtenaar de grenzen van de proportionaliteit in meer of mindere mate had overschreden, maar vond alsnog vervolgen onvoldoende opportuun: er was al tuchtrechtelijk gereageerd en de ambtenaar werkte niet meer bij de politie. Het beklag werd afgewezen.",
  },
];

/* Samengevoegd: curated (eigen samenvatting) + bulk (officiële
   inhoudsindicatie), zie scripts/uitspraken-oogst.py. */
export const UITSPRAKEN: Uitspraak[] = [...CURATED, ...UITSPRAKEN_BULK];
