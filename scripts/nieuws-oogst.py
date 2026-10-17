#!/usr/bin/env python3
"""Oogst nieuwsartikelen over politiegeweld via de Exa-zoekdienst (MCP,
zonder sleutel) en schrijft src/lib/nieuws-geoogst.ts.

Alleen koppen, bron, datum en link; wij publiceren zelf geen artikelen.

Gebruik: python3 scripts/nieuws-oogst.py
"""

import json
import pathlib
import re
import time
import urllib.parse
import urllib.request
from datetime import date

WORTEL = pathlib.Path(__file__).resolve().parent.parent
UIT = WORTEL / "src/lib/nieuws-geoogst.ts"
MCP = "https://mcp.exa.ai/mcp"
UA = "Mozilla/5.0 (X11; Linux x86_64) ActieplatformPolitiegeweld-oogst"

ZOEKTERMEN = [
    "politiegeweld",
    "politie geweld aanhouding",
    "overleden na aanhouding politie",
    "doodgeschoten door politie",
    "politie schiet slachtoffer",
    "politieagent veroordeeld geweld",
    "politieagent vervolgd",
    "rijksrecherche onderzoek politie",
    "politie mishandeling arrestant",
    "nekklem politie",
    "politie taser geweld incident",
    "dodelijk politieoptreden",
    "politiegeweld demonstratie",
    "geweld tegen politieagent",
    "Mitch Henriquez",
    "Alfredo Goeloe",
    "Mateusz Rotterdam aanhouding",
    "Bekim Hasani politie",
    "Umaru Sesay",
    "Eggy Uitenwerf",
    "Tomy Holten Zwolle",
    "Jerryson Capelle schietincident",
    "Timothy Waalwijk politie",
    "agent mishandeld aanhouding",
    # Geweld zonder dodelijke afloop (gewonden, letsel, proces)
    "gewond geraakt door politieoptreden",
    "politie schiet gewonde omstander",
    "mishandeling door politie aangifte",
    "politiehond bijt slachtoffer",
    "taser politie slachtoffer letsel",
    "buitenproportioneel politiegeweld zaak",
    "schadevergoeding politiegeweld rechter",
    "artikel 12 Sv politiegeweld",
    "commissie geweldsaanwending oordeel",
    # Aanrijdingen en gevaar op de weg door politie
    "politieauto aanrijding",
    "politieauto schept voetganger",
    "politie rijdt fietser aan",
    "aanrijding door politieauto",
    "politieauto overrijdt",
    "politie veroorzaakt ongeluk",
    "fietser aangereden door politie",
    "agent rijdt kind aan",
    "politiebus ongeluk gewonden",
    "politie rijdt in op menigte",
    # Geweld: slaan, schoppen, trappen, wapenstok, pepperspray
    "politie slaat man",
    "politie slaat vrouw",
    "politie schopt",
    "politie trapt",
    "agent gebruikt geweld",
    "politie gebruikt geweld",
    "politie hardhandig optreden",
    "politie pakt hard aan",
    "wapenstok politie",
    "pepperspray politie geweld",
]

PER_ZOEKTERM = 50

BUITENSLUIT = (
    "wikipedia.org",
    "youtube.com",
    "facebook.com",
    "x.com",
    "twitter.com",
    "linkedin.com",
    "instagram.com",
    "tiktok.com",
    "rechtspraak.nl",
    "lexboost.com",
    "uitspraken.nl",
    "openrechtspraak.nl",
    "google.com",
    "politie.nl",
    "zoek.officielebekendmakingen.nl",
    "eerstekamer.nl",
    "tweedekamer.nl",
    "open.overheid.nl",
    "headliner.nl",
    "qoshe.com",
    "oozo.nl",
    "exa.ai",
    "research.vu.nl",
    "stadindex.nl",
    "drimble.nl",
    "leeshet.nl",
    "leeshetnieuws.nl",
    "socialnieuws.nl",
    "inview.nl",
    "affl.com",
    "periskopi.com",
    "waterkant.net",
    "surinamenieuwscentrale.com",
    "comitep.be",
    "demorgen.be",
    "hln.be",
    "vrt.be",
    "moordplekken.nl",
    "berthub.eu",
    "doorbraak.eu",
    "regioplan.nl",
    "amnesty.nl",
)

