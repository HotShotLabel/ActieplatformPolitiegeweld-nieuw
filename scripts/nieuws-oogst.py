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
}


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
        if not titel or not url_match:
            continue
        url = url_match.group(1).strip()
        datum = (datum_match.group(1)[:10] if datum_match else "")
        if datum.startswith("N/A"):
            datum = ""
        items.append({"titel": titel, "url": url, "datum": datum})
    return items


def bron_voor(url):
    domein = urllib.parse.urlparse(url).netloc.lower().replace("www.", "")
    for bekend, naam in BRON_PER_DOMEIN.items():
        if domein == bekend or domein.endswith("." + bekend):
            return naam
    return domein


def soort_voor(titel):
    if re.search(r"overleed|overleden|doodgeschoten|dodelijk|dood", titel, re.I):
        return "overleden"
    if re.search(r"agent[^.]{0,60}(veroordeeld|vervolgd)|politieagent[^.]{0,60}(veroordeeld|vervolgd)", titel, re.I):
        return "agent-vervolgd"
    return "overig"


def main():
    sessie = mcp_sessie()
    if not sessie:
        raise SystemExit("geen MCP-sessie")
    print("sessie ok")

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
                gevonden[sleutel] = item
                nieuw += 1
            print(f"  {term!r}: {len(items)} resultaten, {nieuw} nieuw (totaal {len(gevonden)})")
        except Exception as fout:  # noqa: BLE001
            print(f"  {term!r} faalde: {str(fout)[:80]}")
        time.sleep(1.2)

    items = []
    for item in gevonden.values():
        items.append({
            "titel": item["titel"],
            "bron": bron_voor(item["url"]),
            "url": item["url"],
            "datum": item["datum"],
            "soort": soort_voor(item["titel"]),
        })
    items.sort(key=lambda b: b["datum"], reverse=True)

    regels = [
        'import type { NieuwsBericht } from "./nieuws-archief";',
        "",
        f"// Automatisch geoogst via Exa-zoekopdrachten op {date.today().isoformat()}.",
        "// Alleen koppen, bron, datum en link; artikelen staan bij de bron.",
        "export const NIEUWS_GEOOGST: NieuwsBericht[] = [",
    ]
    for item in items:
        regels.append("  {")
        for sleutel in ["titel", "bron", "url", "datum", "soort"]:
            regels.append(f"    {sleutel}: {json.dumps(item[sleutel], ensure_ascii=False)},")
        regels.append("  },")
    regels.append("];")
    UIT.write_text("\n".join(regels) + "\n", encoding="utf-8")
    print(f"klaar: {len(items)} artikelen in {UIT.relative_to(WORTEL)}")


if __name__ == "__main__":
    main()
