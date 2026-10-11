export type ModelbriefType =
  | "klacht-politie"
  | "ombudsman"
  | "artikel12"
  | "woo"
  | "schade";

export interface ModelbriefRoute {
  id: ModelbriefType;
  titel: string;
  kort: string;
  wanneer: string;
  waar: string;
  letOp: string[];
  bron: string;
}

export const ROUTES: ModelbriefRoute[] = [
  {
    id: "klacht-politie",
    titel: "Klacht bij de politie",
    kort: "Klacht over het optreden of het geweld van een politiemedewerker.",
    wanneer:
      "Als je vindt dat een politiemedewerker zich onjuist gedroeg: onnodig geweld, een slechte bejegening of onterecht optreden. Een klacht is geen aangifte; je kunt ook allebei doen.",
    waar:
      "Online via het klachtenformulier op politie.nl, of per brief aan de politiechef van de eenheid waar de medewerker werkt. Je kunt de klacht niet rechtstreeks bij de klachtencommissie indienen.",
    letOp: [
      "Dien de klacht binnen een jaar na de gebeurtenis in. Bij oudere gebeurtenissen mag de politie de klacht weigeren te behandelen.",
      "Onderteken je brief en zet je naam, adres en contactgegevens erin.",
      "Beschrijf concreet het gedrag waarover je klaagt en wat je met de klacht wilt bereiken.",
      "Wil je strafrechtelijke vervolging? Doe dan daarnaast aangifte (via 0900 8844).",
    ],
    bron:
      "Politie.nl (klachtenregeling) en de Uitvoeringsregeling klachtbehandeling politie; artikel 9:8 Awb.",
  },
  {
    id: "ombudsman",
    titel: "Klacht bij de Nationale ombudsman",
    kort: "Als de politie je klacht niet goed heeft behandeld.",
    wanneer:
      "Pas nadat je eerst bij de politie zelf hebt geklaagd en je niet tevreden bent over hoe dat ging, of als je na zes weken nog geen reactie hebt. De ombudsman behandelt klachten in de tweede lijn.",
    waar:
      "Online via het klachtenformulier op nationaleombudsman.nl, per brief of telefonisch. Gratis telefoonnummer: 0800 335 55 55.",
    letOp: [
      "Doe dit binnen een jaar nadat de politie je klacht heeft afgehandeld.",
      "Stuur alleen kopieën mee van documenten, bewaar de originelen.",
      "Postadres zonder postzegel: Antwoordnummer 10870, 2501 WB Den Haag. Met postzegel: Postbus 93122, 2509 AC Den Haag.",
    ],
    bron: "Nationale ombudsman (nationaleombudsman.nl), onder meer de pagina's over klachten en contact.",
  },
  {
    id: "artikel12",
    titel: "Beklag bij het gerechtshof (artikel 12 Sv)",
    kort: "Vraag het hof om vervolging af te dwingen als het Openbaar Ministerie niet vervolgt.",
    wanneer:
      "Als het Openbaar Ministerie besluit een strafbaar feit niet (verder) te vervolgen, terwijl jij als rechtstreeks belanghebbende vindt dat vervolging nodig is. Bijvoorbeeld bij politiegeweld waarbij de officier van justitie seponeert.",
    waar:
      "Met een klaagschrift bij de griffie van het gerechtshof. Ging het om geweld door een politieambtenaar, dan is het gerechtshof Arnhem-Leeuwarden bevoegd. Anders: het hof in het gebied waar de beslissing is genomen.",
    letOp: [
      "Meestal geldt een termijn van drie maanden nadat je weet dat er niet wordt vervolgd. De wet noemt die termijn in artikel 12k (strafbeschikking) en artikel 12l (kennisgeving van niet verdere vervolging). Laat de termijn checken door een advocaat; te laat betekent niet-ontvankelijk.",
      "In artikel 12f Sv staat dat je je kunt laten bijstaan door een advocaat. Doe dat in de praktijk ook; de zitting is technisch.",
      "Als het hof het beklag gegrond vindt, kan het de officier van justitie bevelen de vervolging in te stellen (artikel 12i Sv).",
      "Het hof kan je beklag afwijzen op gronden van algemeen belang.",
    ],
    bron: "Wetboek van Strafvordering, artikelen 12 tot en met 12l (wetten.overheid.nl, BWBR0001903).",
  },
  {
    id: "woo",
    titel: "Woo-verzoek",
    kort: "Vraag documenten op bij de politie of het Openbaar Ministerie.",
    wanneer:
      "Als je wilt weten wat er binnen de politie of het OM is vastgelegd over een gebeurtenis of over beleid: proces-verbalen, geweldsrapportages, klachtdossiers, richtlijnen. Iedereen mag een Woo-verzoek doen, je hoeft geen belang te laten zien.",
    waar:
      "Bij het bestuursorgaan dat de stukken heeft: de Nationale Politie (per eenheid) of het Openbaar Ministerie (per parket). Online of per brief, ter attentie van de Woo-contactpersoon.",
    letOp: [
      "Het bestuursorgaan beslist binnen vier weken, met een mogelijke verlenging van ten hoogste twee weken (artikel 4.4 Woo).",
      "Formuleer gericht: welke documenten, over welke periode, over welk onderwerp.",
      "Niet alles is openbaar: er gelden uitzonderingen, bijvoorbeeld voor persoonsgegevens en het opsporingsbelang (hoofdstuk 5 Woo).",
      "Je hoeft geen reden op te geven waarom je het wilt hebben.",
    ],
    bron: "Wet open overheid, artikelen 4.1 en 4.4 (wetten.overheid.nl, BWBR0045754).",
  },
  {
    id: "schade",
    titel: "Schadevergoeding aanvragen",
    kort: "Stel de politie aansprakelijk voor letsel of andere schade.",
    wanneer:
      "Als je door politieoptreden schade hebt geleden: letsel, kapotte spullen, inkomensverlies of kosten die je moest maken. Bewaar bewijs: medische stukken, foto's, bonnetjes, getuigen.",
    waar:
      "Bij de Nationale Politie, de eenheid waar de betrokken medewerker werkt. Je kunt een aansprakelijkstellingsbrief sturen, gericht aan de politiechef of de juridische afdeling.",
    letOp: [
      "Onderbouw de schade met stukken en houd bij wat je precies claimt. Bij letsel: laat een advocaat meekijken, ook voor de medische kant.",
      "Reageert de politie niet of wijst ze de claim af? Dan kun je naar de civiele rechter. Een advocaat is dan verstandig.",
      "Kijk ook of je een rechtsbijstandsverzekering hebt of terechtkunt bij het Juridisch Loket (0900 8020).",
      "Deze brief verplicht de politie niet tot betalen; het is een officiële stap die je positie vastlegt.",
    ],
    bron: "Algemene regels over overheidsaansprakelijkheid (Boek 6 Burgerlijk Wetboek) en de werkwijze van de politie.",
  },
];