BRON_PER_DOMEIN = {
    "nos.nl": "NOS",
    "nu.nl": "NU.nl",
    "ad.nl": "AD",
    "telegraaf.nl": "De Telegraaf",
    "volkskrant.nl": "de Volkskrant",
    "trouw.nl": "Trouw",
    "nrc.nl": "NRC",
    "parool.nl": "Het Parool",
    "rtl.nl": "RTL Nieuws",
    "rtlnieuws.nl": "RTL Nieuws",
    "om.nl": "Openbaar Ministerie",
    "rijksrecherche.nl": "Rijksrecherche",
    "politie.nl": "Politie",
    "controlealtdelete.nl": "Controle Alt Delete",
    "gelderlander.nl": "De Gelderlander",
    "destentor.nl": "De Stentor",
    "tubantia.nl": "Tubantia",
    "bd.nl": "Brabants Dagblad",
    "ed.nl": "Eindhovens Dagblad",
    "pzc.nl": "PZC",
    "dvhn.nl": "Dagblad van het Noorden",
    "lc.nl": "Leeuwarder Courant",
    "rtvnoord.nl": "RTV Noord",
    "rtvdrenthe.nl": "RTV Drenthe",
    "omropfryslan.nl": "Omrop Fryslân",
    "rtvoost.nl": "RTV Oost",
    "gld.nl": "Omroep Gelderland",
    "omroepgelderland.nl": "Omroep Gelderland",
    "rtvutrecht.nl": "RTV Utrecht",
    "omroepwest.nl": "Omroep West",
    "rijnmond.nl": "Rijnmond",
    "omroepbrabant.nl": "Omroep Brabant",
    "omroepzeeland.nl": "Omroep Zeeland",
    "l1.nl": "L1",
    "at5.nl": "AT5",
    "nhnieuws.nl": "NH Nieuws",
    "omroepflevoland.nl": "Omroep Flevoland",
    "blikopnieuws.nl": "Blik op Nieuws",
    "metronieuws.nl": "Metro",
    "joop.nl": "JOOP",
    "pointer.kro-ncrv.nl": "Pointer",
    "eenvandaag.avrotros.nl": "EenVandaag",
    "vice.com": "VICE",
    "republiq.nl": "Republiq",
    "nl.newz.com": "Newz",
    "dagelijksestandaard.nl": "Dagelijkse Standaard",
    "oost.nl": "Oost",
    "openrotterdam.nl": "OPEN Rotterdam",
    "nieuws.nl": "Nieuws.nl",
    "112vdg.nl": "112 Vandaag",
    "crime-nieuws.nl": "Crime Nieuws",
    "hartvannederland.nl": "Hart van Nederland",
    "nltimes.nl": "NL Times",
    "rd.nl": "Reformatorisch Dagblad",
    "frontpage.fok.nl": "FOK",
    "limburger.nl": "De Limburger",
    "duic.nl": "DUIC",
}

