/* Strikte filter: alleen berichten waarin politiegeweld of het handelen van
   agenten buiten de regels centraal staat. Gewoon politienieuws (opsporingen,
   zoektochten, inbraken, drugs) valt hiermee af.

   Positieve gevallen:
   - iemand doodgeschoten/neergeschoten door de politie;
   - iemand overleed na aanhouding, politiecel, vervoer, achtervolging, geweld;
   - politiegeweld, buitensporig of disproportioneel politiegeweld;
   - agenten veroordeeld, vervolgd of vrijgesproken voor geweld;
   - onderzoek van de Rijksrecherche naar politieoptreden;
   - artikel 12 Sv-procedures over politiegeweld;
   - aansprakelijkheid en schadevergoeding na politieoptreden;
   - dodelijke of letselongevallen na een politieachtervolging;
   - schietincidenten waarbij de politie iemand raakt;
   - nekklemmen en verwurgingen door de politie. */

const P =
  "(politie|politieagent|politieambtenaar|agent|agenten|verbalisant|wetshandhaver)";
const A = "(politieagent|politieambtenaar|agent|agenten|verbalisant)";

/* Politie als slachtoffer (geen politiegeweld): een ander rijdt in op de
   politie, of alleen agenten raken gewond zonder dat zij iemand aanreden.
   De agent-gewond-check is bewust nauw: "gewonde" (het slachtoffer in de
   zin) mag niet als "agent gewond" tellen. */
const AGENT_GEWOND =
  /\b(agent|agente|politieagent|politieagente)(en|s|es)?\b(?:\s+\w+){0,2}\s+(gewond|letsel|ziekenhuis|opgenomen)\b|\b(gewonde|zwaargewonde|ernstig gewonde)\s+(agent|agente|politieagent|politieagente)(en|s)?\b/;
const POLITIE_ACTOR_PERSOON =
  /(politie|politieagent|agente|agent|politieauto|politiebus|politiebusje|politievoertuig|politiewagen|dienstauto|politiemotor|marechaussee)[^.]{0,60}(schept|schepte|rijdt[^.]{0,30}\baan\b|reed[^.]{0,30}\baan\b|overrijdt|overreed|ramt|ramde|raakt|raakte|schiet|schoot|schoten)[^.]{0,60}(fietser|voetganger|scooter|brommer|motorrijder|skateboarder|kind|jongen|meisje|man|vrouw|persoon|inwoner|omstander|passant|slachtoffer|menigte|demonstranten|betogers)/;
const SLACHTOFFER_PATRONEN: RegExp[] = [
  /(bestuurder|automobilist|man|vrouw|jongen|meisje|kind|persoon|busje|lijnbus|bestelbus|scooter|fietser|verdachte|inwoner|bewoner|vrachtwagen|bus)\b[^.]{0,60}(rijdt[^.]{0,30}in op|reed[^.]{0,30}in op|inrijdt[^.]{0,20}op|inreed[^.]{0,20}op|botst op|botste op|klapt op|klapte op|ramt|ramde|rijdt tegen|reed tegen)[^.]{0,40}(politie|marechaussee)/,
  /\bauto\b[^.]{0,60}(rijdt[^.]{0,30}in op|reed[^.]{0,30}in op|inrijdt[^.]{0,20}op|inreed[^.]{0,20}op)[^.]{0,30}(politie|marechaussee)/,
  /(busje|lijnbus|bestelbus|bus|auto|vrachtwagen|man|vrouw|bestuurder|automobilist|verdachte)\b[^.]{0,50}\bop (de |een )?(politie|politieauto|politiebus|politiebusje|politiewagen|politievoertuig|dienstauto|politiemotor|marechaussee)[^.]{0,30}\b(inrijdt|inreed|rijdt in|reed in|klapt|klapte|botst|botste|ramt|ramde)/,
];