export interface BriefVelden {
  vandaag: string;
  naam: string;
  adres: string;
  postcodePlaats: string;
  email: string;
  telefoon: string;
  datumGebeurtenis: string;
  plaatsGebeurtenis: string;
  omschrijving: string;
  eenheid: string;
  doel: string;
  klachtDatum: string;
  klachtStand: string;
  ontevreden: string;
  parket: string;
  beslissingDatum: string;
  advocaat: string;
  orgaan: string;
  documenten: string;
  schadeOmschrijving: string;
  schadeBedrag: string;
}

export function legeVelden(): BriefVelden {
  return {
    vandaag: "",
    naam: "",
    adres: "",
    postcodePlaats: "",
    email: "",
    telefoon: "",
    datumGebeurtenis: "",
    plaatsGebeurtenis: "",
    omschrijving: "",
    eenheid: "",
    doel: "",
    klachtDatum: "",
    klachtStand: "",
    ontevreden: "",
    parket: "",
    beslissingDatum: "",
    advocaat: "",
    orgaan: "",
    documenten: "",
    schadeOmschrijving: "",
    schadeBedrag: "",
  };
}

function of(vulIn: string): string {
  return vulIn.trim() ? vulIn.trim() : "[vul in]";
}

function optie(label: string, waarde: string): string {
  return waarde.trim() ? `${label} ${waarde.trim()}\n` : "";
}

function afsluiting(velden: BriefVelden): string {
  return [
    "Hoogachtend,",
    "",
    velden.naam.trim() || "[naam]",
    velden.adres.trim() || "[adres]",
    velden.postcodePlaats.trim() || "[postcode en plaats]",
    velden.telefoon.trim() || "",
    velden.email.trim() || "",
  ]
    .filter((regel, index) => regel !== "" || index === 1)
    .join("\n");
}

