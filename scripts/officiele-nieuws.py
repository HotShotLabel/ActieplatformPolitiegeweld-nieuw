#!/usr/bin/env python3
"""Oogst nieuws van officiële bronnen die geen RSS hebben:
OM, Rechtspraak, Politie, Rijksoverheid en Inspectie JenV.
Schrijft src/lib/nieuws-officieel.ts. Draai: python3 scripts/officiele-nieuws.py
"""
import asyncio
import json
import os
import re
from urllib.parse import urlparse

import requests

from playwright.async_api import async_playwright

CHROME = os.path.expanduser("~/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome")
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36")
DOEL = os.path.join(os.path.dirname(__file__), "..", "src", "lib", "nieuws-officieel.ts")

BRONNEN = [
    ("Openbaar Ministerie", "https://www.om.nl/actueel/nieuws"),
    ("Rechtspraak", "https://www.rechtspraak.nl/nieuwsoverzicht"),
    ("Politie", "https://www.politie.nl/nieuws"),
    ("Rijksoverheid", "https://www.rijksoverheid.nl/actueel/nieuws"),
    ("Inspectie Justitie en Veiligheid", "https://www.inspectie-jenv.nl/actueel/nieuws"),
]
POLITIE = ["politie", "agent", "agenten", "politieagent", "marechaussee", "rijksrecherche"]
STRIKT = ["politiegeweld", "geweld door politie", "buitensporig geweld", "excessief geweld",
          "dood arrestant", "overleden na politie", "na politieoptreden", "politieoptreden",
          "agenten vervolgd", "agent vervolgd", "politieagent vervolgd", "agenten veroordeeld",
          "politieagent veroordeeld", "rijksrecherche onderzoekt", "tuchtrecht",
          "klacht tegen politie", "mishandeld door politie", "politie schiet", "schietincident"]
UITSLUIT = ["politie zoekt getuigen", "beroving", "inbraak", "overval", "winkelcriminaliteit",
            "geweld tegen politie", "mishandeling agent", "agent mishandeld", "agent geslagen",
            "agenten mishandeld", "agenten geslagen", "trouwstoet",
            "nekklem gehouden door verdachten", "probeerde te wurgen"]
MAANDEN = {"januari":"01","februari":"02","maart":"03","april":"04","mei":"05","juni":"06",
           "juli":"07","augustus":"08","september":"09","oktober":"10","november":"11","december":"12"}

def relevant(tekst):
    laag = tekst.lower()
    if any(w in laag for w in UITSLUIT):
        return False
    return any(w in laag for w in POLITIE) and any(w in laag for w in STRIKT)

def datum_uit_url(url):
    m = re.search(r"/(20\d\d)/(\d\d)/(\d\d)/", url)
    if m:
        return f"{m.group(1)}-{m.group(2)}-{m.group(3)}"
    m = re.search(r"/(20\d\d)/([a-z]+)/(\d\d)/", url)
    if m and m.group(2) in MAANDEN:
        return f"{m.group(1)}-{MAANDEN[m.group(2)]}-{m.group(3)}"
    m = re.search(r"/(20\d\d)/(\d\d)/", url)
    if m:
        return f"{m.group(1)}-{m.group(2)}-01"
    return ""

