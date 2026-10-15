#!/usr/bin/env python3
"""Zeeschuimer-import: leest een Zeeschuimer-export (UvA Digital Methods,
Firefox-extensie) en zet TikTok- en Instagram-posts uit dat bestand als
verborgen tips in het beheer, gefilterd op politie/geweld-trefwoorden.

Zo werkt het: jij bladert met de Zeeschuimer-extensie door TikTok/Instagram
(zoektermen, hashtags, profielen), exporteert het bestand, en dit script zet
de relevante posts in de wachtrij van /beheer -> Beelden.

Gebruik:
  python3 scripts/zeeschuimer-import.py export.jsonl --proef
  python3 scripts/zeeschuimer-import.py export.jsonl
"""

import json
import os
import sys
import urllib.request
from pathlib import Path

SITE = os.environ.get(
    "BEELDEN_SITE", "https://actieplatform-politiegeweld-nieuw.vercel.app"
)
TREFWOORDEN = [
    "politie", "agent", "geweld", "mishandel", "schiet", "arrestat", "aanhouding",
    "overleden", "taser", "nekklem", "profiler", "discrimin", "racisme", "demonstratie",
]


def lees_token() -> str:
    env_bestand = Path(__file__).resolve().parent.parent / ".env.local"
    if env_bestand.exists():
        for regel in env_bestand.read_text(encoding="utf-8").splitlines():
            if regel.startswith("ADMIN_TOKEN="):
                return regel.split("=", 1)[1].strip().strip('"').strip("'")
    return os.environ.get("ADMIN_TOKEN", "")


def doorzoek(waarde, sleutels: list[str]):
    """Zoek recursief de eerste waarde bij een van de sleutels."""
    if isinstance(waarde, dict):
        for sleutel in sleutels:
            if sleutel in waarde and waarde[sleutel]:
                return waarde[sleutel]
        for sub in waarde.values():
            gevonden = doorzoek(sub, sleutels)
            if gevonden:
                return gevonden
    elif isinstance(waarde, list):
        for sub in waarde:
            gevonden = doorzoek(sub, sleutels)
            if gevonden:
                return gevonden
    return None


def maak_item(item: dict) -> dict | None:
    platform = str(item.get("source_platform", "")).lower()
    data = item.get("data", item)
    caption = doorzoek(data, ["desc", "caption", "text", "title"]) or ""
    if isinstance(caption, dict):
        caption = caption.get("text", "")
    caption = str(caption)[:150].replace("\n", " ")

    url = ""
    if "tiktok" in platform:
        video_id = doorzoek(data, ["id", "aweme_id"])
        gebruiker = doorzoek(data, ["uniqueId", "unique_id", "author"])
        if isinstance(gebruiker, dict):
            gebruiker = gebruiker.get("uniqueId") or gebruiker.get("unique_id")
        if video_id and gebruiker:
            url = f"https://www.tiktok.com/@{gebruiker}/video/{video_id}"
    elif "instagram" in platform:
        code = doorzoek(data, ["code", "shortcode"])
        if code:
            url = f"https://www.instagram.com/p/{code}/"
    elif "twitter" in platform or "x.com" in platform:
        tweet_id = doorzoek(data, ["id_str", "id"])
        schermnaam = doorzoek(data, ["screen_name", "username"])
        if tweet_id and schermnaam:
            url = f"https://x.com/{schermnaam}/status/{tweet_id}"
    if not url:
        return None

    laag = caption.lower()
    if not any(woord in laag for woord in TREFWOORDEN):
        return None

    return {
        "url": url,
        "titel": caption or f"Post via Zeeschuimer ({platform})",
        "toelichting": "Opgevangen met Zeeschuimer tijdens browsen.",
        "plaats": "",
        "datum": "",
        "bron": "Zeeschuimer",
    }


def main() -> None:
    if len(sys.argv) < 2:
        print("Gebruik: zeeschuimer-import.py <export.jsonl> [--proef]")
        return
    bestand = Path(sys.argv[1])
    if not bestand.exists():
        print("Bestand niet gevonden:", bestand)
        return
    proef = "--proef" in sys.argv

    items = []
    inhoud = bestand.read_text(encoding="utf-8", errors="replace").strip()
    if inhoud.startswith("["):
        ruw = json.loads(inhoud)
    else:
        ruw = [json.loads(regel) for regel in inhoud.splitlines() if regel.strip()]

    gezien = set()
    for record in ruw:
        try:
            item = maak_item(record if isinstance(record, dict) else {})
        except Exception:  # noqa: BLE001
            continue
        if item and item["url"] not in gezien:
            gezien.add(item["url"])
            items.append(item)

    print(f"{len(ruw)} records gelezen, {len(items)} relevante posts gevonden")
    if proef:
        for item in items[:15]:
            print(" -", item["titel"][:70], "|", item["url"])
        return
    if not items:
        print("Niets te importeren.")
        return

    token = lees_token()
    if not token:
        print("Geen ADMIN_TOKEN gevonden. Stop.")
        sys.exit(1)
    for i in range(0, len(items), 80):
        verzoek = urllib.request.Request(
            f"{SITE}/api/beheer/beelden",
            data=json.dumps({"items": items[i : i + 80]}).encode(),
            method="POST",
            headers={
                "content-type": "application/json",
                "Authorization": f"Bearer {token}",
            },
        )
        with urllib.request.urlopen(verzoek, timeout=120) as antwoord:
            print("Import:", antwoord.read().decode())


if __name__ == "__main__":
    main()