# Strikte relevantie: alleen politiegeweld en agenten buiten de regels.
_P = r"(politie|politieagent|politieambtenaar|agent|agenten|verbalisant|wetshandhaver)"
_A = r"(politieagent|politieambtenaar|agent|agenten|verbalisant)"
PATRONEN = [
    r"(doodgeschoten|neergeschoten) door (de |een )?(politie|agent|politieagent|politieambtenaar)|door (de |een )?(politie|agent|politieagent|politieambtenaar)[a-zèé']* (doodgeschoten|neergeschoten)|politiekogel|dodelijk schietincident met de politie|dodelijk politieoptreden|dodelijk politie-ingrijpen",
    r"(overleed|overleden|om het leven gekomen|omgekomen|doodgeschoten|neergeschoten)[^.]{0,60}(aanhouding|arrestatie|politiecel|politie-?cel|vervoer|politieoptreden|politie-?ingrijpen|achtervolging|nekklem|taser|pepperspray|politiegeweld)",
    r"(aanhouding|arrestatie|politiecel|politie-?cel|vervoer|politieoptreden|achtervolging|nekklem|taser|politiegeweld)[^.]{0,60}(overleed|overleden|om het leven|omgekomen|dodelijk)",
    r"politiegeweld|geweldsexces|(buitensporig|disproportioneel|excessief) geweld[^.]{0,60}(politie|agent)|(politie|agent)[^.]{0,60}(buitensporig|disproportioneel|excessief) geweld",
    rf"{_A}[^.]{{0,80}}(veroordeeld|vervolgd|vrijgesproken|mishandel|geslagen|geschopt|geschoten|nekklem|doodslag|dood door schuld|buiten het boekje)",
    rf"(veroordeeld|vervolgd|vrijgesproken|beschuldigd|verdachte)[^.]{{0,60}}(politieagent|politieambtenaar|agent|agenten|verbalisant)",
    r"rijksrecherche",
    r"artikel 12|12-procedure|12 sv|klaagschrift",
    r"(aansprakelijk|schadevergoeding|onrechtmatige daad|onrechtmatig)[^.]{0,80}(politie|politieoptreden|aanhouding|schietincident|achtervolging)",
    r"(politie|politieauto|politiebus|dienstauto)(?!\s*(onderzoekt|onderzocht|doet|zoekt)\b)[^.]{0,80}(achtervolging|reed in|rijdt in|aanrijding|crash|ongeval)[^.]{0,80}(gewond|gewonden|letsel|dodelijk|overleed|overleden|omgekomen|bekneld|zwaargewond)",
    # Politie als veroorzaker van een aanrijding of ongeval (actor-route,
    # slachtoffer-eerst, en politievoertuig als botser). Lookaheads blokkeren
    # "politie onderzoekt ongeval" (dan is de politie geen actor).
    r"(politieauto|politieauto's|politiebus|politiebusje|politievoertuig|politiewagen|dienstauto|politiemotor|politiemotoren)(?![^.]{0,20}\bonderz(oekt|ocht)\b)[^.]{0,60}(botst|botste|crash|crasht|crashte|schept|schepte|schampt|schampte|overrijdt|overreed|overreden|rijdt in|reed in|ramt|ramde|klapt|klapte|veroorzaakt|veroorzaakte|gewond|letsel)",
    r"(aanrijding|botsing|ongeval|ongeluk|crash)[^.]{0,40}(met (de |een )?(politieauto|politiebus|politiebusje|politievoertuig|politiewagen|dienstauto|politiemotor)|door (de |een )?(politie|politieagent|politieauto|politiebus|politievoertuig|marechaussee))",
    r"(politieauto|politieauto's|politiebus|politiebusje|politievoertuig|politiewagen|dienstauto|politiemotor)(?![^.]{0,20}\bonderz(oekt|ocht)\b)[^.]{0,40}(in botsing|in aanrijding|in een botsing|in een aanrijding|botst met|aanrijding met|botsing met)",
    r"(fietser|voetganger|scooter|brommer|motorrijder|skateboarder|hardloper|kind|jongen|meisje|man|vrouw|persoon|inwoner|omstander|passant|slachtoffer)(?![^.]{0,20}\bonderz(oekt|ocht)\b)[^.]{0,80}(aangereden|geschept|overreden|geraakt|gewond|letsel|omgekomen|overleden)[^.]{0,60}door (de |een )?(politie|politieagent|agent|politieauto|politiebus|politievoertuig|dienstauto|politiemotor|marechaussee)",
    r"(politie|politieagent|agent|politieauto|politiebus|politievoertuig|politiewagen|dienstauto|politiemotor|marechaussee)(?!\s*(onderzoekt|onderzocht|doet|zoekt)\b)[^.]{0,60}(schept|schepte|rijdt aan|reed aan|rijdt in op|reed in op|overrijdt|overreed|ramt|ramde|raakt|raakte|botst|botste)[^.]{0,60}(fietser|voetganger|scooter|brommer|motorrijder|kind|jongen|meisje|man|vrouw|persoon|inwoner|omstander|passant|slachtoffer|menigte|demonstranten|betogers)",
    r"(politie|politieagent|agent|politieauto|politiebus|dienstauto|marechaussee)(?!\s*(onderzoekt|onderzocht|zoekt)\b)[^.]{0,80}(veroorzaakt|veroorzaakte)[^.]{0,80}(ongeval|ongeluk|aanrijding|botsing|crash|letsel|gewond)",
    r"(politie|politieagent|agent|politieauto|politiebus|politievoertuig|politiewagen|dienstauto|politiemotor|marechaussee)(?!\s*(onderzoekt|onderzocht|doet|zoekt)\b)[^.]{0,60}(rijdt|reed|rijden|reden)[^.]{0,40}(fietser|voetganger|scooter|brommer|motorrijder|skateboarder|kind|jongen|meisje|man|vrouw|persoon|inwoner|omstander|passant|slachtoffer|menigte|demonstranten|betogers)\s+aan\b",
    r"(politieauto|politiebus|politievoertuig|politiewagen|dienstauto|politiemotor)(?![^.]{0,20}\bonderz(oekt|ocht)\b)[^.]{0,50}(door rood|spookreed|spookrijdt|te hard|te snel|roekeloos|gevaarlijk rijgedrag)[^.]{0,80}(gewond|letsel|ongeval|ongeluk|aanrijding|botsing|crash|overleden|dodelijk|omgekomen)",
    r"(gewond|letsel|overleden|omgekomen)[^.]{0,60}(nadat|toen|doordat|omdat)[^.]{0,40}(politieauto|politiebus|politievoertuig|politiewagen|dienstauto|politiemotor|marechaussee)",
    r"(politie|politieagent|agent|politieauto|politiebus|dienstauto|marechaussee)[^.]{0,80}(in gevaar gebracht|in gevaar bracht|in gevaar brengt|in gevaar brengen|levensgevaar)",
    r"(achtervolging|achtervolgd|achtervolgde)[^.]{0,80}(politie|politieauto|politiebus)[^.]{0,80}(ongeval|ongeluk|aanrijding|botsing|crash|gewond|letsel|dodelijk|overleed|overleden|omgekomen|geschept|aangereden|overreden)",
    rf"{_P}[^.]{{0,60}}(schoot|schiet|schoten|vuurwapen)[^.]{{0,60}}(man|vrouw|jongen|meisje|slachtoffer|verdachte|inwoner|persoon|omstander)",
    rf"{_P}[^.]{{0,50}}(nekklem|klemgreep|verwurg)",
    # Fysiek geweld door de politie zelf: losse werkwoorden (slaan, schoppen,
    # trappen, duwen, sleuren, wurgen), wapenstok/pepperspray en "met geweld"/
    # "hardhandig optreden".
    rf"{_P}[^.]{{0,60}}(slaat|sloeg|sloegen|schopt|schopte|schopten|trapt|trapte|trapten|duwt|duwde|duwden|sleurt|sleurde|sleurden|knijpt|kneep|wurgt|wurgde|verwurgt|neerslaat|sloeg neer|neergeslagen|tackelt|tackelde)[^.]{{0,80}}(man|vrouw|jongen|meisje|kind|persoon|burger|omstander|passant|slachtoffer|arrestant|verdachte|demonstrant|betoger|journalist|fotograaf|verslaggever)",
    rf"{_P}[^.]{{0,50}}(met geweld|geweld gebruikt|geweld gebruikte|gebruikt geweld|hardhandig|treedt hard op|trad hard op|pakt hard aan|pakte hard aan)",
    rf"{_P}[^.]{{0,50}}(wapenstok|pepperspray|matrak|knuppel)[^.]{{0,60}}(gebruikt|gebruikte|ingezet|slaat|sloeg|raakt|raakte|tegen)",
]