def searx_oogst():
    """Zoek oudere/recente officiële stukken die niet op de eerste lijstpagina staan."""
    hosts = {
        "om.nl": "Openbaar Ministerie",
        "rechtspraak.nl": "Rechtspraak",
        "politie.nl": "Politie",
        "rijksoverheid.nl": "Rijksoverheid",
        "inspectie-jenv.nl": "Inspectie Justitie en Veiligheid",
    }
    queries = [
        "site:om.nl politiegeweld", "site:om.nl agent vervolgd", "site:om.nl dood arrestant",
        "site:rechtspraak.nl politiegeweld", "site:rechtspraak.nl agent geweld",
        "site:politie.nl politiegeweld", "site:rijksoverheid.nl politiegeweld",
        "site:inspectie-jenv.nl politie geweld",
    ]
    uit = []
    for query in queries:
        try:
            r = requests.get("http://127.0.0.1:8080/search",
                             params={"q": query, "format": "json", "language": "nl"}, timeout=30)
            for result in r.json().get("results", []):
                url = str(result.get("url", "")).split("?")[0]
                host = urlparse(url).hostname or ""
                bron = next((b for h, b in hosts.items() if host.endswith(h)), "")
                titel = str(result.get("title", "")).strip()
                if not bron or not relevant(titel):
                    continue
                uit.append({"titel": titel[:180], "bron": bron, "url": url, "datum": datum_uit_url(url)})
        except Exception as fout:  # noqa: BLE001
            print(f"[SearXNG] {query!r} faalde: {str(fout)[:70]}")
    return uit

async def oogst():
    resultaten = []
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path=CHROME, headless=True, args=["--no-sandbox"])
        for bron, url in BRONNEN:
            pagina = await browser.new_page(user_agent=UA, locale="nl-NL", viewport={"width": 1280, "height": 900})
            try:
                await pagina.goto(url, wait_until="domcontentloaded", timeout=60000)
                await pagina.wait_for_timeout(7000)
                kandidaten = await pagina.evaluate("""() => {
                  const gezien = new Set();
                  return [...document.querySelectorAll('a')].map(a => ({
                    href: a.href,
                    tekst: (a.innerText || '').trim()
                  })).filter(x => x.tekst.length > 15 && x.href.includes('/nieuws'))
                    .filter(x => { if (gezien.has(x.href)) return false; gezien.add(x.href); return true; });
                }""")
                for k in kandidaten:
                    titel = k["tekst"].split("\n")[0].strip()[:180]
                    url_artikel = k["href"].split("?")[0]
                    if not relevant(titel + " " + k["tekst"]):
                        continue
                    resultaten.append({
                        "titel": titel,
                        "bron": bron,
                        "url": url_artikel,
                        "datum": datum_uit_url(url_artikel),
                    })
                print(f"[{bron}] {len(kandidaten)} links, {sum(1 for x in resultaten if x['bron']==bron)} relevant")
            except Exception as fout:  # noqa: BLE001
                print(f"[{bron}] faalde: {str(fout)[:90]}")
            await pagina.close()
        await browser.close()
    for x in searx_oogst():
        resultaten.append(x)
    # dedupe op URL
    uniek = {}
    for x in resultaten:
        uniek[x["url"]] = x
    return sorted(uniek.values(), key=lambda x: x["datum"], reverse=True)

def schrijf(items):
    regels = [
        "/* Automatisch gegenereerd door scripts/officiele-nieuws.py.",
        "   Officiële bronnen zonder RSS: OM, Rechtspraak, Politie, Rijksoverheid, JenV. */",
        'import type { NieuwsSoort } from "@/lib/nieuws-archief";',
        "",
        "export interface OfficieelBericht {",
        "  titel: string;",
        "  bron: string;",
        "  url: string;",
        "  datum: string;",
        "  soort: NieuwsSoort;",
        "}",
        "",
        "export const NIEUWS_OFFICIEEL: OfficieelBericht[] = [",
    ]
    for x in items:
        titel = json.dumps(x["titel"], ensure_ascii=False)
        bron = json.dumps(x["bron"], ensure_ascii=False)
        url = json.dumps(x["url"], ensure_ascii=False)
        datum = json.dumps(x["datum"], ensure_ascii=False)
        regels.append(f'  {{ titel: {titel}, bron: {bron}, url: {url}, datum: {datum}, soort: "overig" }},')
    regels += ["];", ""]
    open(DOEL, "w", encoding="utf-8").write("\n".join(regels))

if __name__ == "__main__":
    items = asyncio.run(oogst())
    schrijf(items)
    print(f"geschreven: {len(items)} officiële berichten -> {DOEL}")
    for x in items[:12]:
        print("-", x["datum"], x["bron"], "|", x["titel"][:80])
