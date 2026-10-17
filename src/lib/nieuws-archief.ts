/* Gearchiveerde nieuwsberichten over politiegeweld en politieoptreden.
   Handmatig samengesteld uit openbare nieuwsmedia en officiële bronnen
   (OM, Rijksrecherche, Controle Alt Delete), met per bericht de bron en
   datum. Elke titel linkt naar het originele bericht; wij publiceren zelf
   geen artikelen. Aangevuld met een live feed-filter (zie api/nieuws). */

export type NieuwsSoort =
  | "overleden"
  | "agent-vervolgd"
  | "burger-vervolgd"
  | "gevaar"
  | "overig";

export interface NieuwsBericht {
  titel: string;
  bron: string;
  url: string;
  datum: string; // YYYY-MM-DD
  soort: NieuwsSoort;
  auteur?: string;
  plaats?: string;
  lat?: number;
  lng?: number;
}

export const SOORT_LABEL: Record<NieuwsSoort, string> = {
  overleden: "Overleden na politieoptreden",
  "agent-vervolgd": "Agent vervolgd",
  "burger-vervolgd": "Burger vervolgd",
  gevaar: "Gevaarlijk rijden of ongeval",
  overig: "Overig",
};

export const NIEUWS_ARCHIEF: NieuwsBericht[] = [
  {
    titel: "",
    bron: "Controle Alt Delete",
    url: "https://controlealtdelete.nl/articles/politiegeweld-bij-fatale-aanhouding-van-eggy-was-onrechtmatig/",
    datum: "2026-10-01",
    soort: "overleden",
  },
  {
    titel: "Stille tocht voor Alfredo Goeloe die overleed na arrestatie; na afloop onrustig",
    bron: "NOS",
    url: "https://nos.nl/artikel/2631007-stille-tocht-voor-alfredo-goeloe-die-overleed-na-arrestatie-na-afloop-onrustig",
    datum: "2026-09-14",
    soort: "overleden",
  },
  {
    titel: "",
    bron: "Trouw",
    url: "https://www.trouw.nl/binnenland/alfredo-goeloe-overleed-zaterdag-na-aanhouding-door-de-politie-nu-gaat-zijn-familie-aangifte-doen~b2c2f7c8/",
    datum: "2026-09-15",
    soort: "overleden",
  },
  {
    titel: "Veel emoties en vragen rond aanhouding en dood Rotterdammer Alfredo Goeloe",
    bron: "NU.nl",
    url: "https://www.nu.nl/binnenland/6409804/veel-emoties-en-vragen-rond-aanhouding-en-dood-rotterdammer-alfredo-goeloe.html",
    datum: "2026-09-15",
    soort: "overleden",
    plaats: "Rotterdam",
    lat: 51.9225,
    lng: 4.4865,
  },
  {
    titel: "Gevoelens van onrecht overheersen na dodelijke arrestatie van Alfredo Goeloe",
    bron: "de Volkskrant",
    url: "https://www.volkskrant.nl/binnenland/gevoelens-van-onrecht-overheersen-na-dodelijke-arrestatie-van-alfredo-goeloe~bb6ae899/",
    datum: "2026-09-14",
    soort: "overleden",
  },
  {
    titel: "",
    bron: "NRC",
    url: "https://www.nrc.nl/nieuws/2026/09/14/de-politie-zag-alfredo-51-ten-onrechte-aan-voor-een-fietsendief-hij-overleed-bij-zijn-arrestatie-a4936597",
    datum: "2026-09-14",
    soort: "overleden",
  },
  {
    titel: "Overleden man in Rotterdam werd door politie tegen de grond gewerkt",
    bron: "NOS",
    url: "https://nos.nl/artikel/2630796-overleden-man-in-rotterdam-werd-door-politie-tegen-de-grond-gewerkt",
    datum: "2026-09-13",
    soort: "overleden",
    plaats: "Rotterdam",
    lat: 51.9225,
    lng: 4.4865,
  },
  {
    titel: "Rotterdammer (51) overleden nadat hij onwel werd bij aanhouding door politie",
    bron: "AD",
    url: "https://www.ad.nl/112-nieuws-rotterdam/rotterdammer-51-overleden-nadat-hij-onwel-werd-bij-aanhouding-door-politie~a5a44656/",
    datum: "2026-09-12",
    soort: "overleden",
    plaats: "Rotterdam",
    lat: 51.9225,
    lng: 4.4865,
  },
  {
    titel: "Rushen ziet met eigen ogen fatbiker overlijden na arrestatie: 'Het laat me niet los'",
    bron: "AD",
    url: "https://www.ad.nl/rotterdam/rushen-ziet-met-eigen-ogen-fatbiker-overlijden-na-arrestatie-het-laat-me-niet-los~a9fc1e984/",
    datum: "2026-09-13",
    soort: "overleden",
  },
  {
    titel: "",
    bron: "NRC",
    url: "https://www.nrc.nl/nieuws/2026/09/07/utrechtse-agent-die-een-vrouw-schopte-bij-arrestatie-handelde-volgens-het-om-niet-onrechtmatig-a4936088",
    datum: "2026-09-07",
    soort: "agent-vervolgd",
  },
  {
    titel: "Doodgeschoten Jerryson (15) zette vuurwapen tegen hoofd slachtoffer bij fatbikeroof",
    bron: "RTL Nieuws",
    url: "https://www.rtl.nl/nieuws/artikel/5629036/doodgeschoten-jerryson-vuurwapen-tegen-hoofd-slachtoffer-fatbikeroof-cappe",
    datum: "2026-07-17",
    soort: "overleden",
  },
  {
    titel: "Agent die 15-jarige Jerryson doodschoot wordt niet vervolgd: OM noemt optreden gerechtvaardigd",
    bron: "AD",
    url: "https://www.ad.nl/binnenland/agent-die-15-jarige-jerryson-doodschoot-wordt-niet-vervolgd-om-noemt-optreden-gerechtvaardigd~a3b5f929/",
    datum: "2026-06-11",
    soort: "agent-vervolgd",
  },
  {
    titel: "Agent niet vervolgd voor dodelijk schietincident na fatbikeroof Capelle aan den IJssel",
    bron: "Rijksrecherche",
    url: "https://www.rijksrecherche.nl/actueel/nieuws/2026/06/11/agent-niet-vervolgd-voor-dodelijk-schietincident-na-fatbikeroof-capelle-aan-den-ijssel",
    datum: "2026-06-12",
    soort: "agent-vervolgd",
    plaats: "Capelle aan den IJssel",
    lat: 51.9349,
    lng: 4.5801,
  },
  {
    titel: "Politieambtenaar niet vervolgd voor dodelijk schietincident Hoofddorp",
    bron: "Openbaar Ministerie",
    url: "https://www.om.nl/actueel/nieuws/2026/01/14/politieambtenaar-niet-vervolgd-voor-dodelijk-schietincident-hoofddorp",
    datum: "2026-01-14",
    soort: "agent-vervolgd",
    plaats: "Hoofddorp",
    lat: 52.3053,
    lng: 4.6848,
  },
  {
    titel: "Agenten in nekklem gehouden door verdachten: 'grof en doelgericht geweld'",
    bron: "Openbaar Ministerie",
    url: "https://www.om.nl/actueel/nieuws/2026/08/21/agenten-in-nekklem-gehouden-door-verdachten-grof-en-doelgericht-geweld-feiten-van-uitzonderlijke-ernst",
    datum: "2026-08-21",
    soort: "burger-vervolgd",
  },
  {
    titel: "OM: schieten door agente bij aanhouding in Haaren was rechtmatig",
    bron: "Openbaar Ministerie",
    url: "https://www.om.nl/actueel/nieuws/2025/12/30/om-schieten-door-agente-bij-aanhouding-in-haaren-was-rechtmatig",
    datum: "2025-12-30",
    soort: "agent-vervolgd",
    plaats: "Haaren",
    lat: 51.6038,
    lng: 5.2322,
  },
  {
    titel: "'Van de politie blijf je af': Drie verdachten veroordeeld voor geweld tegen politieagenten",
    bron: "Openbaar Ministerie",
    url: "https://www.om.nl/actueel/nieuws/2025/11/27/van-de-politie-blijf-je-af-drie-verdachten-veroordeeld-voor-geweld-tegen-politieagenten",
    datum: "2025-11-27",
    soort: "burger-vervolgd",
  },
  {
    titel: "OM: optreden politie rechtmatig op asielboot in Groningen",
    bron: "Openbaar Ministerie",
    url: "https://www.om.nl/actueel/nieuws/2025/10/08/om-optreden-politie-rechtmatig-op-asielboot-in-groningen",
    datum: "2025-10-08",
    soort: "agent-vervolgd",
    plaats: "Groningen",
    lat: 53.2222,
    lng: 6.5633,
  },
  {
    titel: "Moeder door politie doodgeschoten minderjarige jongen uit Gouda doet aangifte",
    bron: "NRC",
    url: "https://www.nrc.nl/nieuws/2025/09/25/moeder-door-politie-doodgeschoten-minderjarige-jongen-uit-gouda-doet-aangifte-a4907401",
    datum: "2025-09-25",
    soort: "overleden",
    plaats: "Gouda",
    lat: 52.0153,
    lng: 4.7062,
  },
  {
    titel: "OM spreekt tegen dat doodgeschoten jongen (15) Capelle in rug werd geraakt",
    bron: "NU.nl",
    url: "https://www.nu.nl/binnenland/6370268/om-spreekt-tegen-dat-doodgeschoten-jongen-15-capelle-in-rug-werd-geraakt.html",
    datum: "2025-09-25",
    soort: "overleden",
  },
  {
    titel: "Politieambtenaren niet vervolgd voor schietincident Alkmaar",
    bron: "Openbaar Ministerie",
    url: "https://www.om.nl/actueel/nieuws/2025/08/12/politieambtenaren-niet-vervolgd-voor-schietincident-alkmaar",
    datum: "2025-08-12",
    soort: "agent-vervolgd",
    plaats: "Alkmaar",
    lat: 52.6358,
    lng: 4.7512,
  },
  {
    titel: "Man in been geschoten door politie: agent niet vervolgd (Uden)",
    bron: "Openbaar Ministerie",
    url: "https://www.om.nl/actueel/nieuws/2025/04/22/man-in-been-geschoten-door-politie-agent-niet-vervolgd",
    datum: "2025-04-22",
    soort: "agent-vervolgd",
  },
  {
    titel: "OM: Gebruik vuurwapen door politie rechtmatig bij geweldsincident in Ter Apel",
    bron: "Openbaar Ministerie",
    url: "https://www.om.nl/actueel/nieuws/2025/03/28/om-gebruik-vuurwapen-door-politie-rechtmatig-bij-geweldsincident-in-ter-apel",
    datum: "2025-03-28",
    soort: "agent-vervolgd",
    plaats: "Ter",
    lat: 53.0277,
    lng: 6.546,
  },
  {
    titel: "Eis: drie jaar gevangenisstraf en tbs voor geweld tegen politieman tijdens jaarwisseling",
    bron: "Openbaar Ministerie",
    url: "https://www.om.nl/actueel/nieuws/2024/10/22/eis-drie-jaar-gevangenisstraf-en-tbs-voor-geweld-tegen-politieman-tijdens-jaarwisseling",
    datum: "2024-10-22",
    soort: "burger-vervolgd",
  },
  {
    titel: "Niet eerder vervolgde het OM zoveel agenten tegelijk (Mateusz-zaak)",
    bron: "NRC",
    url: "https://www.nrc.nl/nieuws/2024/02/15/niet-eerder-vervolgde-het-om-zoveel-agenten-tegelijk-a4190296",
    datum: "2024-02-15",
    soort: "agent-vervolgd",
  },
  {
    titel: "Agenten vervolgd voor dood arrestant na gewelddadige aanhouding (Mateusz)",
    bron: "Trouw",
    url: "https://www.trouw.nl/binnenland/agenten-vervolgd-voor-dood-arrestant-na-gewelddadige-aanhouding~bae1d73a/",
    datum: "2024-02-15",
    soort: "agent-vervolgd",
  },
  {
    titel: "OM vervolgt acht agenten voor rol bij arrestatie waarbij man (32) overleed",
    bron: "NU.nl",
    url: "https://www.nu.nl/algemeen/6301657/om-vervolgt-acht-agenten-voor-rol-bij-arrestatie-waarbij-man-32-overleed.html",
    datum: "2024-02-15",
    soort: "agent-vervolgd",
  },
  {
    titel: "Ongekend aantal agenten aangeklaagd na dood Mateusz: 'De ergste nachtmerrie van politie'",
    bron: "AD",
    url: "https://www.ad.nl/rotterdam/ongekend-aantal-agenten-aangeklaagd-na-dood-mateusz-de-ergste-nachtmerrie-van-politie~a648a96b/",
    datum: "2024-02-16",
    soort: "agent-vervolgd",
  },
  {
    titel: "Agent die Timothy (27) doodschoot met ongewild afgevuurde kogel: 'Ga er elke dag mee naar bed'",
    bron: "AD",
    url: "https://www.ad.nl/binnenland/agent-die-timothy-27-doodschoot-met-ongewild-afgevuurde-kogel-ga-er-elke-dag-mee-naar-bed~a33d8569/",
    datum: "2023-10-03",
    soort: "agent-vervolgd",
  },
  {
    titel: "",
    bron: "De Gelderlander",
    url: "https://www.gelderlander.nl/overijssel/tomy-40-overleed-na-hardhandige-aanhouding-in-zwolle-zijn-broer-wat-er-met-george-floyd-is-gebeurd-is-heel-herkenbaar~aec098b5/",
    datum: "2023-01-19",
    soort: "overleden",
  },
  {
    titel: "OM ziet af van vervolging agenten na overlijden Macedoniër (Bekim Hasani)",
    bron: "NRC",
    url: "https://www.nrc.nl/nieuws/2017/03/22/om-ziet-af-van-vervolging-na-overlijden-aangehouden-macedonier-a1551406",
    datum: "2017-03-22",
    soort: "agent-vervolgd",
  },
  {
    titel: "Agenten vervolgd voor dood Mitch Henriquez",
    bron: "de Volkskrant",
    url: "https://www.volkskrant.nl/nieuws-achtergrond/agenten-vervolgd-voor-dood-mitch-henriquez~bf3122c1/",
    datum: "2016-09-19",
    soort: "agent-vervolgd",
  },
  {
    titel: "Wie was de overleden Umaru Sesay? (video)",
    bron: "Omroep Zeeland",
    url: "https://www.omroepzeeland.nl/nieuws/10164383/wie-was-de-overleden-umaru-sesay-video",
    datum: "2016-08-23",
    soort: "overleden",
  },
];
