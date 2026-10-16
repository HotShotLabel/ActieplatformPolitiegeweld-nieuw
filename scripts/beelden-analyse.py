#!/usr/bin/env python3
"""Analyseer ondertitels van goedgekeurde beelden op openbare kenmerken.

Haalt YouTube-auto-ondertitels op (geen audio-download), scant op
dienstnummers (ook uitgesproken cijferreeksen), eenheden en plaatsnamen, en
schrijft de suggesties per video weg. Met --import worden de suggesties als
`analyse`-veld in beheer gezet (suggestie, geen publicatie).

Gebruik:
    python3 scripts/beelden-analyse.py --limiet 5      # proef
    python3 scripts/beelden-analyse.py                 # alle goedgekeurde video's
    python3 scripts/beelden-analyse.py --import        # suggesties naar beheer

Herkomst: lessen uit de beelden-analyse van deze sessie (429-gedrag,
leeftijdsgrens, dode video's, VTT-deduplicatie).
"""

import argparse
import json
import os
import random
import re
import subprocess
import sys
import time
import urllib.request

BASIS = os.path.expanduser("~/actieplatform-analyse")
MAP_SUBS = os.path.join(BASIS, "ondertitels")
BESTAND_STAAT = os.path.join(BASIS, "staat.json")
BESTAND_RESULTAAT = os.path.join(BASIS, "resultaten.jsonl")
API = "https://actieplatform-politiegeweld-nieuw.vercel.app"
YTDLP = os.path.expanduser("~/.local/bin/yt-dlp")

STEDEN = [
    "Amsterdam", "Rotterdam", "Den Haag", "Utrecht", "Eindhoven", "Groningen",
    "Tilburg", "Almere", "Breda", "Nijmegen", "Apeldoorn", "Haarlem",
    "Arnhem", "Enschede", "Amersfoort", "Zaanstad", "Den Bosch",
    "'s-Hertogenbosch", "Hoorn", "Leeuwarden", "Maastricht", "Leiden",
    "Dordrecht", "Zoetermeer", "Zwolle", "Deventer", "Delft", "Alkmaar",
    "Venlo", "Hilversum", "Heerlen", "Lelystad", "Gouda", "Hoogeveen",
    "Roosendaal", "Emmen", "Assen", "Middelburg", "Vlissingen", "Kapellebrug",
    "Spijkenisse", "Woerden", "Houten", "Nijverdal", "Coevorden",
    "Winterswijk", "Veenendaal", "Ede", "Barneveld", "Doetinchem",
    "Sittard", "Geleen", "Roermond", "Sneek", "Drachten", "Purmerend",
    "Hoofddorp", "Amstelveen", "Schiedam", "Vlaardingen", "Helmond", "Oss",
    "Bergen op Zoom", "Terneuzen", "Weert", "Rijswijk", "Nieuwegein",
    "Zeist", "Kampen", "Hengelo", "Oldenzaal", "Almelo",
]

CIJFERWOORD = {
    "nul": "0", "een": "1", "één": "1", "twee": "2", "drie": "3",
    "vier": "4", "vijf": "5", "zes": "6", "zeven": "7", "acht": "8",
    "negen": "9",
}
TIENTAL = {
    "twintig": "2", "dertig": "3", "veertig": "4", "vijftig": "5",
    "zestig": "6", "zeventig": "7", "tachtig": "8", "negentig": "9",
}


def laad_staat():
    if os.path.exists(BESTAND_STAAT):
        with open(BESTAND_STAAT, encoding="utf-8") as bestand:
            return json.load(bestand)
    return {"video": {}}


def bewaar_staat(staat):
    os.makedirs(BASIS, exist_ok=True)
    tijdelijk = BESTAND_STAAT + ".tmp"
    with open(tijdelijk, "w", encoding="utf-8") as bestand:
        json.dump(staat, bestand, ensure_ascii=False, indent=1)
    os.replace(tijdelijk, BESTAND_STAAT)


