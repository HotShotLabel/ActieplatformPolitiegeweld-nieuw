#!/usr/bin/env python3
"""Oogst YouTube-video's over politiegeweld in Nederland met yt-dlp (geen
API-sleutel nodig) en zet ze als verborgen tips in het beheer van de site.

Gebruik:
  python3 scripts/beelden-oogst.py --proef   # alleen tonen, niets versturen
  python3 scripts/beelden-oogst.py           # echte run; ADMIN_TOKEN nodig

ADMIN_TOKEN staat in .env.local (en in Vercel). De gevonden video's komen
verborgen binnen in /beheer en worden daar met de hand zichtbaar gezet.
"""

import json
import os
import subprocess
import sys
import urllib.request
from pathlib import Path

SITE = os.environ.get(
    "BEELDEN_SITE", "https://actieplatform-politiegeweld-nieuw.vercel.app"
)
AANTAL_PER_TERM = 12
ZOEKTERMEN = [
    # Basis: geweld, aanhouding, schietincident, demonstratie
    "politie geweld nederland",
    "politie mishandeling aanhouding",
    "politie geweld arrestant",
    "politie achtervolging ongeluk nederland",
    "politie schietincident nederland",
    "politie geweld demonstratie nederland",
    "politie buitensporig geweld",
    "politie geweld gefilmd",
    # Fysiek geweld in gewone taal
    "politie mishandelt",
    "politie slaat man",
    "politie slaat vrouw",
    "politie schopt",
    "politie trapt",
    "agent slaat",
    "agent schiet",
    "politie nekklem",
    "politie taser",
    "politie wapenstok",
    "politie pepperspray",
    # Profilering, intimidatie, vernedering
    "etnisch profileren politie",
    "politie racisme",
    "politie intimideert",
    "politie pest",
    "politie vernedert",
    "politie bedreigt",
    # Verkeer en gevaar
    "politieauto aanrijding",
    "politieauto schept",
    "politie rijdt fietser aan",
    "politieauto overrijdt",
    "politiebus ongeluk",
    "politie rijdt in op menigte",
    # Hashtags en jaartallen (voor recente shorts)
    "#politiegeweld",
    "#politiegeweldnederland",
    "#etnischprofileren",
    "#politiegeweldinnederland",
    "#agentgeweld",
    "politie geweld 2025",
    "politie geweld 2026",
    # Extra invalshoeken: intimidatie, klachten, journalistiek, kwetsbare groepen
    "politie pakt hard aan",
    "politie intimideert",
    "politie vernedert",
    "politie schoffeert",
    "politie fouilleert",
    "politie houdt aan zonder reden",
    "stopformulier politie",
    "klacht politie geweld",
    "aangifte politie mishandeling",
    "ME geweld",
    "politiehond bijt",
    "politie geweld journalist",
    "persvrijheid politie",
    "politie geweld kind",
    "politie geweld vrouw",
    "politie geweld dakloze",
    "politie geweld psychisch",
    "politie geweld minderjarige",
    "politie geweld asielzoeker",
    "politie geweld student",
    "politie geweld buurt",
    "politie geweld wijkagent",
    "#controlealtdelete",
    "#stopformulier",
    "#politieintimidatie",
    "#MEgeweld",
    # Stille lokale zaken: per stad/regio zoeken
    "politie geweld Amsterdam",
    "politie geweld Rotterdam",
    "politie geweld Utrecht",
    "politie geweld Den Haag",
    "politie geweld Eindhoven",
    "politie geweld Groningen",
    "politie geweld Tilburg",
    "politie geweld Breda",
    "politie geweld Arnhem",
    "politie geweld Nijmegen",
    "politie geweld Zwolle",
    "politie geweld Leeuwarden",
    "politie geweld Maastricht",
    "politie geweld Dordrecht",
    "politie geweld Leiden",
    "politie geweld Almere",
]
TREFWOORDEN = ["politie", "agent", "arrestatie", "aanhouding", "geweld"]


def lees_token() -> str:
    env_bestand = Path(__file__).resolve().parent.parent / ".env.local"
    if env_bestand.exists():
        for regel in env_bestand.read_text(encoding="utf-8").splitlines():
            if regel.startswith("ADMIN_TOKEN="):
                return regel.split("=", 1)[1].strip().strip('"').strip("'")
    return os.environ.get("ADMIN_TOKEN", "")


def zoek(term: str) -> list[dict]:
    try:
        uit = subprocess.run(
            [
                "yt-dlp",
                f"ytsearch{AANTAL_PER_TERM}:{term}",
                "--flat-playlist",
                "--dump-single-json",
                "--no-warnings",
                "--quiet",
            ],
            capture_output=True,
            text=True,
            timeout=180,
        )
        data = json.loads(uit.stdout or "{}")
    except Exception as fout:  # noqa: BLE001
        print(f"  ! mislukt voor '{term}': {fout}")
        return []

    kandidaten: list[dict] = []
    for item in data.get("entries") or []:
        titel = (item.get("title") or "").strip()
        video_id = item.get("id") or ""
        kanaal = item.get("channel") or item.get("uploader") or ""
        if not titel or not video_id:
            continue
        laag = titel.lower()
        if not any(woord in laag for woord in TREFWOORDEN):
            continue
        kandidaten.append(
            {
                "url": f"https://www.youtube.com/watch?v={video_id}",
                "titel": titel[:150],
                "toelichting": (f"Kanaal: {kanaal}"[:200] if kanaal else ""),
                "plaats": "",
                "datum": "",
                "bron": "YouTube-oogst",
            }
        )
    return kandidaten


def main() -> None:
    proef = "--proef" in sys.argv
    alles: dict[str, dict] = {}
    for term in ZOEKTERMEN:
        print(f"Zoeken: {term}")
        for item in zoek(term):
            alles[item["url"]] = item
    items = list(alles.values())
    print(f"Gevonden (uniek): {len(items)}")

    if proef:
        for item in items[:25]:
            print(" -", item["titel"], "|", item["url"])
        return

    beheer_token = lees_token()
    if not beheer_token:
        print("Geen ADMIN_TOKEN gevonden (.env.local of omgeving). Stop.")
        sys.exit(1)

    verzoek = urllib.request.Request(
        f"{SITE}/api/beheer/beelden",
        data=json.dumps({"items": items}).encode(),
        method="POST",
        headers={
            "content-type": "application/json",
            "Authorization": f"Bearer {beheer_token}",
        },
    )
    with urllib.request.urlopen(verzoek, timeout=120) as antwoord:
        print("Import:", antwoord.read().decode())


if __name__ == "__main__":
    main()
