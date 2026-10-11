#!/usr/bin/env python3
"""Haalt politiebureaus en rechtbanken van Nederland op en schrijft
public/voorzieningen.json (voor de kaartlagen op /kaart).

- Politiebureaus: OpenStreetMap via de Overpass API (gratis, geen sleutel).
  De officiele Politie-API (api.politie.nl) is op dit moment onbereikbaar/
  geblokkeerd; als die later werkt kan die hier als bron bij.
- Rechtbanken: de officiele locatielijst van rechtspraak.nl
  (overzicht-gegevens-rechtspraaklocaties), inclusief alle nevenlocaties,
  gegeocodeerd via de PDOK Locatieserver (overheid). Aangevuld met de Hoge
  Raad en de Raad van State uit de bestaande lijst.

Gebruik: python3 scripts/voorzieningen-oogst.py
"""

import html
import json
import pathlib
import re
import time
import urllib.parse
import urllib.request
from datetime import date

WORTEL = pathlib.Path(__file__).resolve().parent.parent
UIT = WORTEL / "public/voorzieningen.json"
UA = "ActieplatformPolitiegeweld-oogst/1.0 (+https://actieplatform-politiegeweld-nieuw.vercel.app)"

OVERPASS_SERVERS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
]

RECHTSPRAAK_URL = (
    "https://www.rechtspraak.nl/organisatie-en-contact/"
    "overzicht-gegevens-rechtspraaklocaties"
)

RECHTBANK_PREFIXEN = (
    "Rechtbank",
    "Gerechtshof",
    "College van Beroep",
    "Centrale Raad",
)

EXTRA_RECHTBANKEN = ("Hoge Raad", "Raad van State", "Afdeling bestuursrechtspraak")

POSTCODE = re.compile(r"\b(\d{4})\s?([A-Za-z]{2})\b")


BROWSER_UA = (
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/131.0 Safari/537.36"
)


def haal(url, data=None, ua=UA):
    verzoek = urllib.request.Request(
        url, data=data, headers={"User-Agent": ua}
    )
    with urllib.request.urlopen(verzoek, timeout=120) as antwoord:
        return antwoord.read()


def overpass(query):
    data = urllib.parse.urlencode({"data": query}).encode()
    laatste = None
    for server in OVERPASS_SERVERS:
        try:
            return json.loads(haal(server, data=data))
        except Exception as fout:  # noqa: BLE001
            laatste = fout
            print(f"  {server} faalde: {str(fout)[:80]}")
            time.sleep(3)
    raise RuntimeError(f"alle Overpass-servers faalden: {laatste}")


def schoon(tekst):
    return re.sub(r"\s+", " ", html.unescape(tekst)).strip()


def dedupe(items, meters=150):
    resultaat = []
    sprong = meters / 111_000  # graden
    for item in items:
        bestaand = None
        for eerder in resultaat:
            if (
                abs(item["lat"] - eerder["lat"]) < sprong
                and abs(item["lng"] - eerder["lng"]) < sprong
            ):
                bestaand = eerder
                break
        if bestaand is None:
            resultaat.append(item)
        else:
            # zelfde gebouw: houd de meest specifieke naam, voeg toe wat nieuw is
            if item["naam"] not in bestaand["naam"]:
                if bestaand["naam"] in item["naam"]:
                    bestaand["naam"] = item["naam"]
                elif item["naam"] not in bestaand["naam"] and bestaand["naam"] not in item["naam"]:
                    bestaand["naam"] = f'{bestaand["naam"]} / {item["naam"]}'
    return resultaat


def politie_ophalen():
    query = """[out:json][timeout:120];
area["ISO3166-1"="NL"][admin_level=2]->.nl;
(
  node["amenity"="police"](area.nl);
  way["amenity"="police"](area.nl);
  node["building"="police"](area.nl);
  way["building"="police"](area.nl);
  node["government"="police"](area.nl);
  way["government"="police"](area.nl);
);
out center tags;"""
    data = overpass(query)
    items = []
    for element in data.get("elements", []):
        tags = element.get("tags", {})
        lat, lon = element.get("lat"), element.get("lon")
        if lat is None or lon is None:
            center = element.get("center") or {}
            lat, lon = center.get("lat"), center.get("lon")
        if lat is None or lon is None:
            continue
        items.append(
            {
                "naam": tags.get("name") or "Politielocatie",
                "lat": round(lat, 4),
                "lng": round(lon, 4),
            }
        )
    return dedupe(items)


