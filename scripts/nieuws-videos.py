#!/usr/bin/env python3
"""Zoek video's in de nieuwsartikelen zelf (embedded YouTube/TikTok/Instagram/
Facebook/Dumpert). Nieuws is al NL-gefilterd; de video hoort bij het incident.
Draai: python3 scripts/nieuws-videos.py
"""
import json
import os
import re
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed

import requests

BASIS = os.path.expanduser("~/actieplatform-analyse")
KANDIDATEN = os.path.join(BASIS, "social-kandidaten.json")
SITE = os.environ.get("SITE_URL", "https://actieplatform-politiegeweld-nieuw.vercel.app")
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36")

PATRONEN = [
    ("YouTube", re.compile(r"https?://(?:www\.)?(?:youtube\.com/(?:watch\?[^\"'\s<>]+|embed/[\w-]{6,20}|shorts/[\w-]{6,20})|youtu\.be/[\w-]{6,20})")),
    ("TikTok", re.compile(r"https?://(?:www\.)?tiktok\.com/@[\w.\-]+/video/\d{6,25}")),
    ("Instagram", re.compile(r"https?://(?:www\.)?instagram\.com/(?:p|reel|reels|tv)/[\w-]{5,30}")),
    ("Facebook", re.compile(r"https?://(?:www\.|m\.)?facebook\.com/[^\"'\s<>]+/videos/\d{6,25}")),
    ("Facebook", re.compile(r"https?://fb\.watch/[\w-]{5,30}")),
    ("Dumpert", re.compile(r"https?://(?:www\.)?dumpert\.nl/mediainfo/[^\"'\s<>]+")),
]

def schoon(url):
    url = url.replace("&amp;", "&").rstrip(".,);]")
    return url

def haal(bericht):
    try:
        r = requests.get(bericht["url"], headers={"User-Agent": UA}, timeout=12, allow_redirects=True)
        if r.status_code != 200 or not r.text:
            return bericht, []
        gevonden = []
        for platform, patroon in PATRONEN:
            for m in patroon.findall(r.text):
                url = schoon(m)
                # YouTube-watch zonder id overslaan
                if platform == "YouTube" and "watch?" in url and "v=" not in url:
                    continue
                gevonden.append((platform, url))
        return bericht, gevonden
    except Exception:
        return bericht, []

def main():
    kandidaten = {}
    if os.path.exists(KANDIDATEN):
        kandidaten = {x["url"]: x for x in json.load(open(KANDIDATEN)) if x.get("url")}
    nieuws = requests.get(f"{SITE}/api/nieuws", headers={"User-Agent": UA}, timeout=30).json()
    berichten = nieuws.get("berichten", [])
    print(f"nieuwsberichten: {len(berichten)}, kandidaten nu: {len(kandidaten)}")
    nieuw = 0
    per_platform = {}
    with ThreadPoolExecutor(max_workers=10) as pool:
        futures = [pool.submit(haal, b) for b in berichten]
        for i, future in enumerate(as_completed(futures), 1):
            bericht, gevonden = future.result()
            for platform, url in gevonden:
                if url in kandidaten:
                    continue
                kandidaten[url] = {
                    "url": url,
                    "titel": str(bericht.get("titel", ""))[:160],
                    "toelichting": f"Video in nieuwsbericht ({bericht.get('bron','')})",
                    "plaats": str(bericht.get("plaats", "")),
                    "datum": str(bericht.get("datum", "")),
                    "bron": "Nieuws-video",
                }
                nieuw += 1
                per_platform[platform] = per_platform.get(platform, 0) + 1
            if i % 100 == 0:
                print(f"  {i}/{len(berichten)} artikelen, {nieuw} video's")
    os.makedirs(BASIS, exist_ok=True)
    json.dump(list(kandidaten.values()), open(KANDIDATEN, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"klaar: {nieuw} nieuw, {len(kandidaten)} totaal")
    print("per platform:", per_platform)

if __name__ == "__main__":
    main()
