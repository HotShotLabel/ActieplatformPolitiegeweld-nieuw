/* Openbaar gedocumenteerde zaken, per plaats van het incident (op stadsniveau,
   dus bewust geen exacte adressen). Alles komt uit openbare bronnen:
   rechtspraak.nl (met ECLI) of de officiële pagina over bekende rechtszaken.
   Deze laag staat naast de meldingen van bezoekers op de kaart. */

export interface OpenbareZaak {
  id: string;
  jaar: number;
  plaats: string;
  lat: number;
  lng: number;
  soort: "overleden" | "rechter";
  titel: string;
  uitslag: string;
  bronLabel: string;
  bronUrl: string;
}

export const OPENBARE_ZAKEN: OpenbareZaak[] = [
  {
    id: "henriquez-2015",
    jaar: 2015,
    plaats: "Den Haag",
    lat: 52.0655,
    lng: 4.3127,
    soort: "overleden",
    titel: "Mitch Henriquez overleed na een nekklem bij zijn aanhouding",
    uitslag:
      "Eén agent bleef veroordeeld (voorwaardelijk), de ander werd vrijgesproken; Hoge Raad bevestigde in 2021",
    bronLabel: "rechtspraak.nl, bekende rechtszaken",
    bronUrl: "https://www.rechtspraak.nl/bekende-rechtszaken/mitch-henriquez",
  },
  {
    id: "rbams-2025-1753",
    jaar: 2024,
    plaats: "Amsterdam",
    lat: 52.3791,
    lng: 4.9003,
    soort: "rechter",
    titel:
      "Mishandeling van agenten op het Centraal Station; rechter noemt politiegeweld disproportioneel",
    uitslag: "Geen straf voor de verdachte; 500 euro schadevergoeding",
    bronLabel: "ECLI:NL:RBAMS:2025:1753",
    bronUrl:
      "https://uitspraken.rechtspraak.nl/details?id=ECLI%3ANL%3ARBAMS%3A2025%3A1753",
  },
  {
    id: "rbams-2023-478",
    jaar: 2018,
    plaats: "Amsterdam",
    lat: 52.3602,
    lng: 4.9186,
    soort: "rechter",
    titel: "Klappen in het gezicht tijdens vervoer naar het politiebureau",
    uitslag: "Politie aansprakelijk; schade via schadestaatprocedure",
    bronLabel: "ECLI:NL:RBAMS:2023:478",
    bronUrl:
      "https://uitspraken.rechtspraak.nl/details?id=ECLI%3ANL%3ARBAMS%3A2023%3A478",
  },
  {
    id: "ghdha-2016-3418",
    jaar: 2015,
    plaats: "Den Haag",
    lat: 52.0831,
    lng: 4.2891,
    soort: "rechter",
    titel:
      "Agent vervolgd voor pepperspray en een vuistslag bij een aanhouding",
    uitslag: "Vrijspraak in hoger beroep",
    bronLabel: "ECLI:NL:GHDHA:2016:3418",
    bronUrl:
      "https://uitspraken.rechtspraak.nl/details?id=ECLI%3ANL%3AGHDHA%3A2016%3A3418",
  },
  {
    id: "rbdha-2020-7032",
    jaar: 2017,
    plaats: "Den Haag",
    lat: 52.0572,
    lng: 4.3109,
    soort: "rechter",
    titel:
      "Agent verdacht van mishandeling bij aanhouding en een onjuist proces-verbaal",
    uitslag: "Vrijspraak",
    bronLabel: "ECLI:NL:RBDHA:2020:7032",
    bronUrl:
      "https://uitspraken.rechtspraak.nl/details?id=ECLI%3ANL%3ARBDHA%3A2020%3A7032",
  },
  {
    id: "rbdha-2025-21376",
    jaar: 2022,
    plaats: "Den Haag",
    lat: 52.0762,
    lng: 4.2975,
    soort: "rechter",
    titel: "Beenklem bij een aanhouding; rupturen van beide quadricepspezen",
    uitslag: "Politie aansprakelijk voor de schade",
    bronLabel: "ECLI:NL:RBDHA:2025:21376",
    bronUrl:
      "https://uitspraken.rechtspraak.nl/details?id=ECLI%3ANL%3ARBDHA%3A2025%3A21376",
  },
  {
    id: "ghams-2018-1172",
    jaar: 2016,
    plaats: "Hoogkarspel",
    lat: 52.6881,
    lng: 5.1803,
    soort: "rechter",
    titel: "Schot op de benen; deel van het been later geamputeerd",
    uitslag: "Beklag afgewezen (beroep op noodweer zou slagen)",
    bronLabel: "ECLI:NL:GHAMS:2018:1172",
    bronUrl:
      "https://uitspraken.rechtspraak.nl/details?id=ECLI%3ANL%3AGHAMS%3A2018%3A1172",
  },
  {
    id: "ghams-2022-3869",
    jaar: 2021,
    plaats: "Zaandam",
    lat: 52.4389,
    lng: 4.8299,
    soort: "rechter",
    titel: "Letsel bij een aanhouding op de Dam",
    uitslag: "Beklag ongegrond; geen steun voor buitensporig geweld",
    bronLabel: "ECLI:NL:GHAMS:2022:3869",
    bronUrl:
      "https://uitspraken.rechtspraak.nl/details?id=ECLI%3ANL%3AGHAMS%3A2022%3A3869",
  },
  {
    id: "ghams-2024-1801",
    jaar: 2021,
    plaats: "Broek in Waterland",
    lat: 52.4372,
    lng: 5.0004,
    soort: "rechter",
    titel:
      "Vuurwapen en politiehond bij de aanhouding van voortvluchtige overvallers",
    uitslag: "Beklag ongegrond; geweld viel binnen de kaders",
    bronLabel: "ECLI:NL:GHAMS:2024:1801",
    bronUrl:
      "https://uitspraken.rechtspraak.nl/details?id=ECLI%3ANL%3AGHAMS%3A2024%3A1801",
  },
  {
    id: "ghshe-2012-bx4873",
    jaar: 2009,
    plaats: "Someren",
    lat: 51.3833,
    lng: 5.7167,
    soort: "rechter",
    titel: "Geweld bij een aanhouding; hof ziet aanwijzingen van te veel geweld",
    uitslag: "Beklag toch afgewezen; vervolging onvoldoende opportuun",
    bronLabel: "ECLI:NL:GHSHE:2012:BX4873",
    bronUrl:
      "https://uitspraken.rechtspraak.nl/details?id=ECLI%3ANL%3AGHSHE%3A2012%3ABX4873",
  },
  {
    id: "rbmne-2023-3245",
    jaar: 2020,
    plaats: "Diepenveen",
    lat: 52.2883,
    lng: 6.1489,
    soort: "rechter",
    titel: "Agent vervolgd voor slaan bij een aanhouding buiten heterdaad",
    uitslag: "Vrijspraak; geweld binnen proportionaliteit en subsidiariteit",
    bronLabel: "ECLI:NL:RBMNE:2023:3245",
    bronUrl:
      "https://uitspraken.rechtspraak.nl/details?id=ECLI%3ANL%3ARBMNE%3A2023%3A3245",
  },
  {
    id: "rbmne-2024-5976",
    jaar: 2022,
    plaats: "Amersfoort",
    lat: 52.1561,
    lng: 5.3878,
    soort: "rechter",
    titel: "Hoofdagent vervolgd voor wapenstokslagen (Blauwe Kamer-zaak)",
    uitslag: "Vrijspraak; handelde conform de geweldsinstructie",
    bronLabel: "ECLI:NL:RBMNE:2024:5976",
    bronUrl:
      "https://uitspraken.rechtspraak.nl/details?id=ECLI%3ANL%3ARBMNE%3A2024%3A5976",
  },
  {
    id: "rbdha-2024-489",
    jaar: 2021,
    plaats: "Rotterdam",
    lat: 51.9225,
    lng: 4.4792,
    soort: "rechter",
    titel: "In de knie geschoten tijdens de coronademonstratie",
    uitslag: "Geen aansprakelijkheid; geslaagd beroep op noodweer",
    bronLabel: "ECLI:NL:RBDHA:2024:489",
    bronUrl:
      "https://uitspraken.rechtspraak.nl/details?id=ECLI%3ANL%3ARBDHA%3A2024%3A489",
  },
];
