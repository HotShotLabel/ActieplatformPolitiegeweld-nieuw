/* Gearchiveerde nieuwsberichten over politiegeweld en politieoptreden.
   Handmatig samengesteld uit openbare nieuwsmedia en officiële bronnen
   (OM, Rijksrecherche, Controle Alt Delete), met per bericht de bron en
   datum. Elke titel linkt naar het originele bericht; wij publiceren zelf
   geen artikelen. Aangevuld met een live feed-filter (zie api/nieuws). */

export interface NieuwsBericht {
  titel: string;
  bron: string;
  url: string;
  datum: string; // YYYY-MM-DD
}

export const NIEUWS_ARCHIEF: NieuwsBericht[] = [
  {
    titel:
      "Politiegeweld bij fatale aanhouding van Eggy was onrechtmatig, oordeelt het Europees Hof voor de Rechten van de Mens",
    bron: "Controle Alt Delete",
    url: "https://controlealtdelete.nl/articles/politiegeweld-bij-fatale-aanhouding-van-eggy-was-onrechtmatig/",
    datum: "2026-10-01",
  },
  {
    titel: "Stille tocht voor Alfredo Goeloe die overleed na arrestatie; na afloop onrustig",
    bron: "NOS",
    url: "https://nos.nl/artikel/2631007-stille-tocht-voor-alfredo-goeloe-die-overleed-na-arrestatie-na-afloop-onrustig",
    datum: "2026-09-14",
  },
  {
    titel:
      "Alfredo Goeloe overleed zaterdag na aanhouding door de politie, nu gaat zijn familie aangifte doen",
    bron: "Trouw",
    url: "https://www.trouw.nl/binnenland/alfredo-goeloe-overleed-zaterdag-na-aanhouding-door-de-politie-nu-gaat-zijn-familie-aangifte-doen~b2c2f7c8/",
    datum: "2026-09-15",
  },
  {
    titel: "Veel emoties en vragen rond aanhouding en dood Rotterdammer Alfredo Goeloe",
    bron: "NU.nl",
    url: "https://www.nu.nl/binnenland/6409804/veel-emoties-en-vragen-rond-aanhouding-en-dood-rotterdammer-alfredo-goeloe.html",
    datum: "2026-09-15",
  },
  {
    titel: "Gevoelens van onrecht overheersen na dodelijke arrestatie van Alfredo Goeloe",
    bron: "de Volkskrant",
    url: "https://www.volkskrant.nl/binnenland/gevoelens-van-onrecht-overheersen-na-dodelijke-arrestatie-van-alfredo-goeloe~bb6ae899/",
    datum: "2026-09-14",
  },
  {
    titel:
      "De politie zag Alfredo (51) ten onrechte aan voor een fietsendief. Hij overleed bij zijn arrestatie",
    bron: "NRC",
    url: "https://www.nrc.nl/nieuws/2026/09/14/de-politie-zag-alfredo-51-ten-onrechte-aan-voor-een-fietsendief-hij-overleed-bij-zijn-arrestatie-a4936597",
    datum: "2026-09-14",
  },
  {
    titel: "Overleden man in Rotterdam werd door politie tegen de grond gewerkt",
    bron: "NOS",
    url: "https://nos.nl/artikel/2630796-overleden-man-in-rotterdam-werd-door-politie-tegen-de-grond-gewerkt",
    datum: "2026-09-13",
  },
  {
    titel: "Rotterdammer (51) overleden nadat hij onwel werd bij aanhouding door politie",
    bron: "AD",
    url: "https://www.ad.nl/112-nieuws-rotterdam/rotterdammer-51-overleden-nadat-hij-onwel-werd-bij-aanhouding-door-politie~a5a44656/",
    datum: "2026-09-12",
  },
  {
    titel: "Rushen ziet met eigen ogen fatbiker overlijden na arrestatie: 'Het laat me niet los'",
    bron: "AD",
    url: "https://www.ad.nl/rotterdam/rushen-ziet-met-eigen-ogen-fatbiker-overlijden-na-arrestatie-het-laat-me-niet-los~a9fc1e984/",
    datum: "2026-09-13",
  },
  {
    titel:
      "Utrechtse agent die een vrouw schopte bij arrestatie handelde volgens het OM niet onrechtmatig",
    bron: "NRC",
    url: "https://www.nrc.nl/nieuws/2026/09/07/utrechtse-agent-die-een-vrouw-schopte-bij-arrestatie-handelde-volgens-het-om-niet-onrechtmatig-a4936088",
    datum: "2026-09-07",
  },
  {
    titel: "Agent niet vervolgd voor dodelijk schietincident na fatbikeroof Capelle aan den IJssel",
    bron: "Rijksrecherche",
    url: "https://www.rijksrecherche.nl/actueel/nieuws/2026/06/11/agent-niet-vervolgd-voor-dodelijk-schietincident-na-fatbikeroof-capelle-aan-den-ijssel",
    datum: "2026-06-12",
  },
  {
    titel: "Politieambtenaar niet vervolgd voor dodelijk schietincident Hoofddorp",
    bron: "Openbaar Ministerie",
    url: "https://www.om.nl/actueel/nieuws/2026/01/14/politieambtenaar-niet-vervolgd-voor-dodelijk-schietincident-hoofddorp",
    datum: "2026-01-14",
  },
  {
    titel: "Agenten in nekklem gehouden door verdachten: 'grof en doelgericht geweld'",
    bron: "Openbaar Ministerie",
    url: "https://www.om.nl/actueel/nieuws/2026/08/21/agenten-in-nekklem-gehouden-door-verdachten-grof-en-doelgericht-geweld-feiten-van-uitzonderlijke-ernst",
    datum: "2026-08-21",
  },
  {
    titel: "OM: schieten door agente bij aanhouding in Haaren was rechtmatig",
    bron: "Openbaar Ministerie",
    url: "https://www.om.nl/actueel/nieuws/2025/12/30/om-schieten-door-agente-bij-aanhouding-in-haaren-was-rechtmatig",
    datum: "2025-12-30",
  },
  {
    titel: "'Van de politie blijf je af': Drie verdachten veroordeeld voor geweld tegen politieagenten",
    bron: "Openbaar Ministerie",
    url: "https://www.om.nl/actueel/nieuws/2025/11/27/van-de-politie-blijf-je-af-drie-verdachten-veroordeeld-voor-geweld-tegen-politieagenten",
    datum: "2025-11-27",
  },
  {
    titel: "OM: optreden politie rechtmatig op asielboot in Groningen",
    bron: "Openbaar Ministerie",
    url: "https://www.om.nl/actueel/nieuws/2025/10/08/om-optreden-politie-rechtmatig-op-asielboot-in-groningen",
    datum: "2025-10-08",
  },
  {
    titel: "Moeder door politie doodgeschoten minderjarige jongen uit Gouda doet aangifte",
    bron: "NRC",
    url: "https://www.nrc.nl/nieuws/2025/09/25/moeder-door-politie-doodgeschoten-minderjarige-jongen-uit-gouda-doet-aangifte-a4907401",
    datum: "2025-09-25",
  },
  {
    titel: "OM spreekt tegen dat doodgeschoten jongen (15) Capelle in rug werd geraakt",
    bron: "NU.nl",
    url: "https://www.nu.nl/binnenland/6370268/om-spreekt-tegen-dat-doodgeschoten-jongen-15-capelle-in-rug-werd-geraakt.html",
    datum: "2025-09-25",
  },
  {
    titel: "Politieambtenaren niet vervolgd voor schietincident Alkmaar",
    bron: "Openbaar Ministerie",
    url: "https://www.om.nl/actueel/nieuws/2025/08/12/politieambtenaren-niet-vervolgd-voor-schietincident-alkmaar",
    datum: "2025-08-12",
  },
  {
    titel: "Man in been geschoten door politie: agent niet vervolgd (Uden)",
    bron: "Openbaar Ministerie",
    url: "https://www.om.nl/actueel/nieuws/2025/04/22/man-in-been-geschoten-door-politie-agent-niet-vervolgd",
    datum: "2025-04-22",
  },
  {
    titel: "OM: Gebruik vuurwapen door politie rechtmatig bij geweldsincident in Ter Apel",
    bron: "Openbaar Ministerie",
    url: "https://www.om.nl/actueel/nieuws/2025/03/28/om-gebruik-vuurwapen-door-politie-rechtmatig-bij-geweldsincident-in-ter-apel",
    datum: "2025-03-28",
  },
  {
    titel: "Eis: drie jaar gevangenisstraf en tbs voor geweld tegen politieman tijdens jaarwisseling",
    bron: "Openbaar Ministerie",
    url: "https://www.om.nl/actueel/nieuws/2024/10/22/eis-drie-jaar-gevangenisstraf-en-tbs-voor-geweld-tegen-politieman-tijdens-jaarwisseling",
    datum: "2024-10-22",
  },
  {
    titel:
      "Tomy (40) overleed na hardhandige aanhouding in Zwolle, zijn broer: 'Wat er met George Floyd is gebeurd is heel herkenbaar'",
    bron: "De Gelderlander",
    url: "https://www.gelderlander.nl/overijssel/tomy-40-overleed-na-hardhandige-aanhouding-in-zwolle-zijn-broer-wat-er-met-george-floyd-is-gebeurd-is-heel-herkenbaar~aec098b5/",
    datum: "2023-01-19",
  },
  {
    titel: "Agenten vervolgd voor dood Mitch Henriquez",
    bron: "de Volkskrant",
    url: "https://www.volkskrant.nl/nieuws-achtergrond/agenten-vervolgd-voor-dood-mitch-henriquez~bf3122c1/",
    datum: "2016-09-19",
  },
];