const PATRONEN: RegExp[] = [
  /(doodgeschoten|neergeschoten) door (de |een )?(politie|agent|politieagent|politieambtenaar)|door (de |een )?(politie|agent|politieagent|politieambtenaar)[a-zèé']* (doodgeschoten|neergeschoten)|politiekogel|dodelijk schietincident met de politie|dodelijk politieoptreden|dodelijk politie-ingrijpen/,
  /(overleed|overleden|om het leven gekomen|omgekomen|doodgeschoten|neergeschoten)[^.]{0,60}(aanhouding|arrestatie|politiecel|politie-?cel|vervoer|politieoptreden|politie-?ingrijpen|achtervolging|nekklem|taser|pepperspray|politiegeweld)/,
  /(aanhouding|arrestatie|politiecel|politie-?cel|vervoer|politieoptreden|achtervolging|nekklem|taser|politiegeweld)[^.]{0,60}(overleed|overleden|om het leven|omgekomen|dodelijk)/,
  /politiegeweld|geweldsexces|(buitensporig|disproportioneel|excessief) geweld[^.]{0,60}(politie|agent)|(politie|agent)[^.]{0,60}(buitensporig|disproportioneel|excessief) geweld/,
  new RegExp(
    `${A}[^.]{0,80}(veroordeeld|vervolgd|vrijgesproken|mishandel|geslagen|geschopt|geschoten|nekklem|doodslag|dood door schuld|buiten het boekje)`
  ),
  new RegExp(
    `(veroordeeld|vervolgd|vrijgesproken|beschuldigd|verdachte)[^.]{0,60}(politieagent|politieambtenaar|agent|agenten|verbalisant)`
  ),
  /rijksrecherche/,
  /artikel 12|12-procedure|12 sv|klaagschrift/,
  /(aansprakelijk|schadevergoeding|onrechtmatige daad|onrechtmatig)[^.]{0,80}(politie|politieoptreden|aanhouding|schietincident|achtervolging)/,
  /(politie|politieauto|politiebus|dienstauto)(?!\s*(onderzoekt|onderzocht|doet|zoekt)\b)[^.]{0,80}(achtervolging|reed in|rijdt in|aanrijding|crash|ongeval)[^.]{0,80}(gewond|gewonden|letsel|dodelijk|overleed|overleden|omgekomen|bekneld|zwaargewond)/,
  // Politie als veroorzaker van een aanrijding of ongeval. Drie routes:
  // politievoertuig als botser, slachtoffer-eerst met "door politie", en
  // politie/agent die iemand aanrijdt. De negatieve lookahead blokkeert
  // "politie onderzoekt ongeval" (dan is de politie geen actor).
  /(politieauto|politieauto's|politiebus|politiebusje|politievoertuig|politiewagen|dienstauto|politiemotor|politiemotoren)(?![^.]{0,20}\bonderz(oekt|ocht)\b)[^.]{0,60}(botst|botste|crash|crasht|crashte|schept|schepte|schampt|schampte|overrijdt|overreed|overreden|rijdt in|reed in|ramt|ramde|klapt|klapte|veroorzaakt|veroorzaakte|gewond|letsel)/,
  /(aanrijding|botsing|ongeval|ongeluk|crash)[^.]{0,40}(met (de |een )?(politieauto|politiebus|politiebusje|politievoertuig|politiewagen|dienstauto|politiemotor)|door (de |een )?(politie|politieagent|politieauto|politiebus|politievoertuig|marechaussee))/,
  /(politieauto|politieauto's|politiebus|politiebusje|politievoertuig|politiewagen|dienstauto|politiemotor)(?![^.]{0,20}\bonderz(oekt|ocht)\b)[^.]{0,40}(in botsing|in aanrijding|in een botsing|in een aanrijding|botst met|aanrijding met|botsing met)/,
  /(fietser|voetganger|scooter|brommer|motorrijder|skateboarder|hardloper|kind|jongen|meisje|man|vrouw|persoon|inwoner|omstander|passant|slachtoffer)(?![^.]{0,20}\bonderz(oekt|ocht)\b)[^.]{0,80}(aangereden|geschept|overreden|geraakt|gewond|letsel|omgekomen|overleden)[^.]{0,60}door (de |een )?(politie|politieagent|agent|politieauto|politiebus|politievoertuig|dienstauto|politiemotor|marechaussee)/,
  /(politie|politieagent|agent|politieauto|politiebus|politievoertuig|politiewagen|dienstauto|politiemotor|marechaussee)(?!\s*(onderzoekt|onderzocht|doet|zoekt)\b)[^.]{0,60}(schept|schepte|rijdt aan|reed aan|rijdt in op|reed in op|overrijdt|overreed|ramt|ramde|raakt|raakte|botst|botste)[^.]{0,60}(fietser|voetganger|scooter|brommer|motorrijder|kind|jongen|meisje|man|vrouw|persoon|inwoner|omstander|passant|slachtoffer|menigte|demonstranten|betogers)/,
  /(politie|politieagent|agent|politieauto|politiebus|dienstauto|marechaussee)(?!\s*(onderzoekt|onderzocht|zoekt)\b)[^.]{0,80}(veroorzaakt|veroorzaakte)[^.]{0,80}(ongeval|ongeluk|aanrijding|botsing|crash|letsel|gewond)/,
  /(politie|politieagent|agent|politieauto|politiebus|politievoertuig|politiewagen|dienstauto|politiemotor|marechaussee)(?!\s*(onderzoekt|onderzocht|doet|zoekt)\b)[^.]{0,60}(rijdt|reed|rijden|reden)[^.]{0,40}(fietser|voetganger|scooter|brommer|motorrijder|skateboarder|kind|jongen|meisje|man|vrouw|persoon|inwoner|omstander|passant|slachtoffer|menigte|demonstranten|betogers)\s+aan\b/,
  /(politieauto|politiebus|politievoertuig|politiewagen|dienstauto|politiemotor)(?![^.]{0,20}\bonderz(oekt|ocht)\b)[^.]{0,50}(door rood|spookreed|spookrijdt|te hard|te snel|roekeloos|gevaarlijk rijgedrag)[^.]{0,80}(gewond|letsel|ongeval|ongeluk|aanrijding|botsing|crash|overleden|dodelijk|omgekomen)/,
  /(gewond|letsel|overleden|omgekomen)[^.]{0,60}(nadat|toen|doordat|omdat)[^.]{0,40}(politieauto|politiebus|politievoertuig|politiewagen|dienstauto|politiemotor|marechaussee)/,
  /(politie|politieagent|agent|politieauto|politiebus|dienstauto|marechaussee)[^.]{0,80}(in gevaar gebracht|in gevaar bracht|in gevaar brengt|in gevaar brengen|levensgevaar)/,
  /(achtervolging|achtervolgd|achtervolgde)[^.]{0,80}(politie|politieauto|politiebus)[^.]{0,80}(ongeval|ongeluk|aanrijding|botsing|crash|gewond|letsel|dodelijk|overleed|overleden|omgekomen|geschept|aangereden|overreden)/,
  new RegExp(
    `${P}[^.]{0,60}(schoot|schiet|schoten|vuurwapen)[^.]{0,60}(man|vrouw|jongen|meisje|slachtoffer|verdachte|inwoner|persoon|omstander)`
  ),
  new RegExp(`${P}[^.]{0,50}(nekklem|klemgreep|verwurg)`),
  // Fysiek geweld door de politie zelf: losse werkwoorden (slaan, schoppen,
  // trappen, duwen, sleuren, wurgen), wapenstok/pepperspray en "met geweld"/
  // "hardhandig optreden". De slachtoffer-uitsluiting hierboven voorkomt dat
  // berichten waarin de politie zélf gewond raakt meekomen.
  new RegExp(
    `${P}[^.]{0,60}(slaat|sloeg|sloegen|schopt|schopte|schopten|trapt|trapte|trapten|duwt|duwde|duwden|sleurt|sleurde|sleurden|knijpt|kneep|wurgt|wurgde|verwurgt|neerslaat|sloeg neer|neergeslagen|tackelt|tackelde)[^.]{0,80}(man|vrouw|jongen|meisje|kind|persoon|burger|omstander|passant|slachtoffer|arrestant|verdachte|demonstrant|betoger|journalist|fotograaf|verslaggever)`
  ),
  new RegExp(
    `${P}[^.]{0,50}(met geweld|geweld gebruikt|geweld gebruikte|gebruikt geweld|hardhandig|treedt hard op|trad hard op|pakt hard aan|pakte hard aan)`
  ),
  new RegExp(
    `${P}[^.]{0,50}(wapenstok|pepperspray|matrak|knuppel)[^.]{0,60}(gebruikt|gebruikte|ingezet|slaat|sloeg|raakt|raakte|tegen)`
  ),
];

export function isPolitiegeweldNieuws(tekst: string): boolean {
  const t = tekst.toLowerCase();
  if (!/politie|agent|verbalisant|marechaussee/.test(t)) return false;
  // Buitenlandse politie valt buiten dit platform (tenzij het over de
  // Nederlandse politie gaat, dan staat er geen land bij de actor).
  if (
    /(belgische|duitse|franse|amerikaanse|britse|vlaamse|waalse|spaanse|italiaanse)\s+(agent|agenten|politie|politieagent|politieagenten)\b/.test(
      t
    )
  ) {
    return false;
  }
  if (
    /(frankrijk|belgië|duitsland|verenigd koninkrijk|spanje|italië|verenigde staten|antwerpen|brussel|parijs|vlaanderen|wallonië)/.test(
      t
    )
  ) {
    return false;
  }
  // Politie als slachtoffer is geen politiegeweld: iemand anders rijdt in op
  // de politie, of alleen agenten raken gewond. Uitsluiten, tenzij de politie
  // duidelijk zélf iemand aanrijdt.
  if (AGENT_GEWOND.test(t) && !POLITIE_ACTOR_PERSOON.test(t)) return false;
  for (const patroon of SLACHTOFFER_PATRONEN) {
    if (patroon.test(t)) return false;
  }
  for (const patroon of PATRONEN) {
    const treffer = patroon.exec(t);
    if (!treffer) continue;
    // Het trefwoord moet dicht bij politie/agent staan, anders is het een
    // bericht waarin toevallig beide woorden voorkomen (bijv. buitenland).
    const begin = Math.max(0, treffer.index - 150);
    const eind = Math.min(t.length, treffer.index + treffer[0].length + 150);
    if (/politie|agent|verbalisant|marechaussee/.test(t.slice(begin, eind))) return true;
  }
  return false;
}
