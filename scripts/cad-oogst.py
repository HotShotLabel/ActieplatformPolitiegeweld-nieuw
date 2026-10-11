#!/usr/bin/env python3
"""Haalt de openbare database 'Overleden onder verantwoordelijkheid van
wetshandhavers' van Controle Alt Delete op en maakt er een databestand van
voor de kaart.

- Bron: https://overleden.controlealtdelete.nl/data.json (openbaar).
- Plaatsen worden eenmalig gegeocodeerd via de PDOK Locatieserver (officiele
  Nederlandse dienst, geen sleutel nodig) en bewaard in een cachebestand.
- Namen van overledenen komen NIET in ons databestand: de kaart toont jaar,
  plaats en feiten, en linkt naar de bron voor naam en verhaal.

Schrijft src/lib/cad-zaken.ts.

Gebruik: python3 scripts/cad-oogst.py
"""

import html
import json
import math
import pathlib
import re
import sys
import time
import urllib.parse
import urllib.request
from datetime import date

WORTEL = pathlib.Path(__file__).resolve().parent.parent
BRON = "https://overleden.controlealtdelete.nl/data.json"
CACHE = WORTEL / "scripts/cad-plaatsen.json"
UIT = WORTEL / "src/lib/cad-zaken.ts"
UA = "ActieplatformPolitiegeweld-oogst/1.0 (+https://actieplatform-politiegeweld-nieuw.vercel.app)"

# Schrijfwijzen uit de brondata corrigeren naar de officiele naam.
NAAM_FIX = {
    "Heereveen": "Heerenveen",
    "Den Bosch": "'s-Hertogenbosch",
    "Ijmuiden": "IJmuiden",
}

# Enkele plaatsen buiten Nederland of die de geocoder niet kent.
HANDMATIG = {
    "Mol (België)": (51.1910, 5.1156),
}


def haal_json(url):
    verzoek = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(verzoek, timeout=60) as antwoord:
        return json.load(antwoord)


def geocodeer(naam, cache):
    if naam in cache:
        return tuple(cache[naam])
    if naam in HANDMATIG:
        cache[naam] = list(HANDMATIG[naam])
        return HANDMATIG[naam]

    zoek = html.unescape(naam)
    for filter_type in ("woonplaats", "gemeente"):
        url = (
            "https://api.pdok.nl/bzk/locatieserver/search/v3_1/free?"
            + urllib.parse.urlencode({"q": zoek, "fq": f"type:{filter_type}", "rows": 1})
        )
        try:
            data = haal_json(url)
            docs = data.get("response", {}).get("docs", [])
            if docs:
                punt = docs[0].get("centroide_ll", "")
                m = re.match(r"POINT\(([-0-9.]+) ([-0-9.]+)\)", punt)
                if m:
                    lng, lat = float(m.group(1)), float(m.group(2))
                    cache[naam] = [lat, lng]
                    print(f"  geocodeerd: {naam} -> {lat:.4f}, {lng:.4f} ({filter_type})")
                    return (lat, lng)
        except Exception as fout:  # noqa: BLE001
            print(f"  geocode-fout voor {naam}: {fout}", file=sys.stderr)
        time.sleep(0.4)
    print(f"  GEEN COORDINATEN voor: {naam}", file=sys.stderr)
    return None


def main():
    data = haal_json(BRON)
    mensen = data.get("people", [])
    print(f"{len(mensen)} gevallen in de bron")

    cache = {}
    if CACHE.exists():
        cache = json.loads(CACHE.read_text())

    # Plaatsen verzamelen en geocoderen
    plaatsen = sorted(
        {
            NAAM_FIX.get(m.get("city", "").strip(), m.get("city", "").strip())
            for m in mensen
            if m.get("city", "").strip() and m.get("city", "").strip() != "Plaats onbekend"
        }
    )
    for naam in plaatsen:
        geocodeer(naam, cache)
    CACHE.write_text(json.dumps(cache, ensure_ascii=False, indent=1), encoding="utf-8")

    # Per plaats de gevallen nummeren voor een kleine spreiding op de kaart,
    # zodat meerdere punten in een stad naast elkaar zichtbaar blijven.
    per_plaats = {}
    entries = []
    for m in mensen:
        stad = NAAM_FIX.get(m.get("city", "").strip(), m.get("city", "").strip())
        if stad == "Plaats onbekend" or stad not in cache:
            continue
        index = per_plaats.get(stad, 0)
        per_plaats[stad] = index + 1
        lat, lng = cache[stad]
        if index > 0:
            hoek = index * 2.39996  # gulden hoek, deterministisch
            straal = min(0.004 + index * 0.0022, 0.03)
            lat += math.sin(hoek) * straal
            lng += math.cos(hoek) * straal

        bron_url = (m.get("article_link") or "").strip() or data["common"]["link"]
        bron_label = "nieuwsbericht" if (m.get("article_link") or "").strip() else "database Controle Alt Delete"

        entry = {
            "id": m.get("case_nr", ""),
            "jaar": str(m.get("year", "")),
            "plaats": stad,
            "lat": round(lat, 4),
            "lng": round(lng, 4),
            "geweld": m.get("police_violence", "Onbekend"),
            "geschoten": m.get("is_shot", "Onbekend"),
            "vervolgd": m.get("officer_persecuted", "Onbekend"),
            "veroordeeld": m.get("officer_convicted", "Onbekend"),
            "status": m.get("investigation_status", ""),
            "bronUrl": bron_url,
            "bronLabel": bron_label,
        }
        entries.append(entry)

    entries.sort(key=lambda e: e["jaar"], reverse=True)

    regels = [
        'import type { CadZaak } from "./openbare-zaken";',
        "",
        f"// Automatisch gegenereerd door scripts/cad-oogst.py op {date.today().isoformat()}.",
        "// Bron: de openbare database van Controle Alt Delete",
        "// (overleden.controlealtdelete.nl). Namen staan er bewust niet in;",
        "// de kaart toont jaar, plaats en feiten en linkt naar de bron.",
        "export const CAD_ZAKEN: CadZaak[] = [",
    ]
    for e in entries:
        regels.append("  {")
        for sleutel in [
            "id",
            "jaar",
            "plaats",
            "lat",
            "lng",
            "geweld",
            "geschoten",
            "vervolgd",
            "veroordeeld",
            "status",
            "bronUrl",
            "bronLabel",
        ]:
            regels.append(f"    {sleutel}: {json.dumps(e[sleutel], ensure_ascii=False)},")
        regels.append("  },")
    regels.append("];")
    UIT.write_text("\n".join(regels) + "\n", encoding="utf-8")

    print(f"klaar: {len(entries)} gevallen met plaats in {UIT.relative_to(WORTEL)}")
    print(f"(zonder plaats overgeslagen: {len(mensen) - len(entries)})")


if __name__ == "__main__":
    main()