def video_id(url):
    m = re.search(r"(?:v=|youtu\.be/|shorts/)([A-Za-z0-9_-]{6,20})", url)
    return m.group(1) if m else ""


def haal_beelden():
    with urllib.request.urlopen(f"{API}/api/beelden", timeout=30) as antwoord:
        data = json.loads(antwoord.read().decode())
    return data.get("beelden", [])


def zorg_ondertitel(vid):
    """Zorg dat de ondertitels van deze video lokaal staan. Geeft status terug."""
    for naam in (f"{vid}.nl-orig.vtt", f"{vid}.nl.vtt", f"{vid}.en-orig.vtt",
                 f"{vid}.en.vtt"):
        pad = os.path.join(MAP_SUBS, naam)
        if os.path.exists(pad) and os.path.getsize(pad) > 200:
            return "ok", pad

    os.makedirs(MAP_SUBS, exist_ok=True)
    limiet = False
    for poging in (1, 2):
        resultaat = subprocess.run(
            [YTDLP, "--skip-download", "--write-auto-subs",
             "--sub-langs", "nl.*,en.*", "--sub-format", "vtt",
             "-o", "%(id)s", f"https://www.youtube.com/watch?v={vid}"],
            capture_output=True, text=True, timeout=120, cwd=MAP_SUBS,
        )
        fout = (resultaat.stderr or "")
        if "Sign in to confirm your age" in fout or "age-restricted" in fout:
            return "leeftijd", ""
        if "not available" in fout or "Private video" in fout:
            return "dood", ""
        if "429" in fout and poging == 1:
            time.sleep(75)
            continue
        if "429" in fout:
            limiet = True
        break

    # Bestanden checken vóór de limiet-status: de 429 kan pas bij de tweede
    # taal zijn gekomen, terwijl de Nederlandse ondertitels al binnen zijn.
    for naam in (f"{vid}.nl-orig.vtt", f"{vid}.nl.vtt", f"{vid}.en-orig.vtt",
                 f"{vid}.en.vtt"):
        pad = os.path.join(MAP_SUBS, naam)
        if os.path.exists(pad) and os.path.getsize(pad) > 200:
            return "ok", pad
    if limiet:
        return "limiet", ""
    return "geen-ondertitels", ""


def vtt_naar_cues(pad):
    """Lees een VTT naar [(tijd, tekst)] met deduplicatie van herhalingen."""
    cues = []
    tijd = ""
    with open(pad, encoding="utf-8") as bestand:
        for regel in bestand:
            regel = regel.strip()
            if "-->" in regel:
                m = re.match(r"(\d{2}:\d{2}:\d{2})", regel)
                if m:
                    tijd = m.group(1)
                continue
            if not regel or regel.startswith(("WEBVTT", "Kind:", "Language:")):
                continue
            tekst = re.sub(r"<[^>]+>", "", regel).strip()
            if not tekst:
                continue
            if cues and cues[-1][1] == tekst:
                continue
            cues.append((tijd, tekst))
    return cues


