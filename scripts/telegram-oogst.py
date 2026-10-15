#!/usr/bin/env python3
"""Telegram-oogst: haalt recente berichten op uit PUBLIEKE Telegram-kanalen via
de web-preview (t.me/s/<kanaal>), filtert op politie/geweld-trefwoorden en zet
treffers als verborgen tips in het beheer van de site. Geen login, geen api_id.

Gebruik:
  python3 scripts/telegram-oogst.py --proef --kanalen nederlandnieuws
  python3 scripts/telegram-oogst.py --kanalen kanaal1,kanaal2

Kanalen mogen ook in scripts/telegram-kanalen.txt staan (één per regel, # = comment).
ADMIN_TOKEN komt uit .env.local of de omgeving.
"""

import html
import json
import os
import re
import sys
import urllib.request
from pathlib import Path

SITE = os.environ.get(
    "BEELDEN_SITE", "https://actieplatform-politiegeweld-nieuw.vercel.app"
)
TREFWOORDEN = [
    "politie", "agent", "geweld", "mishandel", "schiet", "arrestat", "aanhouding",
    "overleden", "taser", "nekklem", "profiler", "discrimin", "racisme", "demonstratie",
    "gearresteerd", "verdachte",
]


def lees_token() -> str:
    env_bestand = Path(__file__).resolve().parent.parent / ".env.local"
    if env_bestand.exists():
        for regel in env_bestand.read_text(encoding="utf-8").splitlines():
            if regel.startswith("ADMIN_TOKEN="):
                return regel.split("=", 1)[1].strip().strip('"').strip("'")
    return os.environ.get("ADMIN_TOKEN", "")


def kanalen_uit_argumenten() -> list[str]:
    for i, arg in enumerate(sys.argv):
        if arg == "--kanalen" and i + 1 < len(sys.argv):
            return [k.strip().lstrip("@") for k in sys.argv[i + 1].split(",") if k.strip()]
    bestand = Path(__file__).resolve().parent / "telegram-kanalen.txt"
    if bestand.exists():
        return [
            regel.strip().lstrip("@")
            for regel in bestand.read_text(encoding="utf-8").splitlines()
            if regel.strip() and not regel.startswith("#")
        ]
    return []


def haal_berichten(kanaal: str) -> list[dict]:
    url = f"https://t.me/s/{kanaal}"
    verzoek = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(verzoek, timeout=30) as antwoord:
        pagina = antwoord.read().decode("utf-8", errors="replace")

    berichten = []
    for match in re.finditer(r'data-post="([^"]+)"', pagina):
        post = match.group(1)
        begin = match.start()
        volgende = pagina.find('data-post="', begin + 1)
        blok = pagina[begin : volgende if volgende != -1 else begin + 6000]
        tekst_match = re.search(
            r'class="tgme_widget_message_text[^"]*"[^>]*>(.*?)</div>', blok, re.S
        )
        if not tekst_match:
            continue
        tekst = re.sub(r"<br\s*/?>", "\n", tekst_match.group(1))
        tekst = re.sub(r"<[^>]+>", "", tekst)
        tekst = html.unescape(tekst).strip()
        heeft_media = ("tgme_widget_message_video" in blok) or ("<video" in blok)
        if len(tekst) < 15:
            continue
        post_id = post.split("/")[-1]
        berichten.append(
            {
                "post": post_id,
                "tekst": tekst,
                "media": heeft_media,
                "url": f"https://t.me/{kanaal}/{post_id}",
            }
        )
    return berichten


def importeer(items: list[dict], token: str) -> None:
    verzoek = urllib.request.Request(
        f"{SITE}/api/beheer/beelden",
        data=json.dumps({"items": items}).encode(),
        method="POST",
        headers={
            "content-type": "application/json",
            "Authorization": f"Bearer {token}",
        },
    )
    with urllib.request.urlopen(verzoek, timeout=120) as antwoord:
        print("Import:", antwoord.read().decode())


def main() -> None:
    proef = "--proef" in sys.argv
    alles = "--alles" in sys.argv
    media = "--media" in sys.argv
    kanalen = kanalen_uit_argumenten()
    if not kanalen:
        print("Geen kanalen opgegeven. Gebruik --kanalen naam1,naam2 of scripts/telegram-kanalen.txt.")
        return

    kandidaten = []
    for kanaal in kanalen:
        try:
            berichten = haal_berichten(kanaal)
        except Exception as fout:  # noqa: BLE001
            print(f"  ! {kanaal}: {str(fout)[:70]}")
            continue
        treffers = 0
        for bericht in berichten:
            laag = bericht["tekst"].lower()
            if (
                alles
                or any(woord in laag for woord in TREFWOORDEN)
                or (media and bericht["media"])
            ):
                kandidaten.append(
                    {
                        "url": bericht["url"],
                        "titel": bericht["tekst"][:150].replace("\n", " "),
                        "toelichting": ("Video bij bericht" if bericht["media"] else "")[:200],
                        "plaats": "",
                        "datum": "",
                        "bron": f"Telegram-oogst ({kanaal})",
                    }
                )
                treffers += 1
        print(f"  {kanaal}: {len(berichten)} berichten, {treffers} treffers")

    print("kandidaten:", len(kandidaten))
    if proef:
        for item in kandidaten[:10]:
            print(" -", item["titel"][:80], "|", item["url"])
        return
    if not kandidaten:
        print("Niets te importeren.")
        return
    token = lees_token()
    if not token:
        print("Geen ADMIN_TOKEN gevonden. Stop.")
        sys.exit(1)
    for i in range(0, len(kandidaten), 80):
        importeer(kandidaten[i : i + 80], token)


if __name__ == "__main__":
    main()
