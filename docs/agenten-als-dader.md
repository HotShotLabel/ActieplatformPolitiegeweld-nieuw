# Inventaris: politieambtenaren als dader (speurtocht 12-10-2026)

Vier-koppige speurtocht (rechtspraak-API uitputtend + webarchieven + nieuwsbanken).
Hieronder de kern; volledige uitwerking in de sessie-geschiedenis.

## Moord / doodslag (levensdelicten)

**Veroordeeld (bleef in leven):**
- Sander V. — surveillant Rotterdam-Rijnmond — Milly Boele (12), Dordrecht 2010 — 18 jaar + tbs.
- Judith F. — agente Flevoland — ex-partner, Almere 2008 (dienstwapen) — 10 jaar.
- Quency M. — agent Rotterdam — (ex-)vriendin, Rotterdam 2009 — 8 jaar.

**Vervolgd, niet bestraft:** Wessel (Delft 2018, ontslag rechtsvervolging),
Fazantstraat Rotterdam 2013 (putatief noodweer), Michael Koomen (Amsterdam 2011,
sepot), Waalwijk 2022 (vrijspraak). Caribisch: 2 agenten Aruba (2026) en
Gemeenschappelijk Hof (2026) wél veroordeeld voor dodelijk dienstgeweld.

**Dader overleed (geen vervolging): gezinsdrama's met dienstwapen:** Dordrecht
(Cardoze, 2019), Everdingen (Spans, 2020), Hilversum (Nijhoff, 2005), Kekerdom
(Petter, 2012), Ermelo (Nijveld, 2006), Winterswijk (2023), Almelo (2011).

## Zedendelicten

**Veroordeeld:** Sander L. + Bidjaykoemar D. (ontucht in dienstauto, Raalte 2012;
24 mnd); M.D. Brandwijk (ontucht 4 jongens; 2x veroordeeld); Bas S. (kinderporno,
22 mnd); H.W. Bennekom (14-jarige; 200 uur); Steven S. (Utrecht; 6 jaar + tbs,
2026); Aruba hoofdagent (verkrachting toeriste, 4 jaar).
**Lopend:** André N. (Werkendam, 4 minderjarige jongens).
**Vrijgesproken (2026):** Walco B., Onur I., Haarlemmermeer-teamchef (steunbewijs).

## Geweld tijdens dienst (dodelijk/zwaar)

**Veroordeeld:** Mitch Henriquez (nekklem; HR 2021), Heerenveen tractor (2023),
Eendrachtsweg Rotterdam (2014), Kerkrade arrestatie-eenheid (2015), apotheek
Hilversum (2025), vuistslag oogkas (hof 2021), oud-agenten schietpartij +
meineed (2015/2016).
**Lopend:** 8 agenten Rotterdam (dood Mateusz, 2023) — grootste groep ooit.
**Niet vervolgd (OM):** Jerryson Capelle (2025), Poolse arrestant Den Haag (2025).
**Vrijspraak/ontslag vervolging:** Blauwe Kamer-zaken (Delft, agente Rotterdam,
Scheveningen, Malieveld, Amersfoort, Hilversum-hond, Numansdorp, Bussum,
Deventer).

## Bronmethode
- Rechtspraak-API (uitspraken.rechtspraak.nl/api/zoek) met 30+ termen ->
  38 kern-ECLI's; let op: header __RequestVerificationToken: ELEMENT_NOT_FOUND
  is verplicht.
- Nieuwsarchieven (NOS/NU/AD/NRC/Trouw/Volkskrant/regionaal), Wikipedia,
  om.nl, rijksrecherche.nl, crimesite, moordatlas.
- Volledige overheidslijst bestaat niet (Databank Moord en Doodslag registreert
  beroep dader niet).

## Op de site gezet (12-10-2026, commit d14dc95)
13 curated zaken in de uitspraken-databank (incl. Milly Boele, Mitch Henriquez,
Heerenveen, Blauwe Kamer Delft, Almere, zedenzaken, Caribisch).

## Aanvulling 12-10-2026 (tweede speurronde)

**Nieuw gevonden agent-zaken (11, categorie ambtsmisbruik):** Fouad el A.
(Amsterdam 2025, 18 mnd; RBAMS:2025:4727), lekker IJmuiden (2025),
Almelo-lek (2 agenten, 2023), Nijverdal drugs (2018), Spijkenisse (2024),
Stadskanaal kinder-/dierenporno (2022), Ter Aar kinderporno, Horst vier
oud-agenten (2025), Doorn vals pv (RBMNE:2025:1357), Emmen meineed
(RBNNE:2023:516), Dordrecht discriminerende belediging (2021).
Ook toegevoegd: Curaçao unithoofd (OGHACMB:2025:127), Bonaire-vrijspraak
(OGEABES:2025:170).