# Politie als slachtoffer (geen politiegeweld): een ander rijdt in op de
# politie, of alleen agenten raken gewond zonder dat zij iemand aanreden.
# De agent-gewond-check is bewust nauw: "gewonde" (het slachtoffer in de
# zin) mag niet als "agent gewond" tellen.
AGENT_GEWOND = (
    r"\b(agent|agente|politieagent|politieagente)(en|s|es)?\b(?:\s+\w+){0,2}\s+(gewond|letsel|ziekenhuis|opgenomen)\b"
    r"|\b(gewonde|zwaargewonde|ernstig gewonde)\s+(agent|agente|politieagent|politieagente)(en|s)?\b"
)
POLITIE_ACTOR_PERSOON = (
    r"(politie|politieagent|agente|agent|politieauto|politiebus|politiebusje|politievoertuig|politiewagen|dienstauto|politiemotor|marechaussee)[^.]{0,60}(schept|schepte|rijdt[^.]{0,30}\baan\b|reed[^.]{0,30}\baan\b|overrijdt|overreed|ramt|ramde|raakt|raakte|schiet|schoot|schoten)[^.]{0,60}(fietser|voetganger|scooter|brommer|motorrijder|skateboarder|kind|jongen|meisje|man|vrouw|persoon|inwoner|omstander|passant|slachtoffer|menigte|demonstranten|betogers)"
)
SLACHTOFFER_PATRONEN = [
    r"(bestuurder|automobilist|man|vrouw|jongen|meisje|kind|persoon|busje|lijnbus|bestelbus|scooter|fietser|verdachte|inwoner|bewoner|vrachtwagen|bus)\b[^.]{0,60}(rijdt[^.]{0,30}in op|reed[^.]{0,30}in op|inrijdt[^.]{0,20}op|inreed[^.]{0,20}op|botst op|botste op|klapt op|klapte op|ramt|ramde|rijdt tegen|reed tegen)[^.]{0,40}(politie|marechaussee)",
    r"\bauto\b[^.]{0,60}(rijdt[^.]{0,30}in op|reed[^.]{0,30}in op|inrijdt[^.]{0,20}op|inreed[^.]{0,20}op)[^.]{0,30}(politie|marechaussee)",
    r"(busje|lijnbus|bestelbus|bus|auto|vrachtwagen|man|vrouw|bestuurder|automobilist|verdachte)\b[^.]{0,50}\bop (de |een )?(politie|politieauto|politiebus|politiebusje|politiewagen|politievoertuig|dienstauto|politiemotor|marechaussee)[^.]{0,30}\b(inrijdt|inreed|rijdt in|reed in|klapt|klapte|botst|botste|ramt|ramde)",
]


