#!/usr/bin/env python3
"""Verrijkt nieuws-geoogst.ts: haalt van elk bericht zonder plaats de
artikeltekst op en zoekt daarin de plaatsnaam (niet alleen in de titel).
Zo komen veel meer nieuwsberichten op de kaart.

Gebruik: python3 scripts/nieuws-plaats-verrijken.py
"""

import json
import pathlib
import re
import time
import urllib.error
import urllib.request
from html import unescape

WORTEL = pathlib.Path(__file__).resolve().parent.parent
GEOOGST = WORTEL / "src/lib/nieuws-geoogst.ts"
PLAATSEN = WORTEL / "src/lib/nl-plaatsen.ts"
UA = "Mozilla/5.0 (X11; Linux x86_64) ActieplatformPolitiegeweld-verrijking"

KOP_TEKST = 600  # binnen deze tekens telt elke naam; later alleen bij 2+ keer

# Namen die op de kaart bijna altijd verkeerd vallen (dorp heet zo, maar de
# tekst bedoelt het land of iets anders).
BLOKLIJST = {"Nederland", "Een"}


def laad_plaatsen():
    tekst = PLAATSEN.read_text()
    paren = re.findall(r'"([^"]+)":\s*\[([\d.]+),\s*([\d.]+)\]', tekst)
    tabel = {naam: (float(lat), float(lng)) for naam, lat, lng in paren}
    namen = sorted(tabel, key=len, reverse=True)
    return tabel, namen


def strip_html(ruw: str) -> str:
    ruw = re.sub(
        r"(?is)<(script|style|noscript|svg|head)[^>]*>.*?</\1>", " ", ruw
    )
    tekst = re.sub(r"(?s)<[^>]+>", " ", ruw)
    return re.sub(r"\s+", " ", unescape(tekst))


def vind_plaats(tekst, tabel, namen):
    kop = tekst[:KOP_TEKST]
    for naam in namen:
        if naam in BLOKLIJST:
            continue
        if len(naam) >= 8:
            if naam in kop:
                return naam, tabel[naam]
        else:
            patroon = re.compile(r"(^|\W)" + re.escape(naam) + r"(\W|$)")
            if patroon.search(kop):
                return naam, tabel[naam]
    # Niets in de opening? Dan alleen als de naam duidelijk vaak voorkomt.
    for naam in namen:
        if naam in BLOKLIJST:
            continue
        if len(naam) >= 5 and tekst.count(naam) >= 2:
            return naam, tabel[naam]
    return None, None


def parse_berichten(tekst: str):
    """Lees de objecten uit de TS-array (we schrijven het bestand opnieuw)."""
    berichten = []
    for blok in re.findall(r"\{\s*titel:.*?\n  \},", tekst, flags=re.S):
        item = {}
        for sleutel, waarde in re.findall(r'(\w+): "((?:[^"\\]|\\.)*)"', blok):
            item[sleutel] = json.loads(f'"{waarde}"')
        for sleutel, waarde in re.findall(
            r"(\w+): (-?\d+(?:\.\d+)?)(?:,|\n)", blok
        ):
            if sleutel in ("lat", "lng") and sleutel not in item:
                item[sleutel] = float(waarde)
        if "titel" in item and "url" in item:
            berichten.append(item)
    return berichten


def schrijf_berichten(berichten, kop: str):
    regels = [kop.rstrip(), ""]
    regels.append("export const NIEUWS_GEOOGST: NieuwsBericht[] = [")
    for item in berichten:
        regels.append("  {")
        for sleutel in ("titel", "bron", "url", "datum", "soort", "auteur"):
            if sleutel in item:
                regels.append(f"    {sleutel}: {json.dumps(item[sleutel], ensure_ascii=False)},")
        if "plaats" in item:
            regels.append(f"    plaats: {json.dumps(item['plaats'], ensure_ascii=False)},")
            regels.append(f"    lat: {item['lat']},")
            regels.append(f"    lng: {item['lng']},")
        regels.append("  },")
    regels.append("];")
    regels.append("")
    GEOOGST.write_text("\n".join(regels))


def haal_artikel(url: str) -> str:
    verzoek = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(verzoek, timeout=20) as antwoord:
        ruw = antwoord.read(400_000).decode("utf-8", errors="ignore")
    return strip_html(ruw)


def main():
    origineel = GEOOGST.read_text()
    kop = origineel.split("export const")[0]
    tabel, namen = laad_plaatsen()
    berichten = parse_berichten(origineel)
    zonder = [b for b in berichten if "lat" not in b]
    print(f"berichten: {len(berichten)} | zonder plaats: {len(zonder)}")

    gelukt = 0
    for nummer, bericht in enumerate(zonder, 1):
        try:
            tekst = haal_artikel(bericht["url"])
        except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError):
            continue
        except Exception:
            continue
        naam, coord = vind_plaats(tekst, tabel, namen)
        if naam and coord:
            bericht["plaats"] = naam
            bericht["lat"] = round(coord[0], 4)
            bericht["lng"] = round(coord[1], 4)
            gelukt += 1
            print(f"  {nummer}/{len(zonder)}: {naam} ← {bericht['titel'][:60]}")
        if nummer % 15 == 0:
            time.sleep(1)
    print(f"plaats gevonden voor {gelukt} extra berichten")
    schrijf_berichten(berichten, kop)
    totaal_met = sum(1 for b in berichten if "lat" in b)
    print(f"totaal met plaats nu: {totaal_met} van {len(berichten)}")


if __name__ == "__main__":
    main()