def scan(cues):
    """Zoek openbare kenmerken in de cues; geeft treffers met tijd terug."""
    hele = ""
    spans = []
    for tijd, tekst in cues:
        begin = len(hele)
        hele += tekst + " "
        spans.append((begin, len(hele), tijd))

    def tijd_van(pos):
        for begin, eind, tijd in spans:
            if begin <= pos < eind:
                return tijd
        return ""

    treffers = []
    gezien = set()

    def voeg_toe(soort, waarde, pos, context):
        waarde = waarde.strip()
        if not waarde or (soort, waarde) in gezien:
            return
        gezien.add((soort, waarde))
        treffers.append({
            "soort": soort,
            "waarde": waarde,
            "tijd": tijd_van(max(0, pos)),
            "context": context.strip()[:160],
        })

    # dienstnummer (met cijferreeks in de buurt)
    for m in re.finditer(r"dienst\s*nummer|dienstnr|dienstnummer", hele, re.I):
        omgeving = hele[m.start():m.end() + 140]
        cijfers = re.search(r"\b\d{3,6}\b", omgeving)
        if cijfers:
            voeg_toe("dienstnummer", cijfers.group(0), m.start(), omgeving)
    # nummer + cijfers
    for m in re.finditer(r"\bnummer[^0-9]{0,30}(\d{2,6})", hele, re.I):
        voeg_toe("nummer", m.group(1), m.start(),
                 hele[max(0, m.start() - 40):m.end() + 40])
    # uitgesproken cijferreeksen: "vier vijf zes zeven" of "vijfenveertig"
    for m in re.finditer(
        r"\b(?:(?:nul|een|één|twee|drie|vier|vijf|zes|zeven|acht|negen)\s+){3,5}"
        r"(?:nul|een|één|twee|drie|vier|vijf|zes|zeven|acht|negen)\b", hele, re.I):
        woorden = re.findall(r"[a-zé]+", m.group(0).lower())
        cijfer = "".join(CIJFERWOORD.get(w, "") for w in woorden)
        if len(cijfer) >= 4:
            voeg_toe("cijferreeks", cijfer, m.start(), m.group(0))
    for m in re.finditer(
        r"\b(?:een|twee|drie|vier|vijf|zes|zeven|acht|negen)(?:en)?"
        r"(?:twintig|dertig|veertig|vijftig|zestig|zeventig|tachtig|negentig)\b",
        hele, re.I):
        woord = m.group(0).lower()
        for tiental, cijfer in TIENTAL.items():
            if woord.endswith(tiental):
                eenheid = woord.replace("en" + tiental, "").replace(tiental, "")
                cijfer_eenheid = CIJFERWOORD.get(eenheid, "")
                if cijfer_eenheid:
                    voeg_toe("cijferreeks", cijfer + cijfer_eenheid, m.start(),
                             m.group(0))
                break
    # eenheid
    for m in re.finditer(
        r"\beenheid\s+(?:van\s+)?([A-Z][\w'-]+(?:\s+[A-Z][\w'-]+)?)", hele):
        voeg_toe("eenheid", m.group(1), m.start(), m.group(0))
    # plaatsen
    for stad in STEDEN:
        m = re.search(r"\b" + re.escape(stad) + r"\b", hele)
        if m:
            voeg_toe("plaats", stad, m.start(),
                     hele[max(0, m.start() - 50):m.end() + 50])
    return treffers


def lees_token():
    for bron in (os.environ.get("ADMIN_TOKEN"),):
        if bron:
            return bron.strip().strip('"')
    env_pad = os.path.expanduser("~/actieplatform-nieuw/.env.local")
    if os.path.exists(env_pad):
        with open(env_pad, encoding="utf-8") as bestand:
            for regel in bestand:
                if regel.startswith("ADMIN_TOKEN="):
                    return regel.split("=", 1)[1].strip().strip('"')
    return ""


def importeer(beeld_id, analyse, token):
    aanvraag = urllib.request.Request(
        f"{API}/api/beheer/beelden",
        method="PATCH",
        data=json.dumps({"id": beeld_id, "analyse": analyse}).encode(),
        headers={
            "Authorization": f"Bearer {token}",
            "content-type": "application/json",
        },
    )
    with urllib.request.urlopen(aanvraag, timeout=30) as antwoord:
        return antwoord.status == 200