def is_politiegeweld(tekst):
    t = tekst.lower()
    if not re.search(r"politie|agent|verbalisant|marechaussee", t):
        return False
    # Buitenlandse politie valt buiten dit platform.
    if re.search(
        r"(belgische|duitse|franse|amerikaanse|britse|vlaamse|waalse|spaanse|italiaanse)\s+(agent|agenten|politie|politieagent|politieagenten)\b",
        t,
    ):
        return False
    if re.search(
        r"(frankrijk|belgië|duitsland|verenigd koninkrijk|spanje|italië|verenigde staten|antwerpen|brussel|parijs|vlaanderen|wallonië)",
        t,
    ):
        return False
    if re.search(AGENT_GEWOND, t) and not re.search(POLITIE_ACTOR_PERSOON, t):
        return False
    for patroon in SLACHTOFFER_PATRONEN:
        if re.search(patroon, t):
            return False
    for patroon in PATRONEN:
        treffer = re.search(patroon, t)
        if not treffer:
            continue
        begin = max(0, treffer.start() - 150)
        eind = min(len(t), treffer.end() + 150)
        if re.search(r"politie|agent|verbalisant|marechaussee", t[begin:eind]):
            return True
    return False


def mcp_sessie():
    lichaam = json.dumps({
        "jsonrpc": "2.0",
        "id": 1,
        "method": "initialize",
        "params": {
            "protocolVersion": "2024-11-05",
            "capabilities": {},
            "clientInfo": {"name": "nieuws-oogst", "version": "1.0"},
        },
    }).encode()
    verzoek = urllib.request.Request(
        MCP,
        data=lichaam,
        headers={
            "Content-Type": "application/json",
            "Accept": "application/json, text/event-stream",
            "User-Agent": UA,
        },
    )
    with urllib.request.urlopen(verzoek, timeout=30) as antwoord:
        return antwoord.headers.get("mcp-session-id")


