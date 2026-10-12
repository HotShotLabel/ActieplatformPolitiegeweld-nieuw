/* Bekende gevallen van politiegeweld zonder dodelijke afloop, uit openbare
   bronnen (OM-berichten, Woo-besluiten van de politie, rechtspraak).
   Er bestaat geen volledig landelijk register; dit zijn de zaken die
   openbaar te herleiden zijn. Elke zaak heeft een bronlink. */

export interface GeweldZaak {
  id: string;
  jaar: string;
  plaats: string;
  lat: number;
  lng: number;
  titel: string;
  toelichting: string;
  bronLabel: string;
  bronUrl: string;
}

const WOO = "https://www.politie.nl";

export const GEWELD_ZAKEN: GeweldZaak[] = [
  {
    id: "coolsingel-2021",
    jaar: "2021",
    plaats: "Rotterdam",
    lat: 51.92,
    lng: 4.4782,
    titel: "Schietincident Coolsingel: vijf gewonden door politiekogels",
    toelichting:
      "Bij een schietincident op de Coolsingel (november 2021) raakten vijf mensen gewond door politiekogels. De rechtbank deed in 2024 uitspraak.",
    bronLabel: "ECLI:NL:RBROT:2024:8915",
    bronUrl:
      "https://uitspraken.rechtspraak.nl/details?id=ECLI%3ANL%3ARBROT%3A2024%3A8915",
  },
  {
    id: "ter-apel-2024",
    jaar: "2024",
    plaats: "Ter Apel",
    lat: 52.8829,
    lng: 7.0785,
    titel: "Vuurwapen gebruikt bij geweldsincident (Hema)",
    toelichting:
      "Politie gebruikte het vuurwapen bij een geweldsincident in Ter Apel (18 juni 2024). Het OM oordeelde het gebruik rechtmatig (maart 2025).",
    bronLabel: "OM, nieuwsbericht",
    bronUrl:
      "https://www.om.nl/actueel/nieuws/2025/03/28/om-gebruik-vuurwapen-door-politie-rechtmatig-bij-geweldsincident-in-ter-apel",
  },
  {
    id: "broek-waterland-2021",
    jaar: "2021",
    plaats: "Broek in Waterland",
    lat: 52.43814,
    lng: 4.99968,
    titel: "Vuurwapengebruik bij overval en achtervolging",
    toelichting:
      "Documenten over vuurwapengebruik tijdens een overval en bij de achtervolging/aanhouding in Amsterdam en Broek in Waterland (19 mei 2021).",
    bronLabel: "Woo-besluit politie",
    bronUrl: `${WOO}/wet-open-overheid/woo-verzoeken/noord-holland/woo-verzoeken-per-jaar/2025/informatie-over-vuurwapengebruik-tijdens-overval-en-bij-achtervolging-aanhouding-in-amsterdam-en-broek-in-waterland-op-19-mei-2021.html`,
  },
  {
    id: "rechtbank-dh-2023",
    jaar: "2023-2024",
    plaats: "Den Haag",
    lat: 52.07207,
    lng: 4.293,
    titel: "Politieoptreden bij de rechtbank Den Haag",
    toelichting:
      "Woo-dossier over politieoptreden, observatie en opsporingshandelingen bij de rechtbank Den Haag op 20 december 2023 en 28 mei 2024.",
    bronLabel: "Woo-besluit politie",
    bronUrl: `${WOO}/wet-open-overheid/woo-verzoeken/den-haag/woo-verzoeken-per-jaar/2026/politieoptreden-observatie-en-eventuele-opsporingshandelingen-bij-de-rechtbank-den-haag-op-20-december-2023-en-28-mei-2024.html`,
  },
  {
    id: "bilthoven-2020",
    jaar: "2020",
    plaats: "Bilthoven",
    lat: 52.1405,
    lng: 5.2072,
    titel: "Geweldsmelding rond demonstratie (coronatijd)",
    toelichting:
      "Woo-dossier met geweldsmeldingen rond een demonstratie in Bilthoven op 22 juli 2020.",
    bronLabel: "Woo-besluit politie",
    bronUrl: `${WOO}/wet-open-overheid/woo-verzoeken/midden-nederland/woo-verzoeken-per-jaar/2024/geweldsmeldingen-demonstraties-corona.html`,
  },
  {
    id: "markelo-2025",
    jaar: "2025",
    plaats: "Markelo",
    lat: 52.2354,
    lng: 6.5134,
    titel: "Politieoptreden in Markelo",
    toelichting:
      "Woo-dossier over politieoptreden in Markelo (Oost-Nederland, 2025).",
    bronLabel: "Woo-besluit politie",
    bronUrl: `${WOO}/wet-open-overheid/woo-verzoeken/oost-nederland/woo-verzoeken-per-jaar/2025/politieoptreden-markelo.html`,
  },
  {
    id: "middenbeemster-1987",
    jaar: "1987",
    plaats: "Middenbeemster",
    lat: 52.5504,
    lng: 4.9232,
    titel: "Geweldsincident aan de Raadhuisstraat",
    toelichting:
      "Documenten uit het politieonderzoek naar een geweldsincident in Middenbeemster (1987), openbaar gemaakt in 2025.",
    bronLabel: "Woo-besluit politie",
    bronUrl: `${WOO}/wet-open-overheid/woo-verzoeken/noord-holland/woo-verzoeken-per-jaar/2025/documenten-uit-het-politieonderzoek-naar-een-geweldsincident-aan-de-raadhuisstraat-te-middenbeemster-in-1987.html`,
  },
  {
    id: "gaanderen-1982",
    jaar: "1982",
    plaats: "Gaanderen",
    lat: 51.9376,
    lng: 6.3601,
    titel: "Geweldsincident Gaanderen",
    toelichting:
      "Woo-dossier over een geweldsincident in Gaanderen (1982), openbaar gemaakt in 2025.",
    bronLabel: "Woo-besluit politie",
    bronUrl: `${WOO}/wet-open-overheid/woo-verzoeken/oost-nederland/woo-verzoeken-per-jaar/2025/geweldsincident-gaanderen-1982.html`,
  },
];
