#!/usr/bin/env python3
"""TikTok-live-watcher: houdt een lijst TikTok-accounts in de gaten en zet een
verborgen tip in het beheer zodra een van hen LIVE gaat. Zo verschijnen
TikTok-lives over politie/geweld in Nederland op de site (na jouw goedkeuring),
zonder dat TikTok doorzocht hoeft te worden (dat kan technisch niet).

Gebruik:
  ~/ai_firefox_agent/venv/bin/python scripts/tiktok-live-watcher.py --proef
  ~/ai_firefox_agent/venv/bin/python scripts/tiktok-live-watcher.py            # één ronde
  ~/ai_firefox_agent/venv/bin/python scripts/tiktok-live-watcher.py --rondjes  # blijft kijken

Accounts: scripts/tiktok-accounts.txt (één @naam per regel, # = comment),
of --accounts naam1,naam2. Zonder accounts doet het script niets: vul de
namen aan die jij wilt volgen (112-accounts, activisten, lokale media).
"""

import json
import os
import sys
import time
import urllib.request
from pathlib import Path

SITE = os.environ.get(
    "BEELDEN_SITE", "https://actieplatform-politiegeweld-nieuw.vercel.app"
)


def lees_token() -> str:
    env_bestand = Path(__file__).resolve().parent.parent / ".env.local"
    if env_bestand.exists():
        for regel in env_bestand.read_text(encoding="utf-8").splitlines():
            if regel.startswith("ADMIN_TOKEN="):
                return regel.split("=", 1)[1].strip().strip('"').strip("'")
    return os.environ.get("ADMIN_TOKEN", "")


def accounts() -> list[str]:
    for i, arg in enumerate(sys.argv):
        if arg == "--accounts" and i + 1 < len(sys.argv):
            return [a.strip().lstrip("@") for a in sys.argv[i + 1].split(",") if a.strip()]
    bestand = Path(__file__).resolve().parent / "tiktok-accounts.txt"
    if bestand.exists():
        return [
            regel.strip().lstrip("@")
            for regel in bestand.read_text(encoding="utf-8").splitlines()
            if regel.strip() and not regel.startswith("#")
        ]
    return []


def tip_live(account: str, token: str) -> None:
    verzoek = urllib.request.Request(
        f"{SITE}/api/beheer/beelden",
        data=json.dumps(
            {
                "items": [
                    {
                        "url": f"https://www.tiktok.com/@{account}/live",
                        "titel": f"TikTok-live van @{account} (mogelijk politie/geweld)",
                        "toelichting": "Automatisch gemeld door de live-watcher. Controleer en keur goed.",
                        "plaats": "",
                        "datum": "",
                        "bron": "TikTokLive-watcher",
                    }
                ]
            }
        ).encode(),
        method="POST",
        headers={
            "content-type": "application/json",
            "Authorization": f"Bearer {token}",
        },
    )
    with urllib.request.urlopen(verzoek, timeout=60) as antwoord:
        print(f"  tip verstuurd voor @{account}:", antwoord.read().decode())


def controleer(account: str, token: str) -> None:
    from TikTokLive import TikTokLiveClient

    client = TikTokLiveClient(unique_id=f"@{account}")
    gezien = {"live": False}

    @client.on("connect")
    async def bij_verbinden(_event):  # noqa: ANN001
        gezien["live"] = True
        print(f"  @{account} is LIVE")
        tip_live(account, token)
        await client.disconnect()

    @client.on("disconnect")
    async def bij_verbreken(_event):  # noqa: ANN001
        pass

    try:
        client.run(process_connect=True, timeout=25)
    except Exception:  # offline of tijdelijk probleem
        pass
    if not gezien["live"]:
        print(f"  @{account}: niet live")


def main() -> None:
    proef = "--proef" in sys.argv
    rondjes = "--rondjes" in sys.argv
    namen = accounts()
    if not namen:
        print("Geen accounts. Vul scripts/tiktok-accounts.txt of gebruik --accounts.")
        return
    print("accounts:", ", ".join(namen))
    if proef:
        print("proef: geen verbinding gemaakt.")
        return
    token = lees_token()
    if not token:
        print("Geen ADMIN_TOKEN gevonden. Stop.")
        sys.exit(1)
    while True:
        for naam in namen:
            controleer(naam, token)
        if not rondjes:
            break
        print("volgende ronde over 10 minuten...")
        time.sleep(600)


if __name__ == "__main__":
    main()
