#!/usr/bin/env python3
"""Verwerkt een uitzendopname voor de live-pagina van het Actieplatform.

Wat het doet:
  1. Brandt het platform-logo in de video (rechtsonder) en schaalt naar 720p.
  2. Zet de opname op de publieke opslag (Vercel Blob).
  3. Registreert hem 30 dagen in de database; daarna verwijdert de site
     hem automatisch (document en bestand).

Gebruik:
  python3 scripts/live-upload.py <video> "<titel>"

Voorbeeld:
  python3 scripts/live-upload.py ~/opnames/uitzending-11-okt.mp4 "Uitzending 11 oktober"
"""

import json
import re
import subprocess
import sys
import tempfile
import time
import urllib.request
from datetime import datetime, timedelta, timezone
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
WATERMERK = REPO / "public" / "logo-watermerk.png"
PROJECT = "actieplatform-politiegeweld"


def env_waarde(sleutel: str) -> str:
    for regel in (REPO / ".env.local").read_text().splitlines():
        if regel.startswith(f"{sleutel}="):
            return regel.split("=", 1)[1].strip().strip('"')
    raise SystemExit(f"{sleutel} niet gevonden in .env.local")


def firebase_token() -> str:
    pad = Path.home() / ".config/configstore/firebase-tools.json"
    conf = json.loads(pad.read_text())
    token = conf.get("tokens", {}).get("access_token", "")
    if not token:
        raise SystemExit("Geen firebase-token; draai eerst: firebase projects:list")
    return token


def slug(tekst: str) -> str:
    schoon = re.sub(r"[^a-z0-9]+", "-", tekst.lower()).strip("-")
    return schoon[:60] or "uitzending"


def duur_seconden(pad: Path) -> float:
    uit = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "csv=p=0", str(pad)],
        capture_output=True, text=True)
    try:
        return round(float(uit.stdout.strip()), 1)
    except ValueError:
        return 0.0


def main() -> None:
    if len(sys.argv) < 3:
        raise SystemExit('Gebruik: python3 scripts/live-upload.py <video> "<titel>"')

    bron = Path(sys.argv[1]).expanduser().resolve()
    titel = sys.argv[2].strip()
    if not bron.exists():
        raise SystemExit(f"Bestand niet gevonden: {bron}")

    nu = datetime.now(timezone.utc)
    verloopt = nu + timedelta(days=30)
    bestandsnaam = f"{nu:%Y-%m-%d}-{slug(titel)}.mp4"

    # 1. Logo erin branden + 720p
    with tempfile.TemporaryDirectory(prefix="actieplatform-") as tmp:
        uit = Path(tmp) / "klaar.mp4"
        print("1/3 Video verwerken (logo erin, 720p)...")
        commando = [
            "ffmpeg", "-y", "-i", str(bron), "-i", str(WATERMERK),
            "-filter_complex",
            "[0:v]scale='min(1280,iw)':-2[v];[v][1:v]overlay=W-w-28:H-h-28:format=auto",
            "-c:v", "libx264", "-crf", "24", "-preset", "medium",
            "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", str(uit),
        ]
        res = subprocess.run(commando, capture_output=True, text=True)
        if res.returncode != 0:
            print(res.stderr[-1500:])
            raise SystemExit("ffmpeg mislukte")
        grootte_mb = round(uit.stat().st_size / (1024 * 1024), 1)
        duur = duur_seconden(uit)

        # 2. Uploaden naar de publieke opslag
        print(f"2/3 Uploaden ({grootte_mb} MB)...")
        token = env_waarde("BLOB_READ_WRITE_TOKEN")
        res = subprocess.run(
            ["vercel", "blob", "put", str(uit), "-a", "public",
             "--pathname", f"uitzendingen/{bestandsnaam}",
             "--content-type", "video/mp4", "--rw-token", token],
            capture_output=True, text=True, cwd=REPO)
        url_match = re.search(r"Success!\s+(https://\S+)", res.stdout + res.stderr)
        if not url_match:
            print(res.stdout[-500:], res.stderr[-800:])
            raise SystemExit("Upload mislukte")
        url = url_match.group(1)

    # 3. Registreren in de database (30 dagen)
    print("3/3 Registreren in de database...")
    doc_id = f"{nu:%Y%m%d-%H%M%S}-{slug(titel)}"
    velden = {
        "titel": {"stringValue": titel},
        "url": {"stringValue": url},
        "grootteMb": {"doubleValue": grootte_mb},
        "duurSec": {"doubleValue": duur},
        "toegevoegdOp": {"stringValue": nu.isoformat()},
        "verlooptOp": {"stringValue": verloopt.isoformat()},
        "logo": {"booleanValue": True},
    }
    body = json.dumps({"fields": velden}).encode()
    eindpunt = (
        f"https://firestore.googleapis.com/v1/projects/{PROJECT}"
        f"/databases/default/documents/uitzendingen?documentId={doc_id}"
    )
    verzoek = urllib.request.Request(
        eindpunt, data=body,
        headers={"Authorization": "Bearer " + firebase_token(),
                 "Content-Type": "application/json"},
        method="POST")
    try:
        with urllib.request.urlopen(verzoek, timeout=60) as antwoord:
            json.load(antwoord)
    except urllib.error.HTTPError as fout:
        melding = fout.read().decode()[:400]
        raise SystemExit(f"Database-fout {fout.code}: {melding}")

    print()
    print("Klaar. De uitzending staat op /live en verdwijnt automatisch op")
    print(f"{verloopt:%d-%m-%Y} (30 dagen bewaard).")
    print(f"Bestand: {url}")


if __name__ == "__main__":
    main()
