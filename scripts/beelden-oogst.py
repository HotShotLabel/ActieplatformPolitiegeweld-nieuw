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
    "politie geweld nederland",
    "politie mishandeling aanhouding",
    "politie geweld arrestant",
    "politie achtervolging ongeluk nederland",
    "politie schietincident nederland",
    "politie geweld demonstratie nederland",
    "politie buitensporig geweld",
    "politie geweld gefilmd",
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