export function maakBrief(type: ModelbriefType, velden: BriefVelden): string {
  const datumVandaag = velden.vandaag || "[datum]";
  const delen = velden.postcodePlaats.trim().split(/\s+/);
  const woonplaats =
    delen.length > 2 && /^\d{4}/.test(delen[0])
      ? delen.slice(2).join(" ")
      : delen.join(" ") || "[plaats]";
  const plaatsDatum = `${woonplaats}, ${datumVandaag}`;

  if (type === "klacht-politie") {
    return `Aan: de politiechef van de eenheid ${of(velden.eenheid)}
Nationale Politie

${plaatsDatum}

Betreft: klacht over het optreden van de politie op ${of(velden.datumGebeurtenis)} in ${of(velden.plaatsGebeurtenis)}

Geachte heer, mevrouw,

Hierbij dien ik een klacht in over het optreden van een of meer medewerkers van uw eenheid.

Wat is er gebeurd:
${of(velden.omschrijving)}

${optie("Datum en plaats:", `${of(velden.datumGebeurtenis)}, ${of(velden.plaatsGebeurtenis)}`)}${optie("Mijn doel met deze klacht:", velden.doel)}
Ik verzoek u deze klacht in behandeling te nemen en mij te laten weten hoe de klacht wordt afgehandeld. Ik ben bereid een mondelinge toelichting te geven.

${afsluiting(velden)}

Bijlagen: [noem hier je bewijsstukken, bijvoorbeeld foto's, filmpjes of namen van getuigen]`;
  }

  if (type === "ombudsman") {
    return `Aan: Nationale ombudsman
Antwoordnummer 10870
2501 WB Den Haag

${plaatsDatum}

Betreft: klacht over de behandeling van mijn klacht door de politie, eenheid ${of(velden.eenheid)}

Geachte heer, mevrouw,

Op ${of(velden.klachtDatum)} heb ik bij de politie een klacht ingediend over een gebeurtenis op ${of(velden.datumGebeurtenis)} in ${of(velden.plaatsGebeurtenis)}.

Stand van zaken: ${of(velden.klachtStand)}

Ik ben niet tevreden over de behandeling van mijn klacht, omdat:
${of(velden.ontevreden)}

Ik verzoek u te onderzoeken of de politie zorgvuldig en behoorlijk met mijn klacht is omgegaan.

${afsluiting(velden)}

Bijlagen: [kopie van je klacht aan de politie en van de reactie van de politie, plus eventueel andere stukken]`;
  }

  if (type === "artikel12") {
    return `Aan: het gerechtshof Arnhem-Leeuwarden
t.a.v. de griffie
[postadres van het gerechtshof]

${plaatsDatum}

Betreft: klaagschrift op grond van artikel 12 Wetboek van Strafvordering

Geachte leden van het gerechtshof,

Hierbij doe ik beklag over het besluit van het Openbaar Ministerie (parket ${of(velden.parket)}) om het strafbare feit dat tegen mij is gepleegd niet (verder) te vervolgen.

Wat is er gebeurd:
${of(velden.omschrijving)}

Datum en plaats van het feit: ${of(velden.datumGebeurtenis)}, ${of(velden.plaatsGebeurtenis)}.
De beslissing van het Openbaar Ministerie is mij bekend geworden op ${of(velden.beslissingDatum)}.

Ik ben rechtstreeks belanghebbende bij de vervolging van dit feit. Ik verzoek het gerechtshof de officier van justitie te bevelen de vervolging in te stellen op grond van artikel 12i Wetboek van Strafvordering.
${optie("Ik word bijgestaan door:", velden.advocaat)}
${afsluiting(velden)}

Bijlagen: [beslissing van het Openbaar Ministerie, bewijsstukken, eventueel aangifte en processen-verbaal]`;
  }

  if (type === "woo") {
    return `Aan: ${of(velden.orgaan)}
t.a.v. de Woo-contactpersoon

${plaatsDatum}

Betreft: verzoek om informatie op grond van de Wet open overheid

Geachte heer, mevrouw,

Op grond van artikel 4.1 van de Wet open overheid verzoek ik u mij de volgende informatie te verstrekken:

${of(velden.documenten)}

Ik verzoek u de informatie digitaal aan mij te verstrekken, per e-mail of via een link. Als bepaalde onderdelen niet openbaar kunnen worden gemaakt, verzoek ik u de rest wel te verstrekken.

Ik attendeer u erop dat u op grond van artikel 4.4 van de Wet open overheid binnen vier weken op dit verzoek beslist, met de mogelijkheid van verdaging van ten hoogste twee weken.

${afsluiting(velden)}`;
  }

  return `Aan: de Nationale Politie, eenheid ${of(velden.eenheid)}
t.a.v. de politiechef en de afdeling juridische zaken

${plaatsDatum}

Betreft: aansprakelijkstelling en verzoek tot vergoeding van schade

Geachte heer, mevrouw,

Op ${of(velden.datumGebeurtenis)} in ${of(velden.plaatsGebeurtenis)} heb ik schade geleden door het optreden van een of meer politieambtenaren van uw eenheid. Hierbij stel ik de Nationale Politie aansprakelijk voor deze schade.

Wat is er gebeurd:
${of(velden.omschrijving)}

De schade bestaat uit:
${of(velden.schadeOmschrijving)}
${optie("Bedrag:", velden.schadeBedrag)}
Ik onderbouw de schade met de bijgevoegde stukken. Ik verzoek u de schade aan mij te vergoeden. Ik verzoek u binnen vier weken te reageren.

${afsluiting(velden)}

Bijlagen: [medische stukken, foto's, bonnen, bewijs van inkomensverlies, eventueel het klachtdossier]`;
}