def importeer_bestand():
    """Lees resultaten.jsonl (laatste regel per video) en importeer de
    suggesties. Alleen niet-lege treffers worden geschreven."""
    if not os.path.exists(BESTAND_RESULTAAT):
        print("geen resultatenbestand")
        return
    laatste = {}
    with open(BESTAND_RESULTAAT, encoding="utf-8") as bestand:
        for regel in bestand:
            try:
                data = json.loads(regel)
            except json.JSONDecodeError:
                continue
            laatste[data.get("video", "")] = data
    token = lees_token()
    if not token:
        print("geen beheertoken gevonden")
        return
    geimporteerd = 0
    for video, data in laatste.items():
        treffers = data.get("treffers") or []
        if not treffers or not data.get("id"):
            continue
        samenvatting = " · ".join(
            f"{t['soort']} {t['waarde']}"
            + (f" ({t['tijd'][:5]})" if t.get("tijd") else "")
            for t in treffers[:6]
        )
        try:
            if importeer(data["id"], samenvatting[:600], token):
                geimporteerd += 1
                print(f"  {video}: {samenvatting[:100]}")
        except Exception as fout:  # noqa: BLE001
            print(f"  {video}: import mislukt ({fout})")
    print(f"klaar; {geimporteerd} suggesties geimporteerd")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--limiet", type=int, default=0,
                        help="maximaal aantal video's deze ronde (0 = alles)")
    parser.add_argument("--import", dest="importeren", action="store_true",
                        help="suggesties als analyse-veld naar beheer sturen")
    parser.add_argument("--alleen-import", dest="alleen_import",
                        action="store_true",
                        help="niet scannen; alleen resultatenbestand importeren")
    args = parser.parse_args()

    if args.alleen_import:
        return importeer_bestand()

    os.makedirs(MAP_SUBS, exist_ok=True)
    staat = laad_staat()
    beelden = haal_beelden()
    youtube = [b for b in beelden if "youtu" in (b.get("url") or "")]
    random.shuffle(youtube)
    print(f"goedgekeurde youtube-video's: {len(youtube)}")

    gedaan = 0
    for beeld in youtube:
        vid = video_id(beeld["url"])
        if not vid:
            continue

        bekend = staat["video"].get(vid, {})
        if bekend.get("status") == "ok" and os.path.exists(bekend.get("bestand", "")):
            status, pad = "ok", bekend["bestand"]
        else:
            if args.limiet and gedaan >= args.limiet:
                break
            status, pad = zorg_ondertitel(vid)
            staat["video"][vid] = {"status": status, "bestand": pad}
            bewaar_staat(staat)
            gedaan += 1
            print(f"  [{gedaan}] {vid}: {status}")
            if status != "ok":
                time.sleep(random.uniform(2.0, 4.0))
                continue
            time.sleep(random.uniform(3.0, 6.0))

        if status != "ok" or not pad:
            continue
        treffers = scan(vtt_naar_cues(pad))
        regel = {
            "id": beeld.get("id", ""),
            "video": vid,
            "titel": beeld.get("titel", ""),
            "url": beeld.get("url", ""),
            "treffers": treffers,
        }
        with open(BESTAND_RESULTAAT, "a", encoding="utf-8") as bestand:
            bestand.write(json.dumps(regel, ensure_ascii=False) + "\n")
        if treffers:
            samenvatting = " · ".join(
                f"{t['soort']} {t['waarde']}"
                + (f" ({t['tijd'][:5]})" if t["tijd"] else "")
                for t in treffers[:6]
            )
            print(f"    {vid}: {samenvatting}")
            if args.importeren and beeld.get("id"):
                token = lees_token()
                if token:
                    try:
                        importeer(beeld["id"], samenvatting[:600], token)
                    except Exception as fout:  # noqa: BLE001
                        print(f"    import mislukt: {fout}")
                else:
                    print("    geen beheertoken gevonden; import overgeslagen")
        else:
            print(f"    {vid}: geen treffers")
            if args.importeren and beeld.get("id"):
                token = lees_token()
                if token:
                    try:
                        importeer(beeld["id"], "", token)
                    except Exception:  # noqa: BLE001
                        pass

    print(f"klaar; {gedaan} video's verwerkt deze ronde")
    print(f"resultaten: {BESTAND_RESULTAAT}")


if __name__ == "__main__":
    main()