def mcp_zoek(sessie, term, aantal, id):
    lichaam = json.dumps({
        "jsonrpc": "2.0",
        "id": id,
        "method": "tools/call",
        "params": {
            "name": "web_search_exa",
            "arguments": {"query": term, "numResults": aantal},
        },
    }).encode()
    verzoek = urllib.request.Request(
        MCP,
        data=lichaam,
        headers={
            "Content-Type": "application/json",
            "Accept": "application/json, text/event-stream",
            "User-Agent": UA,
            "Mcp-Session-Id": sessie,
        },
    )
    with urllib.request.urlopen(verzoek, timeout=90) as antwoord:
        ruw = antwoord.read().decode()
    for regel in ruw.splitlines():
        if regel.startswith("data: "):
            data = json.loads(regel[6:])
            inhoud = data.get("result", {}).get("content", [])
            if inhoud:
                return inhoud[0].get("text", "")
    return ""


def parse_resultaten(tekst):
    items = []
    for blok in re.split(r"\n?Title: ", tekst)[1:]:
        titel = re.split(r"\n", blok, 1)[0].strip()
        url_match = re.search(r"\nURL:\s*(\S+)", blok)
        datum_match = re.search(r"\nPublished:\s*(\S+)", blok)
        auteur_match = re.search(r"\nAuthor:\s*(.+)", blok)
        if not titel or not url_match:
            continue
        url = url_match.group(1).strip()
        datum = (datum_match.group(1)[:10] if datum_match else "")
        if datum.startswith("N/A"):
            datum = ""
        auteur = (auteur_match.group(1).strip() if auteur_match else "")
        if auteur in ("N/A", "Unknown", "N/A "):
            auteur = ""
        items.append({"titel": titel, "url": url, "datum": datum, "auteur": auteur})
    return items


def bron_voor(url):
    domein = urllib.parse.urlparse(url).netloc.lower().replace("www.", "")
    for bekend, naam in BRON_PER_DOMEIN.items():
        if domein == bekend or domein.endswith("." + bekend):
            return naam
    return domein


PLAATS_CACHE = WORTEL / "scripts/nieuws-plaatsen.json"
CAD_CACHE = WORTEL / "scripts/cad-plaatsen.json"

# Extra bekende plaatsnamen naast de CAD-lijst.
EXTRA_PLAATSEN = [
    "Amsterdam", "Rotterdam", "Den Haag", "Utrecht", "Eindhoven", "Groningen",
    "Tilburg", "Almere", "Breda", "Nijmegen", "Apeldoorn", "Haarlem", "Arnhem",
    "Enschede", "Amersfoort", "Zaandam", "Zaanstad", "'s-Hertogenbosch",
    "Den Bosch", "Zwolle", "Leiden", "Leeuwarden", "Maastricht", "Dordrecht",
    "Ede", "Alkmaar", "Delft", "Deventer", "Venlo", "Helmond", "Oss",
    "Amstelveen", "Hilversum", "Heerlen", "Hengelo", "Purmerend", "Roosendaal",
    "Schiedam", "Vlaardingen", "Almelo", "Gouda", "Hoorn", "Middelburg",
    "Vlissingen", "Emmen", "Assen", "Lelystad", "Capelle aan den IJssel",
    "Waalwijk", "Goes", "Roermond", "Sittard", "Veenendaal", "Woerden", "Zeist",
    "Houten", "Barneveld", "Doetinchem", "Zutphen", "Harderwijk", "Kampen",
    "Weert", "Kerkrade", "Bergen op Zoom", "Molenlanden", "Hoogeveen", "Sneek",
]


