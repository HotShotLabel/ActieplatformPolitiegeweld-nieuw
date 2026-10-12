/* Aanvullingen op de overledenen: gevallen die (nog) niet in de
   CAD-database staan maar wel gedocumenteerd zijn in nieuwsberichten.
   Gecontroleerd tegen data.json op 12 oktober 2026. Let op: CAD heeft
   per jaar ook anonieme records (zonder plaats/datum); waar die bestaan
   is "niet in CAD" niet 100% zeker en staat dat in de toelichting. */

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
    datum: "nacht 23 op 24 juni 2026",
    jaar: "2026",
    plaats: "Kapellebrug",
    lat: 51.2516,
    lng: 4.0611,
    titel: "Man (28) uit Terneuzen overleed na crash tijdens politieachtervolging",
    toelichting:
      "Na een melding over een conflict in een woning reed de man weg; agenten zagen de auto richting Kapellebrug en gaven een stopteken, dat hij negeerde. Vlak bij de kruising met de Brouwerijstraat raakte hij van de weg (N290) en reed tegen een boom. De brandweer bevrijdde hem; hij overleed in het ziekenhuis (bekendgemaakt 25 juni). Staat niet in de CAD-database (geen anonieme 2026-records; gecontroleerd 12-10-2026).",
    bronLabel: "Omroep Zeeland",
    bronUrl:
      "https://www.omroepzeeland.nl/nieuws/18567331/man-28-overleden-na-crash-tegen-boom-na-politieachtervolging",
  },
  {
    id: "apeldoorn-2024",
    datum: "26 oktober 2024",
    jaar: "2024",
    plaats: "Apeldoorn",
    lat: 52.2108,
    lng: 5.9737,
    titel: "Automobilist (27) uit Apeldoorn overleed na crash tijdens politieachtervolging",
    toelichting:
      "Kort na een stopteken wegens opvallend rijgedrag ging de man er met hoge snelheid vandoor (Kayersdijk, rond 5.00 uur). Agenten verloren hem uit het oog en troffen kort daarna de gecrashte auto aan: hij was tegen twee bomen gebotst en overleed aan zijn verwondingen. Voor zover vaststelbaar niet in de CAD-database (5 anonieme 2024-records maken 100% uitsluitsel onmogelijk; gecontroleerd 12-10-2026).",
    bronLabel: "GelreNieuws",
    bronUrl:
      "https://www.gelrenieuws.nl/2024/10/auto-crasht-na-stopteken-politie-bestuurder-27-overleden.html",
  },
  {
    id: "emmen-2022",
    datum: "20 mei 2022",
    jaar: "2022",
    plaats: "Emmen",
    lat: 52.7783,
    lng: 6.9011,
    titel: "Automobilist (43) uit Coevorden dood bij politieachtervolging in Emmen",
    toelichting:
      "Bij Erm wilde de politie hem controleren wegens opvallend rijgedrag; hij stopte niet. In Emmen zette een agent zijn auto dwars; de man keerde om, reed tegen de rijrichting in en botste frontaal op de auto van een 61-jarige vrouw (zwaargewond). Hij overleed ter plaatse. Voor zover vaststelbaar niet in de CAD-database (9 anonieme 2022-records).",
    bronLabel: "NOS",
    bronUrl: "https://nos.nl/artikel/2429654-automobilist-43-dood-bij-politieachtervolging-emmen-vrouw-zwaargewond",
  },
  {
    id: "a12-utrecht-2018",
    datum: "21 oktober 2018",
    jaar: "2018",
    plaats: "Utrecht (A12)",
    lat: 52.0703,
    lng: 5.0847,
    titel: "Automobilist overleed bij politieachtervolging op de A12 bij Utrecht",
    toelichting:
      "De politie wilde hem in Wilnis controleren wegens slingerend rijgedrag; hij sloeg op de vlucht, tikte een andere auto aan en crashte op de A12 bij Kanaleneiland. Hij overleed; het motorblok vloog uit het voertuig. Mogelijk (nog) niet in de CAD-database; de 2 anonieme 2018-records maken uitsluitsel onmogelijk.",
    bronLabel: "NOS",
    bronUrl: "https://nos.nl/artikel/2255728-automobilist-komt-om-bij-politieachtervolging-op-a12-bij-utrecht",
  },
  {
    id: "deurne-2019",
    datum: "1 maart 2019",
    jaar: "2019",
    plaats: "Deurne",
    lat: 51.4667,
    lng: 5.8031,
    titel: "Verdachte (32) overleed na sprong uit auto bij politieachtervolging",
    toelichting:
      "Tijdens een politieachtervolging (na een schietpartij bij een woning in Helmond) sprong de 32-jarige man uit een rijdende auto; hij raakte zwaargewond en overleed in de nacht van 1 maart 2019. Mogelijk (nog) niet in de CAD-database; de 2 anonieme 2019-records maken uitsluitsel onmogelijk.",
    bronLabel: "NOS",
    bronUrl: "https://nos.nl/artikel/2274123-verdachte-schietpartij-overleden-na-sprong-uit-auto-bij-politieachtervolging",
  },
  {
    id: "vlissingen-2020",
    datum: "11 juli 2020",
    jaar: "2020",
    plaats: "Vlissingen",
    lat: 51.4421,
    lng: 3.5736,
    titel: "Motorrijder (48) uit Vlissingen overleed na vlucht voor de politie",
    toelichting:
      "Bij een routinecontrole negeerde hij een stopteken, reed met hoge snelheid weg en reed meerdere keren door rood; hij verongelukte. Agenten konden de motor niet bijhouden. Hij overleed in een ziekenhuis in Rotterdam. Mogelijk (nog) niet in de CAD-database; de 2 anonieme 2020-records maken uitsluitsel onmogelijk.",
    bronLabel: "NOS",
    bronUrl: "https://nos.nl/artikel/2340434-vlissingse-motorrijder-overleden-na-vlucht-voor-politie",
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
  {
    id: "houten-2012",
    datum: "9 december 2012",
    jaar: "2012",
    plaats: "Houten",
    lat: 52.0281,
    lng: 5.1683,
    titel: "Man (40) uit Iran overleed kort na opname in het cellencomplex van Houten",
    toelichting:
      "Hij was eerder die dag opgepakt op het Zandpad in Utrecht en werd onwel in het cellencomplex; hij overleed kort daarna. Staat niet in de CAD-database (gecontroleerd 12-10-2026; CAD heeft geen 2012-records).",
    bronLabel: "De Gelderlander",
    bronUrl:
      "https://web.archive.org/web/20121214054706/http://www.gelderlander.nl/algemeen/binnenland/arrestant-overleden-in-houten-1.3551581",
  },
  {
    id: "denhaag-2015",
    datum: "27 oktober 2015",
    jaar: "2015",
    plaats: "Den Haag",
    lat: 52.0721,
    lng: 4.293,
    titel: "Man (72) overleed na zijn arrestatie wegens overlast; sectie: hartinfarct",
    toelichting:
      "Volgens het OM was er geen worsteling. Staat niet in de CAD-database (2015 bevat daar alleen Mitch Henriquez; gecontroleerd 12-10-2026).",
    bronLabel: "De Stentor",
    bronUrl:
      "https://web.archive.org/web/20151027181004/http://www.destentor.nl/algemeen/binnenland/arrestant-den-haag-overleden-na-hartinfarct-1.5086206",
  },
];