**CAD-controle (speurhond):** de CAD-database mist een bevestigd geval:
de 28-jarige man uit Terneuzen die op 25-06-2026 overleed na een
politieachtervolging bij Kapellebrug (Omroep Zeeland). Toegevoegd als
aanvulling (bron: nieuwsbericht). CAD-cijfers versus OM: 2021 OM 12 vs CAD 6;
2022 OM 20 vs CAD 14; 2025 OM 22 vs CAD 19 -- CAD mist gevallen, met name
in anonieme jaren. Kapellebrug + Spijkenisse (politiecel) + Apeldoorn
(achtervolging 2024, bron nog op te halen) op de lijst.

**Bugs gefixt:** stapelende markers in dezelfde stad (Milly/Cardoze in
Dordrecht; archief Den Haag 4x, Amsterdam 5x; nieuws). Alle lagen krijgen nu
een kleine spreiding zodat elke zaak apart aanklikbaar is.

## Derde speurronde 12-10-2026 (alleen lokaal gedekt of zonder dekking)

Via rechtspraak.nl (full-text, ~40 zoektermen) en regionale omroepen zijn
negen nieuwe zaken op de kaart gezet en veertien zaken in de overige lijst,
waaronder zaken die nooit verder kwamen dan de rechtbank en dus nooit
landelijk in het nieuws waren:

Kaart (nieuw): Nijverdal 2026 (RBOVE:2026:3504, nep-bekeuringen, 240 uur
taakstraf), Hattem 2026 (RBGEL:2026:7428, meineed en valse pv's, 12 mnd),
Hengelo 2022 (RBOVE:2022:835, info voor drugs, 2 jr voorwaardelijk), Tilburg
2018 (RBZWB:2018:6333, lekken, 70 dagen), Zwolle 2022 (RBOVE:2022:2065,
30 mnd), Amsterdam 2025 (RBAMS:2025:7434, hoofdagent, 240 uur), Breda 2025
(RBZWB:2025:2880 reeks, vier agenten, meineed/onjuiste machtigingen),
Eindhoven 2022 (GHSHE:2022:517, wapenstok 13x, voorwaardelijk 4 mnd),
Vianen 2020 (corrupte motoragent, 4 jaar, RTV Utrecht).

Overige lijst (nieuw, stil): RBMNE:2025:168, RBNHO:2022:9498, GHDHA:2022:1063,
RBAMS:2021:5836, RBOVE:2023:2774, GHDHA:2026:1222, GHDHA:2026:2825,
GHDHA:2024:758 (+HR:2026:675), GHDHA:2022:2037, GHARL:2020:7901,
OGEABES:2025:139, OGEABES:2024:142, Eindhoven-brigadier 2016 (Omroep
Brabant), Enschede-stalker 2020 (RTV Oost).

Nog niet doorzocht: DPG/Mediahuis-krantenarchieven (De Stentor, Tubantia,
BN DeStem, PZC, Dagblad van het Noorden, Leeuwarder Courant); daar kunnen
extra lokaal-gedekte zaken zitten. Eén zaak met onbekende afloop (Brabantse
agent 2016, aangehouden voor lekken/witwassen) is bewust niet geplaatst.

## Vierde speurronde 12-10-2026 (DPG- en noordelijke krantenarchieven)

De live zoekfuncties van De Stentor, Tubantia, BN DeStem, PZC, De Gelderlander,
dvhn.nl en lc.nl dekken alleen de recente jaren. Via het Internet Archive
(CDX-API plus de gearchiveerde artikelen zelf) is de periode 2006-2016 alsnog
doorzocht. Resultaat:

- Coevorden 2025: politieagente (37) verdacht van lekken en computervredebreuk,
  zaak loopt (DVHN) - op de kaart.
- In de overige lijst: Pernis 2007 (vier agenten verdacht van dood door schuld),
  Tilburg 2008 (agente en de hennepdiefstal), Brabant 2013 (stalking), Eindhoven
  2013 (arrestatieteamlid en het dodelijk ongeval), Haarlem 2015 en Oosterhout
  2015 (schietincidenten door agenten), Wijk bij Duurstede 2016 (chantage op
  homoparkeerplaats) en twee Drentse/Groningse zaken uit 2026.
- Wat niet kon worden geverifieerd: het DVHN-artikel over gesjoemel met
  facturen bij de politie Noord-Nederland (alleen via zoekindex gezien) en de
  agent die in 2016 in Zeeland-West-Brabant werd aangehouden (afloop onbekend).