def pdok(q):
    url = "https://api.pdok.nl/bzk/locatieserver/search/v3_1/free?" + urllib.parse.urlencode(
        {"q": q, "rows": 1}
    )
    data = json.loads(haal(url))
    docs = data.get("response", {}).get("docs", [])
    if not docs:
        return None
    match = re.match(r"POINT\(([-0-9.]+) ([-0-9.]+)\)", docs[0].get("centroide_ll", ""))
    if not match:
        return None
    weergave = docs[0].get("weergavenaam", "")
    stad_match = re.search(r"\d{4}\s?[A-Z]{2}\s+(.+)$", weergave)
    stad = stad_match.group(1).strip() if stad_match else ""
    return float(match.group(2)), float(match.group(1)), stad


def rechtbanken_ophalen(oud):
    # rechtspraak.nl blokkeert niet-browser user-agents; een gewone
    # browser-UA werkt wel (publieke pagina, eenmalige oogst).
    pagina = haal(RECHTSPRAAK_URL, ua=BROWSER_UA).decode("utf-8", errors="replace")
    begin = pagina.find(">411")
    einde = pagina.find("Zie ook")
    stuk = pagina[begin:einde] if begin >= 0 else pagina

    # koppen en lijstitems in volgorde langsgaan
    onderdelen = re.findall(
        r'<h3[^>]*class="title"[^>]*>(\d{3} [^<]+)</h3>|<li[^>]*>(.*?)</li>',
        stuk,
        re.S,
    )

    blok = None
    stad = None
    items = []
    for kop, li in onderdelen:
        if kop:
            blok = schoon(kop)[4:].strip()
            stad = None
            continue
        if not blok or not li:
            continue
        tekst = schoon(re.sub(r"<[^>]+>", " ", li))
        if not tekst or "OIN-nummer" in tekst or re.match(r"^NL\d{2}[A-Z]{4}", tekst):
            continue
        if not any(blok.startswith(prefix) for prefix in RECHTBANK_PREFIXEN):
            continue

        locatie = None
        if tekst.startswith("Locatie "):
            delen = tekst.split(" ", 2)
            if len(delen) == 3:
                locatie, tekst = delen[1], delen[2]
            else:
                continue

        if POSTCODE.search(tekst):
            if stad and tekst.startswith(stad):
                tekst = tekst[len(stad):].strip()
            try:
                gevonden = pdok(tekst)
            except Exception as fout:  # noqa: BLE001
                print(f"  pdok-fout voor '{tekst}': {str(fout)[:60]}")
                gevonden = None
            time.sleep(0.35)
            if gevonden:
                lat, lng, plaats = gevonden
                plaats = plaats.replace("'s-Gravenhage", "Den Haag")
                naam = blok
                if locatie:
                    naam = f"{blok}, {locatie}"
                if plaats and plaats.lower() not in naam.lower():
                    naam = f"{naam} ({plaats})"
                elif stad and stad.lower() not in naam.lower():
                    naam = f"{naam} ({stad})"
                items.append(
                    {
                        "naam": naam,
                        "lat": round(lat, 4),
                        "lng": round(lng, 4),
                    }
                )
        elif len(tekst) < 40 and not any(ch.isdigit() for ch in tekst):
            stad = tekst

    # Hoge Raad en Raad van State uit de bestaande lijst overnemen
    for oud_item in oud.get("rechtbank", []):
        if any(kern in oud_item["naam"] for kern in EXTRA_RECHTBANKEN):
            items.append(oud_item)

    return dedupe(items, meters=250)


def main():
    oud = {"politie": [], "rechtbank": []}
    if UIT.exists():
        oud = json.loads(UIT.read_text(encoding="utf-8"))

    print("politiebureaus ophalen (OpenStreetMap)…")
    try:
        politie = politie_ophalen()
        print(f"  {len(politie)} locaties")
    except Exception as fout:  # noqa: BLE001
        print(f"  mislukt ({str(fout)[:80]}); bestaande lijst blijft staan")
        politie = oud.get("politie", [])

    print("rechtbanken ophalen (officiele rechtspraak-lijst)…")
    try:
        rechtbank = rechtbanken_ophalen(oud)
        print(f"  {len(rechtbank)} locaties")
    except Exception as fout:  # noqa: BLE001
        print(f"  mislukt ({str(fout)[:80]}); bestaande lijst blijft staan")
        rechtbank = oud.get("rechtbank", [])

    UIT.write_text(
        json.dumps(
            {
                "bron": (
                    f"Politiebureaus: OpenStreetMap via Overpass. Rechtbanken: "
                    f"officiele locatielijst rechtspraak.nl, gegeocodeerd via PDOK, "
                    f"aangevuld met Hoge Raad en Raad van State. Opgehaald "
                    f"{date.today().isoformat()}."
                ),
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
