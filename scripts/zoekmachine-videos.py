#!/usr/bin/env python3
"""Vind video's via de lokale SearXNG (site:-queries op tiktok/instagram/
youtube/facebook/dumpert). Platformzoekers missen veel; zoekmachines indexeren het.
Draai: python3 scripts/zoekmachine-videos.py
"""
import json
import os
import re
import time

import requests

SEARX = os.environ.get("SEARXNG_URL", "http://127.0.0.1:8080")
BASIS = os.path.expanduser("~/actieplatform-analyse")
KANDIDATEN = os.path.join(BASIS, "social-kandidaten.json")

QUERIES = [
    'site:tiktok.com "politie" "geweld"',
    'site:tiktok.com politie slaat',
    'site:tiktok.com politie mishandelt',
    'site:tiktok.com politie aanhouding',
    'site:tiktok.com agent geweld',
    'site:tiktok.com politie amsterdam',
    'site:tiktok.com politie rotterdam',
    'site:tiktok.com politie utrecht',
    'site:tiktok.com politie den haag',
    'site:tiktok.com politie eindhoven',
    'site:instagram.com politiegeweld',
    'site:instagram.com politie geweld',
    'site:youtube.com politiegeweld nederland',
    'site:youtube.com politie slaat',
    'site:youtube.com politie mishandelt',
    'site:facebook.com politiegeweld',
    'site:facebook.com politie slaat',
    'site:dumpert.nl politie geweld',
    'site:dumpert.nl politie slaat',
    '"politie geweld" video nederland',
    '"politie mishandelt" video',
    '"politie schopt" video',
    '"politie trapt" video',
    '"politie taser" nederland',
    '"politie wapenstok" nederland',
    '"politie pepperspray" nederland',
    '"politie nekklem" nederland',
    '"politie profileren" nederland',
    '"politie racisme" nederland',
    '"politie hardhandig" nederland',
    '"politie arrestatie" geweld nederland',
    '"politie controle" geweld nederland',
    'politie geweld amsterdam',
    'politie geweld rotterdam',
    'politie geweld utrecht',
    'politie geweld den haag',
    'politie geweld eindhoven',
    'politie geweld groningen',
    'politie geweld tilburg',
    'politie geweld breda',
]

PATRONEN = [
    ("TikTok", re.compile(r"https?://(?:www\.)?tiktok\.com/@[\w.\-]+/video/\d{6,25}")),
    ("Instagram", re.compile(r"https?://(?:www\.)?instagram\.com/(?:p|reel|reels|tv)/[\w-]{5,30}")),
    ("YouTube", re.compile(r"https?://(?:www\.)?(?:youtube\.com/(?:watch\?[^#\s&]*v=[\w-]{6,20}|shorts/[\w-]{6,20})|youtu\.be/[\w-]{6,20})")),
    ("Facebook", re.compile(r"https?://(?:www\.|m\.)?facebook\.com/[^\"'\s<>]+/videos/\d{6,25}")),
    ("Facebook", re.compile(r"https?://fb\.watch/[\w-]{5,30}")),
    ("Dumpert", re.compile(r"https?://(?:www\.)?dumpert\.nl/(?:item|mediainfo)/[^\"'\s<>]+")),
]

POLITIE = ["politie", "agent", "marechaussee", "boa", "handhaving"]
INCIDENT = ["geweld", "slaat", "sloeg", "geslagen", "mishandel", "schopt", "trapt",
            "duwt", "sleurt", "taser", "wapenstok", "pepperspray", "nekklem",
            "aanhoud", "arrestat", "schiet", "overleden", "dood", "profiler",
            "discrimin", "racisme", "klacht", "aangifte", "stopformulier",
            "hardhandig", "controle", "rellen", "demonstratie"]
NL = ["nederland","amsterdam","rotterdam","den haag","utrecht","eindhoven","groningen","tilburg","almere","breda","nijmegen","apeldoorn","haarlem","arnhem","enschede","amersfoort","zaanstad","den bosch","zwolle","leiden","maastricht","dordrecht","deventer","delft","alkmaar","venlo","hilversum","heerlen","lelystad","gouda","emmen","assen","middelburg","vlissingen","spijkenisse","twente","friesland","limburg","brabant","gelderland","overijssel","drenthe","zeeland","flevoland","noord-holland","zuid-holland","politie","agent"]
BUITEN = ["belgië","belgie","brussel","antwerpen","vlaanderen","frankrijk","duitsland","verenigd koninkrijk","spanje","italië","suriname","curaçao","aruba","verenigde staten","amerika","canada","oekraïne","rusland"]

def relevant(tekst):
    laag = tekst.lower()
    if any(w in laag for w in BUITEN):
        return False
    if not any(w in laag for w in NL):
        return False
    return any(w in laag for w in POLITIE) and any(w in laag for w in INCIDENT)

def canoniek(url):
    url = url.split("?")[0].rstrip("/")
    yt = re.search(r"(?:youtube\.com/(?:watch\?v=|embed/|shorts/)|youtu\.be/)([\w-]{6,20})", url)
    if yt:
        return f"https://www.youtube.com/watch?v={yt.group(1)}"
    ig = re.search(r"instagram\.com/(p|reel|reels|tv)/([\w-]{5,30})", url)
    if ig:
        soort = "reel" if ig.group(1) == "reels" else ig.group(1)
        return f"https://www.instagram.com/{soort}/{ig.group(2)}/"
    return url

def main():
    kandidaten = {}
    if os.path.exists(KANDIDATEN):
        kandidaten = {x["url"]: x for x in json.load(open(KANDIDATEN)) if x.get("url")}
    print(f"kandidaten nu: {len(kandidaten)}")
    nieuw = 0
    per_platform = {}
    for query in QUERIES:
        try:
            r = requests.get(f"{SEARX}/search", params={"q": query, "format": "json", "language": "nl"},
                             timeout=30)
            if r.status_code != 200:
                print(f"[SearXNG] {query!r}: status {r.status_code}")
                time.sleep(2)
                continue
            resultaten = r.json().get("results", [])
            print(f"[SearXNG] {query!r}: {len(resultaten)} resultaten")
            for result in resultaten:
                titel = str(result.get("title", ""))
                inhoud = str(result.get("content", ""))
                url = str(result.get("url", ""))
                if not relevant(titel + " " + inhoud + " " + query):
                    continue
                for platform, patroon in PATRONEN:
                    m = patroon.search(url)
                    if not m:
                        continue
                    schoon = canoniek(m.group(0))
                    if schoon in kandidaten:
                        break
                    kandidaten[schoon] = {
                        "url": schoon,
                        "titel": titel[:160] or query,
                        "toelichting": f"Zoekmachine: {query}",
                        "plaats": "",
                        "datum": "",
                        "bron": "Zoekmachine",
                    }
                    nieuw += 1
                    per_platform[platform] = per_platform.get(platform, 0) + 1
                    break
        except Exception as fout:  # noqa: BLE001
            print(f"[SearXNG] {query!r} faalde: {str(fout)[:90]}")
        time.sleep(1.2)
    os.makedirs(BASIS, exist_ok=True)
    json.dump(list(kandidaten.values()), open(KANDIDATEN, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"klaar: {nieuw} nieuw, {len(kandidaten)} totaal")
    print("per platform:", per_platform)

if __name__ == "__main__":
    main()
