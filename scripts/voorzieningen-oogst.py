#!/usr/bin/env python3
"""Haalt alle politiebureaus en rechtbanken van Nederland uit OpenStreetMap
(via de Overpass API, gratis, geen sleutel) en schrijft public/voorzieningen.json.

De kaart toont deze locaties als aparte lagen (aan/uit te zetten).

Gebruik: python3 scripts/voorzieningen-oogst.py
"""

import json
import pathlib
import time
import urllib.parse
import urllib.request
from datetime import date

WORTEL = pathlib.Path(__file__).resolve().parent.parent
UIT = WORTEL / "public/voorzieningen.json"
UA = "ActieplatformPolitiegeweld-oogst/1.0 (+https://actieplatform-politiegeweld-nieuw.vercel.app)"

SERVERS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
]

QUERY = """[out:json][timeout:90];
area["ISO3166-1"="NL"][admin_level=2]->.nl;
(
  node["amenity"="%s"](area.nl);
  way["amenity"="%s"](area.nl);
);
out center tags;"""


def overpass(soort):
    data = urllib.parse.urlencode({"data": QUERY % (soort, soort)}).encode()
    laatste_fout = None
    for server in SERVERS:
        try:
            verzoek = urllib.request.Request(server, data=data, headers={"User-Agent": UA})
            with urllib.request.urlopen(verzoek, timeout=120) as antwoord:
                return json.load(antwoord)
        except Exception as fout:  # noqa: BLE001
            laatste_fout = fout
            print(f"  {server} faalde: {fout}", flush=True)
            time.sleep(3)
    raise RuntimeError(f"alle Overpass-servers faalden: {laatste_fout}")


def verwerk(data, standaardnaam):
    items = []
    gezien = set()
    for element in data.get("elements", []):
        tags = element.get("tags", {})
        lat = element.get("lat")
        lon = element.get("lon")
        if lat is None or lon is None:
            center = element.get("center") or {}
            lat = center.get("lat")
            lon = center.get("lon")
        if lat is None or lon is None:
            continue
        naam = tags.get("name") or standaardnaam
        # dedupliceren op ongeveer 100 meter en op naam
        sleutel = (round(lat, 3), round(lon, 3))
        if sleutel in gezien:
            continue
        gezien.add(sleutel)
        items.append({"naam": naam, "lat": round(lat, 4), "lng": round(lon, 4)})
    items.sort(key=lambda item: item["naam"])
    return items


def main():
    print("politiebureaus ophalen…")
    politie = verwerk(overpass("police"), "Politielocatie")
    print(f"  {len(politie)} locaties")
    time.sleep(4)
    print("rechtbanken ophalen…")
    rechtbank = verwerk(overpass("courthouse"), "Rechtbank")
    print(f"  {len(rechtbank)} locaties")

    UIT.write_text(
        json.dumps(
            {
                "bron": f"OpenStreetMap via Overpass API, opgehaald {date.today().isoformat()}",
                "politie": politie,
                "rechtbank": rechtbank,
            },
            ensure_ascii=False,
            indent=1,
        )
        + "\n",
        encoding="utf-8",
    )
    print(f"klaar: {UIT.relative_to(WORTEL)}")


if __name__ == "__main__":
    main()