def bekende_plaatsen():
    namen = set()
    if CAD_CACHE.exists():
        namen.update(json.loads(CAD_CACHE.read_text()).keys())
    namen.update(EXTRA_PLAATSEN)
    return sorted(namen, key=len, reverse=True)


def geocodeer_plaats(naam, cache):
    sleutel = naam.strip()
    if sleutel in cache:
        return cache[sleutel]
    url = "https://api.pdok.nl/bzk/locatieserver/search/v3_1/free?" + urllib.parse.urlencode(
        {"q": sleutel, "fq": "type:woonplaats", "rows": 1}
    )
    cache[sleutel] = None
    try:
        verzoek = urllib.request.Request(url, headers={"User-Agent": UA})
        with urllib.request.urlopen(verzoek, timeout=30) as antwoord:
            data = json.load(antwoord)
        docs = data.get("response", {}).get("docs", [])
        if docs:
            weergave = docs[0].get("weergavenaam", "")
            if sleutel.split()[0].lower() in weergave.lower():
                m = re.match(r"POINT\(([-0-9.]+) ([-0-9.]+)\)", docs[0].get("centroide_ll", ""))
                if m:
                    cache[sleutel] = [round(float(m.group(2)), 4), round(float(m.group(1)), 4)]
        time.sleep(0.25)
    except Exception:  # noqa: BLE001
        pass
    return cache[sleutel]


def plaats_uit_titel(titel, plaatsen):
    for naam in plaatsen:
        if naam in titel:
            return naam
    for patroon in [
        r"\bin ([A-Z][A-Za-zé'’\-]{2,20}(?: aan den [A-Z][a-z]+| aan de [A-Z][a-z]+)?)",
        r"\bte ([A-Z][A-Za-zé'’\-]{2,20}(?: aan den [A-Z][a-z]+| aan de [A-Z][a-z]+)?)",
    ]:
        treffer = re.search(patroon, titel)
        if treffer:
            kandidaat = treffer.group(1).strip()
            if kandidaat not in (
                "Nederland", "België", "Duitsland", "Justitie", "Politie",
                "Binnenland", "Buitenland",
            ):
                return kandidaat
    return None


def soort_voor(titel):
    if re.search(r"overleed|overleden|doodgeschoten|dodelijk|dood", titel, re.I):
        return "overleden"
    if re.search(r"agent[^.]{0,60}(veroordeeld|vervolgd)|politieagent[^.]{0,60}(veroordeeld|vervolgd)", titel, re.I):
        return "agent-vervolgd"
    if re.search(
        r"politiegeweld|geweldsexces|mishandel|geslagen|slaat|sloeg|schopt|schopte"
        r"|trapt|trapte|duwt|duwde|sleurt|sleurde|wurgt|verwurgt|nekklem"
        r"|klemgreep|taser|pepperspray|wapenstok|vuurwapen|schiet|schoot"
        r"|schoten|neergeschoten|doodgeschoten",
        titel,
        re.I,
    ):
        return "geweld"
    if re.search(
        r"politieauto|politiebus|politievoertuig|politiewagen|dienstauto|politiemotor"
        r"|aanrijding|geschept|aangereden|overreden|ongeval|ongeluk|botsing|schepte"
        r"|achtervolging",
        titel,
        re.I,
    ):
        return "gevaar"
    return "overig"


