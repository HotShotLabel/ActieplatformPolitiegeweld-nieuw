#!/usr/bin/env python3
"""Instagram-oogst: haalt recente VIDEO-posts op van publieke Instagram-
profielen (via instaloader, zonder login) en zet ze als verborgen tips in het
beheer. Werkt per account; zoeken op hashtags kan niet meer (Instagram
blokkeert dat anoniem sinds 2024).

Gebruik:
  ~/ai_firefox_agent/venv/bin/python scripts/instagram-oogst.py --proef
  ~/ai_firefox_agent/venv/bin/python scripts/instagram-oogst.py

Accounts: scripts/instagram-accounts.txt (één per regel, # = commentaar).
Let op: Instagram geeft vaak 429 (te veel verzoeken); probeer het dan later
opnieuw. Draai nooit meerdere keren kort na elkaar.
"""

import json
import os
import sys
import urllib.request
from itertools import islice
from pathlib import Path

SITE = os.environ.get(
    "BEELDEN_SITE", "https://actieplatform-politiegeweld-nieuw.vercel.app"
)
MAX_PER_ACCOUNT = 8
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


def accounts() -> list[str]:
    bestand = Path(__file__).resolve().parent / "instagram-accounts.txt"
    if bestand.exists():
        return [
            regel.strip().lstrip("@")
            for regel in bestand.read_text(encoding="utf-8").splitlines()
            if regel.strip() and not regel.startswith("#")
        ]
    return []


def main() -> None:
    proef = "--proef" in sys.argv
    namen = accounts()
    if not namen:
        print("Geen accounts in scripts/instagram-accounts.txt.")
        return

    import instaloader

    L = instaloader.Instaloader(quiet=True)
    items = []
    for naam in namen:
        try:
            profiel = instaloader.Profile.from_username(L.context, naam)
            for post in islice(profiel.get_posts(), 24):
                if not post.is_video:
                    continue
                caption = (post.caption or "").replace("\n", " ").strip()
                laag = caption.lower()
                if not any(woord in laag for woord in TREFWOORDEN):
                    continue
                items.append(
                    {
                        "url": f"https://www.instagram.com/p/{post.shortcode}/",
                        "titel": (caption[:150] or f"Video van @{naam}"),
                        "toelichting": f"Instagram-profiel @{naam}",
                        "plaats": "",
                        "datum": post.date_utc.strftime("%Y-%m-%d"),
                        "bron": f"Instagram-oogst (@{naam})",
                    }
                )
                if len(items) >= MAX_PER_ACCOUNT * len(namen):
                    break
            print(f"  @{naam}: klaar")
        except Exception as fout:  # noqa: BLE001
            print(f"  ! @{naam}: {str(fout)[:90]}")

    print("video-treffers:", len(items))
    if proef:
        for item in items[:10]:
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
