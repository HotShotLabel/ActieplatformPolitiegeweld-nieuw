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
  /(politie|politieauto|politiebus|dienstauto)[^.]{0,80}(achtervolging|reed in|rijdt in|aanrijding|crash|ongeval)[^.]{0,80}(gewond|dodelijk|overleed|overleden|omgekomen)/,
  new RegExp(
    `${P}[^.]{0,60}(schoot|schiet|schoten|vuurwapen)[^.]{0,60}(man|vrouw|jongen|meisje|slachtoffer|verdachte|inwoner|persoon|omstander)`
  ),
  new RegExp(`${P}[^.]{0,50}(nekklem|klemgreep|verwurg)`),
];

export function isPolitiegeweldNieuws(tekst: string): boolean {
  const t = tekst.toLowerCase();
  if (!/politie|agent|verbalisant/.test(t)) return false;
  for (const patroon of PATRONEN) {
    const treffer = patroon.exec(t);
    if (!treffer) continue;
    // Het trefwoord moet dicht bij politie/agent staan, anders is het een
    // bericht waarin toevallig beide woorden voorkomen (bijv. buitenland).
    const begin = Math.max(0, treffer.index - 150);
    const eind = Math.min(t.length, treffer.index + treffer[0].length + 150);
    if (/politie|agent|verbalisant/.test(t.slice(begin, eind))) return true;
  }
  return false;
}
