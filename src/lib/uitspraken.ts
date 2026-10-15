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
    ecli: "ECLI:NL:GHSGR:2012:BW7425",
    titel:
      "Politieagent verkracht en vermoordt buurmeisje (12); 18 jaar cel en tbs",
    instantie: "Gerechtshof 's-Gravenhage",
    datum: "2012-06-05",
    zaaknummer: "22-006088-10",
    categorie: "agent-vervolgd",
    samenvatting:
      "Zaak-Milly Boele (Dordrecht, 10 maart 2010). Het hof acht bewezen dat de verdachte, surveillant bij de politie Rotterdam-Rijnmond en buurman van het slachtoffer, het 12-jarige meisje met een verhaal over katten naar zijn woning lokte, haar oraal verkrachtte, met zijn broeksriem wurgde en haar lichaam in zijn tuin begroef. Veroordeling voor moord, verkrachting, vrijheidsberoving en het verbergen van het lichaam: 18 jaar gevangenisstraf en tbs met dwangverpleging. In eerste aanleg (ECLI:NL:RBDOR:2010:BO5167) was ontucht bewezen geacht; de Hoge Raad verwierp het cassatieberoep (ECLI:NL:HR:2013:853), waarmee de veroordeling definitief werd.",
    samenvattingBron: "platform",
  },
  {
    ecli: "ECLI:NL:GHARN:2010:BL2868",
    titel: "Politieagente schiet ex-partner dood met dienstwapen; 10 jaar cel",
    instantie: "Gerechtshof Arnhem",
    datum: "2010-02-08",
    zaaknummer: "24-001667-09",
    categorie: "agent-vervolgd",
    samenvatting:
      "Een politieagente (brigadier, Flevoland) schoot in december 2008 in Almere haar ex-partner met haar dienstwapen in het hoofd en werd veroordeeld voor moord tot 10 jaar gevangenisstraf. Het gebruik van het dienstwapen werkte strafverzwarend; in eerste aanleg (ECLI:NL:RBZLY:2009:BI2002) was dezelfde straf opgelegd.",
    samenvattingBron: "platform",
  },
  {
    ecli: "ECLI:NL:HR:2021:211",
    titel: "Nekklem Den Haag (zaak-Mitch Henriquez): agent veroordeeld; Hoge Raad houdt stand",
    instantie: "Hoge Raad",
    datum: "2021-02-16",
    zaaknummer: "19/03157",
    categorie: "agent-vervolgd",
    samenvatting:
      "Mitch Henriquez (42) overleed in juni 2015 na een nekklem bij zijn aanhouding tijdens een muziekfestival in het Zuiderpark in Den Haag. Eerder: rechtbank Den Haag 21-12-2017 (ECLI:NL:RBDHA:2017:15095/15096) veroordeelde twee agenten voor mishandeling de dood ten gevolge hebbend (voorwaardelijk); hof Den Haag 19-06-2019 (ECLI:NL:GHDHA:2019:1532) handhaafde de veroordeling van de agent die de nekklem toepaste. De Hoge Raad verwierp het beroep op noodweer: de nekklem was te lang en te krachtig.",
    samenvattingBron: "platform",
  },
  {
    ecli: "ECLI:NL:RBMNE:2023:6396",
    titel: "Agent schiet op tractor met minderjarige bestuurder (Heerenveen); veroordeeld",
    instantie: "Rechtbank Midden-Nederland (Blauwe Kamer)",
    datum: "2023-12-01",
    zaaknummer: "16-246478-22",
    categorie: "agent-vervolgd",
    samenvatting:
      "Tijdens het boerenprotest bij Heerenveen (5 juli 2022) schoot een agent op een tractor met daarin een 16-jarige bestuurder; de kogel trof de deurstijl op hoofthoogte. De rechtbank veroordeelde de agent voor poging tot doodslag tot een voorwaardelijke gevangenisstraf van een maand en een taakstraf van 80 uur.",
    samenvattingBron: "platform",
  },
  {
    ecli: "ECLI:NL:RBROT:2014:9992",
    titel: "Agent schiet automobilist bij alcoholcontrole (Eendrachtsweg); veroordeeld",
    instantie: "Rechtbank Rotterdam",
    datum: "2014-12-10",
    zaaknummer: "10/961046-13",
    categorie: "agent-vervolgd",
    samenvatting:
      "Bij een alcoholcontrole aan de Eendrachtsweg in Rotterdam (augustus 2012) schoot een agent een 29-jarige automobilist in bovenlichaam/rug; het slachtoffer hield er een dwarslaesie aan over. De rechtbank verwierp het beroep op noodweer en veroordeelde de agent voor poging tot doodslag tot een maand gevangenisstraf en 240 uur werkstraf.",
    samenvattingBron: "platform",
  },
  {
    ecli: "ECLI:NL:RBROT:2015:6970",
    titel: "Ex-politieagenten schieten 'zonder noodzaak' en plegen meineed; veroordeeld",
    instantie: "Rechtbank Rotterdam",
    datum: "2015-10-01",
    zaaknummer: "10/775009-13",
    categorie: "agent-vervolgd",
    samenvatting:
      "Een ex-politieagent werd veroordeeld voor meermalen poging tot doodslag en meineed: hij en zijn medeverdachte (zusterzaak ECLI:NL:RBROT:2015:6972) schoten zonder enige noodzaak op personen en legden daarover leugenachtige verklaringen af.",
    samenvattingBron: "platform",
  },
  {
    ecli: "ECLI:NL:GHDHA:2016:2133",
    titel: "Ex-politieagent in hoger beroep veroordeeld voor poging tot doodslag en meineed",
    instantie: "Gerechtshof Den Haag",
    datum: "2016-07-15",
    zaaknummer: "22004572-15",
    categorie: "agent-vervolgd",
    samenvatting:
      "Het hof achtte bewezen dat de verdachte, toen hij nog agent was, op iemand schoot en daarover meineed pleegde. Hoger beroep bevestigde de veroordeling van de rechtbank wegens poging tot doodslag en meineed.",
    samenvattingBron: "platform",
  },
  {
    ecli: "ECLI:NL:GHDHA:2021:717",
    titel: "Agent breekt oogkas en neus van aangehouden persoon; veroordeeld in hoger beroep",
    instantie: "Gerechtshof Den Haag",
    datum: "2021-04-20",
    zaaknummer: "2200409319",
    categorie: "agent-vervolgd",
    samenvatting:
      "Een politieagent met leidinggevende functie sloeg een aangehouden persoon met kracht in het gezicht (augustus 2017, Rotterdam). Gevolg: gebroken oogkas, gebroken neus en hersenschudding. Het hof vernietigde de vrijspraak en veroordeelde de agent voor zware mishandeling tot een taakstraf van 180 uur, een voorwaardelijke gevangenisstraf van een maand en schadevergoeding.",
    samenvattingBron: "platform",
  },
  {
    ecli: "ECLI:NL:RBLIM:2015:6059",
    titel: "Agent arrestatie-eenheid raakt bijrijder bij schot; twee jaar cel",
    instantie: "Rechtbank Limburg",
    datum: "2015-07-17",
    zaaknummer: "03/866220-15",
    categorie: "agent-vervolgd",
    samenvatting:
      "Bij een actie van de Arrestatie-Eenheid in Kerkrade (augustus 2013) schoot een agent op de bestuurder van een personenauto maar raakte de bijrijder. De rechtbank veroordeelde de agent voor poging tot doodslag tot twee jaar gevangenisstraf.",
    samenvattingBron: "platform",
  },
  {
    ecli: "ECLI:NL:RBMNE:2024:3662",
    titel: "Blauwe Kamer: agent die Wessel (18) doodschoot in Delft; bewezen doodslag, ontslag rechtsvervolging",
    instantie: "Rechtbank Midden-Nederland (Blauwe Kamer)",
    datum: "2024-06-14",
    zaaknummer: "16-255148-22",
    categorie: "agent-vervolgd",
    samenvatting:
      "In de nacht van 7 op 8 oktober 2018 schoot een agent in de Breestraat in Delft vijf keer; de 18-jarige Wessel uit Zoetermeer werd dodelijk geraakt. Vervolging kwam er pas na een artikel 12 Sv-procedure (hof Amsterdam 31-01-2022, ECLI:NL:GHAMS:2022:207). De rechtbank achtte doodslag bewezen maar ontsloeg de agent van rechtsvervolging (noodweer en handelen conform de geweldsinstructie).",
    samenvattingBron: "platform",
  },
  {
    ecli: "ECLI:NL:RBROT:2025:12186",
    titel: "Oud-politieagente bereidt moord op ex-partner voor; zeven jaar cel",
    instantie: "Rechtbank Rotterdam",
    datum: "2025-10-17",
    zaaknummer: "10/170466-24",
    categorie: "agent-vervolgd",
    samenvatting:
      "Een oud-politieagente stond met vijf anderen terecht voor de voorbereiding en uitlokking van de moord op haar ex-partner. De rechtbank veroordeelde haar tot zeven jaar gevangenisstraf.",
    samenvattingBron: "platform",
  },
  {
    ecli: "ECLI:NL:OGHACMB:2026:218",
    titel: "Politieagenten Caribisch deel Koninkrijk veroordeeld voor dodelijk politiegeweld",
    instantie: "Gemeenschappelijk Hof van Justitie (Aruba, Curaçao, Sint Maarten)",
    datum: "2026-07-16",
    zaaknummer: "H-63/25",
    categorie: "agent-vervolgd",
    samenvatting:
      "Verbalisanten werden veroordeeld voor medeplegen van dodelijk politiegeweld: na een gewapende overval schoten zij bij de aanhouding van de verdachten, met een dodelijke afloop. Zie ook de aanverwante zaken ECLI:NL:OGEAA:2026:73 en 74 (dodelijk schietincident na achtervolging, Aruba).",
    samenvattingBron: "platform",
  },
  {
    ecli: "ECLI:NL:RBROT:2021:10236",
    titel: "Oud-politieagent veroordeeld voor ontucht met vier minderjarige jongens",
    instantie: "Rechtbank Rotterdam",
    datum: "2021-10-20",
    zaaknummer: "10/775505-21",
    categorie: "agent-vervolgd",
    samenvatting:
      "Een voormalig politieagent werd veroordeeld voor ontucht met vier minderjarige jongens (onder wie slachtoffers van 8-13 jaar) in de gemeente Molenlanden. Ook was er een eerdere veroordeling voor het versturen van beeldmateriaal naar een 11-jarige en schending van het ambtsgeheim.",
    samenvattingBron: "platform",
  },
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
   inhoudsindicatie), zie scripts/uitspraken-oogst.py. Dubbelen op ECLI
   worden eruit gefilterd. */
const samengevoegd: Uitspraak[] = [...CURATED, ...UITSPRAKEN_BULK];
export const UITSPRAKEN: Uitspraak[] = samengevoegd.filter(
  (uitspraak, index) =>
    samengevoegd.findIndex((andere) => andere.ecli === uitspraak.ecli) ===
    index
);