def lees_bestaande_items():
    """Lees de al geoogste items uit het TS-bestand zodat een nieuwe
    oogstronde niets laat verdwijnen (het bestand wordt herschreven)."""
    if not UIT.exists():
        return {}
    tekst = UIT.read_text(encoding="utf-8")
    items = {}
    for blok in re.finditer(r"\n  \{(.*?)\n  \},", tekst, re.S):
        item = {}
        for regel in blok.group(1).splitlines():
            m = re.match(r'\s*(\w+): (".*"|[\d.\-]+),?\s*$', regel)
            if not m:
                continue
            try:
                item[m.group(1)] = json.loads(m.group(2).rstrip(","))
            except json.JSONDecodeError:
                continue
        url = item.get("url", "")
        if url:
            items[url.rstrip("/")] = item
    return items


def main():
    sessie = mcp_sessie()
    if not sessie:
        raise SystemExit("geen MCP-sessie")
    print("sessie ok")
    PLAATSEN = bekende_plaatsen()
    print(f"{len(PLAATSEN)} bekende plaatsnamen")

    gevonden = {}
    for i, term in enumerate(ZOEKTERMEN, start=10):
        try:
            tekst = mcp_zoek(sessie, term, PER_ZOEKTERM, i)
            items = parse_resultaten(tekst)
            nieuw = 0
            for item in items:
                sleutel = item["url"].rstrip("/")
                if sleutel in gevonden:
                    continue
                if any(domein in item["url"] for domein in BUITENSLUIT):
                    continue
                if "ECLI" in item["titel"]:
                    continue
                if not is_politiegeweld(item["titel"]):
                    continue
                gevonden[sleutel] = item
                nieuw += 1
            print(f"  {term!r}: {len(items)} resultaten, {nieuw} nieuw (totaal {len(gevonden)})")
        except Exception as fout:  # noqa: BLE001
            print(f"  {term!r} faalde: {str(fout)[:80]}")
        time.sleep(1.2)

    items = []
    cache = {}
    if PLAATS_CACHE.exists():
        cache = json.loads(PLAATS_CACHE.read_text())
    vorige = lees_bestaande_items()
    for item in gevonden.values():
        entry = {
            "titel": item["titel"],
            "bron": bron_voor(item["url"]),
            "url": item["url"],
            "datum": item["datum"],
            "soort": soort_voor(item["titel"]),
        }
        if item.get("auteur"):
            entry["auteur"] = item["auteur"]
        kandidaat = plaats_uit_titel(item["titel"], PLAATSEN)
        if kandidaat:
            coord = geocodeer_plaats(kandidaat, cache)
            if coord:
                entry["plaats"] = kandidaat
                entry["lat"] = coord[0]
                entry["lng"] = coord[1]
        vorige[item["url"].rstrip("/")] = entry
    PLAATS_CACHE.write_text(json.dumps(cache, ensure_ascii=False, indent=1), encoding="utf-8")
    items = list(vorige.values())
    items.sort(key=lambda b: b["datum"], reverse=True)
    met_plaats = sum(1 for b in items if "lat" in b)
    print(f"plekken gevonden voor {met_plaats}/{len(items)} artikelen")

    regels = [
        'import type { NieuwsBericht } from "./nieuws-archief";',
        "",
        f"// Automatisch geoogst via Exa-zoekopdrachten op {date.today().isoformat()}.",
        "// Strikte selectie: alleen politiegeweld en agenten buiten de regels,",
        "// alleen van bekende nieuwsbronnen. Alleen koppen en links.",
        "export const NIEUWS_GEOOGST: NieuwsBericht[] = [",
    ]
    for item in items:
        regels.append("  {")
        for sleutel in ["titel", "bron", "url", "datum", "soort"]:
            regels.append(f"    {sleutel}: {json.dumps(item[sleutel], ensure_ascii=False)},")
        for sleutel in ["auteur", "plaats", "lat", "lng"]:
            if item.get(sleutel) is not None:
                regels.append(f"    {sleutel}: {json.dumps(item[sleutel], ensure_ascii=False)},")
        regels.append("  },")
    regels.append("];")
    UIT.write_text("\n".join(regels) + "\n", encoding="utf-8")
    print(f"klaar: {len(items)} artikelen in {UIT.relative_to(WORTEL)}")


if __name__ == "__main__":
    main()
