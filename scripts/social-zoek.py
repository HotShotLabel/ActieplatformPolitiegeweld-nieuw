#!/usr/bin/env python3
"""Zoek en oogst openbare video's over politiegeweld op TikTok en Instagram.

Gebruikt de eigen browsersessie van de gebruiker (Firefox) via cookies:
- TikTok: Playwright op de zoekpagina (zoeken werkt alleen ingelogd).
- Instagram: hashtags via instaloader (publieke posts, geen downloads).

Resultaat: kandidaten als JSON in ~/actieplatform-analyse/ (verborgen import
gebeurt apart, via het beheer, zodra de database weer leest).

Gebruik:
    python3 scripts/social-zoek.py --tiktok "politiegeweld" "politie slaat"
    python3 scripts/social-zoek.py --instagram politiegeweld politiegeweldnederland
    python3 scripts/social-zoek.py            # standaardset, klein
"""

import argparse
import glob
import json
import os
import re
import sys
import time

BASIS = os.path.expanduser("~/actieplatform-analyse")
UIT = os.path.join(BASIS, "social-kandidaten.json")
DB = glob.glob(os.path.expanduser("~/.config/mozilla/firefox/*/cookies.sqlite"))
CHROME = os.path.expanduser(
    "~/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome"
)
UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
)

TIKTOK_STANDAARD = [
    "politiegeweld",
    "politie slaat",
    "politie slaat mij",
    "politie sloeg mij",
    "politie heeft mij geslagen",
    "politie heeft me geslagen",
    "politie mishandelt",
    "politie mishandelde mij",
    "politie gebruikt geweld",
    "politie gebruikte geweld",
    "politie viel mij aan",
    "politie pakte mij",
    "politie trapt",
    "politie schopt",
    "etnisch profileren",
    "stopformulier",
    "staande gehouden politie",
    "fouilleren politie",
]
IG_STANDAARD = [
    "politiegeweld", "politiegeweldnederland", "etnischprofileren",
    "politiemishandeling", "gewelddoordepolitie", "stopformulier",
    "controlealtdelete",
]
FACEBOOK_STANDAARD = [
    "politiegeweld",
    "politie slaat",
    "politie slaat mij",
    "politie heeft mij geslagen",
    "politie mishandelt",
    "politie gebruikt geweld",
    "politie viel mij aan",
    "politie pakte mij",
    "stopformulier",
    "staande gehouden politie",
]


def laad_bestaand():
    if os.path.exists(UIT):
        try:
            with open(UIT, encoding="utf-8") as bestand:
                return {item["url"]: item for item in json.load(bestand)}
        except (json.JSONDecodeError, KeyError):
            return {}
    return {}


def bewaar(kandidaten):
    os.makedirs(BASIS, exist_ok=True)
    tijdelijk = UIT + ".tmp"
    with open(tijdelijk, "w", encoding="utf-8") as bestand:
        json.dump(list(kandidaten.values()), bestand, ensure_ascii=False, indent=1)
    os.replace(tijdelijk, UIT)
    print(f"bewaard: {len(kandidaten)} kandidaten -> {UIT}")


def koekjes(domein):
    import browser_cookie3

    jar = browser_cookie3.firefox(cookie_file=DB[0], domain_name=domein)
    uit = []
    for c in jar:
        try:
            ruw = int(c.expires) if c.expires else 0
        except (TypeError, ValueError):
            ruw = 0
        expires = -1 if ruw <= 0 else (ruw // 1000 if ruw > 10**12 else ruw)
        uit.append({
            "name": c.name,
            "value": c.value,
            "domain": c.domain if c.domain.startswith(".") else "." + c.domain,
            "path": c.path or "/",
            "secure": bool(c.secure),
            "httpOnly": False,
            "expires": expires,
        })
    return uit


def tiktok_zoek(termen, scrolls=3, kandidaten=None):
    if kandidaten is None:
        kandidaten = {}
    if not DB:
        print("geen Firefox-profiel gevonden; log eerst in bij TikTok.")
        return kandidaten

    import asyncio
    from playwright.async_api import async_playwright

    async def run():
        post_videos = []
        async with async_playwright() as p:
            browser = await p.chromium.launch(
                executable_path=CHROME, headless=True,
                args=["--no-sandbox", "--disable-blink-features=AutomationControlled"],
            )
            context = await browser.new_context(
                user_agent=UA, locale="nl-NL",
                viewport={"width": 1280, "height": 900},
            )
            await context.add_cookies(koekjes("tiktok.com"))
            pagina = await context.new_page()
            for term in termen:
                try:
                    await pagina.goto(
                        f"https://www.tiktok.com/search?q={term}",
                        wait_until="domcontentloaded", timeout=60000,
                    )
                    await pagina.wait_for_timeout(6000)
                    for _ in range(scrolls):
                        await pagina.mouse.wheel(0, 1400)
                        await pagina.wait_for_timeout(1800)
                    resultaten = await pagina.eval_on_selector_all(
                        'a[href*="/video/"]',
                        """els => [...new Map(els.map(e => [e.href, {
                            href: e.href,
                            alt: (e.querySelector('img')?.alt || '').slice(0, 300)
                        }])).values()]""",
                    )
                    nieuw = 0
                    for rij in resultaten:
                        url = rij["href"].split("?")[0]
                        titel = " ".join((rij["alt"] or "").split())
                        titel = titel.split(" gemaakt door ")[0].strip()[:150]
                        account_match = re.search(r"tiktok\.com/@([^/]+)/", url)
                        account = account_match.group(1) if account_match else ""
                        if not is_nederlands(titel, account):
                            continue
                        bestaand = kandidaten.get(url)
                        if bestaand:
                            # Eerdere runs vulden alleen kijkcijfers als titel;
                            # een echte beschrijving overschrijft die.
                            if titel and bestaand["titel"].strip().replace(
                                ",", "").replace(".", "").isdigit():
                                bestaand["titel"] = titel
                            continue
                        kandidaten[url] = {
                            "url": url,
                            "titel": titel or f"TikTok-zoek: {term}",
                            "toelichting": f"TikTok-zoekopdracht: {term}",
                            "plaats": "",
                            "datum": "",
                            "bron": "TikTok-oogst",
                        }
                        nieuw += 1
                    print(f"[TikTok] {term!r}: {len(resultaten)} links, {nieuw} nieuw")
                except Exception as fout:  # noqa: BLE001
                    print(f"[TikTok] {term!r} faalde: {str(fout)[:100]}")
                time.sleep(2.0)
            await browser.close()
        if post_videos:
            doel = os.path.expanduser("~/actieplatform-analyse/facebook-post-videos.json")
            bestaand = []
            if os.path.exists(doel):
                try:
                    bestaand = json.load(open(doel))
                except Exception:  # noqa: BLE001
                    bestaand = []
            bekend = {x["url"] for x in bestaand}
            bestaand += [x for x in post_videos if x["url"] not in bekend]
            json.dump(bestaand, open(doel, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
            print(f"[Facebook-post] {len(post_videos)} post-video's -> facebook-post-videos.json")

    asyncio.run(run())
    return kandidaten


def instagram_hashtags(tags, aantal=12, kandidaten=None):
    if kandidaten is None:
        kandidaten = {}
    import browser_cookie3
    import instaloader

    loader = instaloader.Instaloader(
        download_pictures=False, download_videos=False,
        download_video_thumbnails=False, save_metadata=False,
        quiet=True, max_connection_attempts=1,
    )
    cookies = {
        c.name: c.value
        for c in browser_cookie3.firefox(cookie_file=DB[0])
        if "instagram" in c.domain
    }
    if not cookies.get("sessionid"):
        print("geen Instagram-sessie gevonden; log eerst in bij Instagram.")
        return kandidaten
    loader.context.update_cookies(cookies)
    gebruiker = loader.test_login()
    loader.context.username = gebruiker
    print(f"[Instagram] ingelogd als {gebruiker or '?'}")
    for tag in tags:
        try:
            hashtag = instaloader.Hashtag.from_name(loader.context, tag)
            teller = 0
            for post in hashtag.get_posts_resumable():
                if teller >= aantal:
                    break
                teller += 1
                url = f"https://www.instagram.com/p/{post.shortcode}/"
                if url in kandidaten:
                    continue
                caption = " ".join((post.caption or "").split())
                # Hashtag ≠ incident: alleen posts met politie/geweld-taal.
                if not any(woord in caption.lower() for woord in POLITIE_WOORDEN):
                    continue
                # Alleen zaken in Nederland (buitenlandse media mogen erover
                # berichten, maar de gebeurtenis moet NL zijn).
                if not is_nederlands(caption):
                    continue
                kandidaten[url] = {
                    "url": url,
                    "titel": caption[:150] or f"Instagram #{tag}",
                    "toelichting": f"Instagram-hashtag #{tag}",
                    "plaats": "",
                    "datum": post.date_utc.strftime("%Y-%m-%d") if post.date_utc else "",
                    "bron": "Instagram-oogst",
                }
            print(f"[Instagram] #{tag}: {teller} posts")
        except Exception as fout:  # noqa: BLE001
            print(f"[Instagram] #{tag} faalde: {str(fout)[:100]}")
        time.sleep(1.5)
    return kandidaten


def facebook_zoek(termen, scrolls=3, kandidaten=None):
    if kandidaten is None:
        kandidaten = {}
    if not DB:
        print("geen Firefox-profiel gevonden; log eerst in bij Facebook.")
        return kandidaten

    import asyncio
    from playwright.async_api import async_playwright

    async def run():
        post_videos = []
        async with async_playwright() as p:
            browser = await p.chromium.launch(
                executable_path=CHROME, headless=True,
                args=["--no-sandbox", "--disable-blink-features=AutomationControlled"],
            )
            context = await browser.new_context(
                user_agent=UA, locale="nl-NL",
                viewport={"width": 1280, "height": 900},
            )
            await context.add_cookies(koekjes("facebook.com"))
            pagina = await context.new_page()
            for term in termen:
                try:
                    await pagina.goto(
                        f"https://www.facebook.com/search/videos/?q={term}",
                        wait_until="domcontentloaded", timeout=60000,
                    )
                    await pagina.wait_for_timeout(7000)
                    for _ in range(scrolls):
                        await pagina.mouse.wheel(0, 1600)
                        await pagina.wait_for_timeout(1800)
                    resultaten = await pagina.eval_on_selector_all(
                        'a[href*="/videos/"], a[href*="/reel/"]',
                        """els => [...new Map(els.map(e => [e.href.split('?')[0], {
                            href: e.href.split('?')[0],
                            aria: e.getAttribute('aria-label') || '',
                            tekst: (e.closest('[role="article"]')?.innerText
                                    || e.innerText || '').slice(0, 260)
                        }])).values()]""",
                    )
                    nieuw = 0
                    for rij in resultaten:
                        url = rij["href"]
                        if not re.search(r"/videos/\d+|/reel/\d+", url):
                            continue
                        if url in kandidaten:
                            continue
                        titel = ""
                        aria = (rij.get("aria") or "").split("\n")[0].strip()
                        if len(aria) > 3:
                            titel = aria
                        else:
                            for regel in (rij.get("tekst") or "").split("\n"):
                                regel = regel.strip()
                                if re.match(r"^\d+:\d+$", regel):
                                    continue
                                if len(regel) > 3:
                                    titel = regel
                                    break
                        if not is_nederlands(titel + " " + (rij.get("tekst") or "")):
                            continue
                        kandidaten[url] = {
                            "url": url,
                            "titel": titel[:150] or f"Facebook-zoek: {term}",
                            "toelichting": f"Facebook-zoekopdracht: {term}",
                            "plaats": "",
                            "datum": "",
                            "bron": "Facebook-oogst",
                        }
                        nieuw += 1
                    print(f"[Facebook] {term!r}: {len(resultaten)} links, {nieuw} nieuw")
                except Exception as fout:  # noqa: BLE001
                    print(f"[Facebook] {term!r} faalde: {str(fout)[:100]}")
                time.sleep(2.0)
            await browser.close()
        if post_videos:
            doel = os.path.expanduser("~/actieplatform-analyse/facebook-post-videos.json")
            bestaand = []
            if os.path.exists(doel):
                try:
                    bestaand = json.load(open(doel))
                except Exception:  # noqa: BLE001
                    bestaand = []
            bekend = {x["url"] for x in bestaand}
            bestaand += [x for x in post_videos if x["url"] not in bekend]
            json.dump(bestaand, open(doel, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
            print(f"[Facebook-post] {len(post_videos)} post-video's -> facebook-post-videos.json")

    asyncio.run(run())
    return kandidaten


FACEBOOK_STANDAARD = [
    "politiegeweld", "politie slaat", "politie mishandelt", "politie geweld",
    "politie schopt", "politie trapt", "politie duwt", "politie sleurt",
    "agent slaat", "agent mishandelt", "politie aanhouding geweld",
]
IG_PROFIELEN_STANDAARD = ["112_today"]

# Alleen incidenten in Nederland. Buitenlandse media mogen berichten, maar
# de zaak zelf moet NL zijn; anders valt het item af.
NL_MARKERS = [
    "nederland", "amsterdam", "rotterdam", "den haag", "utrecht",
    "eindhoven", "groningen", "tilburg", "almere", "breda", "nijmegen",
    "apeldoorn", "haarlem", "arnhem", "enschede", "amersfoort", "zaanstad",
    "den bosch", "'s-hertogenbosch", "zwolle", "leiden", "maastricht",
    "dordrecht", "zoetermeer", "deventer", "delft", "alkmaar", "venlo",
    "hilversum", "heerlen", "lelystad", "gouda", "hoogeveen", "roosendaal",
    "emmen", "assen", "middelburg", "vlissingen", "spijkenisse", "woerden",
    "houten", "nijverdal", "coevorden", "winterswijk", "veenendaal", "ede",
    "barneveld", "doetinchem", "sittard", "geleen", "roermond", "sneek",
    "drachten", "purmerend", "hoofddorp", "amstelveen", "schiedam",
    "vlaardingen", "helmond", "oss", "bergen op zoom", "terneuzen", "weert",
    "rijswijk", "nieuwegein", "zeist", "kampen", "hengelo", "oldenzaal",
    "almelo", "twente", "achterhoek", "friesland", "limburg", "brabant",
    "gelderland", "overijssel", "drenthe", "zeeland", "flevoland",
    "noord-holland", "zuid-holland",
]
BUITENLAND = [
    "belgië", "belgie", "brussel", "antwerpen", "vlaanderen", "wallonië",
    "frankrijk", "duitsland", "verenigd koninkrijk", "engeland", "spanje",
    "italië", "suriname", "curaçao", "aruba", "bonaire", "verenigde staten",
    "amerika", "canada", "australië", "zwitserland", "oostenrijk", "polen",
    "turkije", "marokko", "israël", "palestina", "oekraïne", "rusland",
    "vrt", "nieuwsblad", "hln",
]
NL_ACCOUNTS = {
    "politiegeweldnl", "112_today", "112.fotografie.nederland",
    "nosstories", "rtlnieuws.nl", "denk_nl", "l1.limburg", "nu.nl",
    "omroep_flevoland", "zinloospolitiegeweld", "spotdiecontroleintwente",
}
POLITIE_WOORDEN = [
    "politie", "agent", "geweld", "mishandel", "profiler", "discrimin",
    "arrestat", "aanhoud", "taser", "wapenstok", "pepperspray",
    "stopformulier", "controle", "racisme", "politieoptreden",
    # Engelstalige berichten over NL mogen ook (buitenlandse media).
    "police", "violence", "racism", "discrimination", "profiling",
]


def is_nederlands(tekst, account=""):
    laag = f"{tekst} {account}".lower()
    if any(woord in laag for woord in BUITENLAND):
        return False
    if any(woord in laag for woord in NL_MARKERS):
        return True
    return account.lower().lstrip("@") in NL_ACCOUNTS


def tiktok_accounts(accounts=None, kandidaten=None):
    """Oogst TikTok-gebruikerspagina's via yt-dlp (werkt zonder login).
    Zonder opgave: accounts uit scripts/tiktok-accounts.txt plus alle
    handles die al in de kandidatenlijst voorkomen (automatisch groeien)."""
    if kandidaten is None:
        kandidaten = {}

    gevonden = set()
    if accounts:
        gevonden.update(accounts)
    else:
        pad = os.path.join(os.path.dirname(__file__), "tiktok-accounts.txt")
        if os.path.exists(pad):
            for regel in open(pad, encoding="utf-8"):
                regel = regel.split("#")[0].strip().lstrip("@")
                if regel:
                    gevonden.add(regel)
        for url in kandidaten:
            m = re.search(r"tiktok\.com/@([^/]+)/video/", url)
            if m:
                gevonden.add(m.group(1))

    for account in sorted(gevonden):
        try:
            uit = __import__("subprocess").run(
                [
                    "/home/diplomaat1936/.local/bin/yt-dlp",
                    f"https://www.tiktok.com/@{account}",
                    "--flat-playlist", "--playlist-end", "12",
                    "--dump-single-json", "--no-warnings", "--quiet",
                ],
                capture_output=True, text=True, timeout=120,
            )
            data = json.loads(uit.stdout or "{}")
            entries = data.get("entries") or []
            nieuw = 0
            for item in entries:
                vid = item.get("id")
                titel = (item.get("title") or "").strip()
                if not vid:
                    continue
                url = f"https://www.tiktok.com/@{account}/video/{vid}"
                if url in kandidaten:
                    continue
                kandidaten[url] = {
                    "url": url,
                    "titel": titel[:150] or f"TikTok @{account}",
                    "toelichting": f"TikTok-kanaal: @{account}",
                    "plaats": "",
                    "datum": "",
                    "bron": "TikTok-oogst",
                }
                nieuw += 1
            print(f"[TikTok-account] @{account}: {len(entries)} video's, {nieuw} nieuw")
        except Exception as fout:  # noqa: BLE001
            print(f"[TikTok-account] @{account} faalde: {str(fout)[:100]}")
        time.sleep(2.0)
    return kandidaten


def instagram_profielen(profielen, aantal=8, kandidaten=None):
    if kandidaten is None:
        kandidaten = {}
    import browser_cookie3
    import instaloader

    loader = instaloader.Instaloader(
        download_pictures=False, download_videos=False,
        download_video_thumbnails=False, save_metadata=False,
        quiet=True, max_connection_attempts=1,
    )
    cookies = {
        c.name: c.value
        for c in browser_cookie3.firefox(cookie_file=DB[0])
        if "instagram" in c.domain
    }
    if not cookies.get("sessionid"):
        print("geen Instagram-sessie gevonden; log eerst in bij Instagram.")
        return kandidaten
    loader.context.update_cookies(cookies)
    loader.context.username = loader.test_login()
    print(f"[Instagram-profiel] ingelogd als {loader.context.username or '?'}")
    for naam in profielen:
        try:
            profiel = instaloader.Profile.from_username(loader.context, naam)
            teller = 0
            for post in profiel.get_posts():
                if teller >= aantal:
                    break
                teller += 1
                url = f"https://www.instagram.com/p/{post.shortcode}/"
                if url in kandidaten:
                    continue
                caption = " ".join((post.caption or "").split())
                if not any(woord in caption.lower() for woord in POLITIE_WOORDEN):
                    continue
                if any(woord in caption.lower() for woord in (
                    "belgië", "belgie", "brussel", "antwerpen", "vlaanderen",
                    "frankrijk", "duitsland", "verenigd koninkrijk", "vrt",
                )):
                    continue
                kandidaten[url] = {
                    "url": url,
                    "titel": caption[:150] or f"Instagram @{naam}",
                    "toelichting": f"Instagram-profiel: @{naam}",
                    "plaats": "",
                    "datum": post.date_utc.strftime("%Y-%m-%d") if post.date_utc else "",
                    "bron": "Instagram-oogst",
                }
            print(f"[Instagram-profiel] @{naam}: {teller} posts")
        except Exception as fout:  # noqa: BLE001
            print(f"[Instagram-profiel] @{naam} faalde: {str(fout)[:100]}")
        time.sleep(1.5)
    return kandidaten


def facebook_pagina_zoek(termen, max_paginas=2, kandidaten=None):
    """Zoek openbare Facebook-pagina's bij een term, bezoek ze en oogst
    video-links. Groepen die lidmaatschap vereisen komen hier niet door."""
    if kandidaten is None:
        kandidaten = {}
    import asyncio
    from playwright.async_api import async_playwright

    async def run():
        post_videos = []
        async with async_playwright() as p:
            browser = await p.chromium.launch(
                executable_path=CHROME, headless=True,
                args=["--no-sandbox", "--disable-blink-features=AutomationControlled"],
            )
            context = await browser.new_context(
                user_agent=UA, locale="nl-NL",
                viewport={"width": 1280, "height": 900},
            )
            await context.add_cookies(koekjes("facebook.com"))
            pagina = await context.new_page()
            for term in termen:
                try:
                    await pagina.goto(
                        f"https://www.facebook.com/search/pages/?q={term}",
                        wait_until="domcontentloaded", timeout=60000,
                    )
                    await pagina.wait_for_timeout(6000)
                    paginas = await pagina.eval_on_selector_all(
                        'a[href*="facebook.com/"]',
                        """els => [...new Set(els.map(e => e.href.split('?')[0]))]
                            .filter(u => !/\\/(search|watch|reel|videos|groups|pages|photo|hashtag|login|help|privacy|policies)/.test(u))
                            .slice(0, 8)""",
                    )
                    print(f"[Facebook-pagina] {term!r}: {len(paginas)} pagina-links")
                    for pagina_url in paginas[:max_paginas]:
                        try:
                            await pagina.goto(pagina_url, wait_until="domcontentloaded", timeout=45000)
                            await pagina.wait_for_timeout(5000)
                            for _ in range(2):
                                await pagina.mouse.wheel(0, 1400)
                                await pagina.wait_for_timeout(1200)
                            videos = await pagina.eval_on_selector_all(
                                'a[href*="/videos/"], a[href*="/reel/"]',
                                """els => [...new Map(els.map(e => [e.href.split('?')[0], {
                                    href: e.href.split('?')[0],
                                    aria: e.getAttribute('aria-label') || ''
                                }])).values()]""",
                            )
                            for rij in videos:
                                url = rij["href"]
                                if not re.search(r"/videos/\d+|/reel/\d+", url):
                                    continue
                                if url in kandidaten:
                                    continue
                                titel = (rij.get("aria") or "").split("\n")[0].strip()
                                if not is_nederlands(titel + " " + pagina_url):
                                    continue
                                kandidaten[url] = {
                                    "url": url,
                                    "titel": titel[:150] or f"Facebook-pagina: {pagina_url}",
                                    "toelichting": f"Facebook-pagina: {pagina_url}",
                                    "plaats": "",
                                    "datum": "",
                                    "bron": "Facebook-oogst",
                                }
                            print(f"[Facebook-pagina] bezocht: {pagina_url[:70]} ({len(videos)} video-links)")
                        except Exception as fout:  # noqa: BLE001
                            print(f"[Facebook-pagina] bezoek faalde: {str(fout)[:80]}")
                except Exception as fout:  # noqa: BLE001
                    print(f"[Facebook-pagina] {term!r} faalde: {str(fout)[:100]}")
                time.sleep(2.0)
            await browser.close()
        if post_videos:
            doel = os.path.expanduser("~/actieplatform-analyse/facebook-post-videos.json")
            bestaand = []
            if os.path.exists(doel):
                try:
                    bestaand = json.load(open(doel))
                except Exception:  # noqa: BLE001
                    bestaand = []
            bekend = {x["url"] for x in bestaand}
            bestaand += [x for x in post_videos if x["url"] not in bekend]
            json.dump(bestaand, open(doel, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
            print(f"[Facebook-post] {len(post_videos)} post-video's -> facebook-post-videos.json")

    asyncio.run(run())
    return kandidaten


def facebook_posts_zoek(termen, max_posts=4, kandidaten=None):
    """Zoek openbare Facebook-posts (gewone mensen), bezoek de post en het
    auteurprofiel en oogst video-links. Alleen wat openbaar is."""
    if kandidaten is None:
        kandidaten = {}
    import asyncio
    from playwright.async_api import async_playwright

    async def run():
        post_videos = []
        async with async_playwright() as p:
            browser = await p.chromium.launch(
                executable_path=CHROME, headless=False, args=["--no-sandbox"],
            )
            context = await browser.new_context(
                user_agent=UA, locale="nl-NL",
                viewport={"width": 1280, "height": 900},
            )
            await context.add_cookies(koekjes("facebook.com"))
            pagina = await context.new_page()

            async def oogst_videos(ouder, bron_label):
                videos = await pagina.eval_on_selector_all(
                    'a[href*="/videos/"], a[href*="/reel/"]',
                    """els => [...new Map(els.map(e => [e.href.split('?')[0], {
                        href: e.href.split('?')[0],
                        aria: e.getAttribute('aria-label') || ''
                    }])).values()]""",
                )
                nieuw = 0
                for rij in videos:
                    url = rij["href"]
                    if not re.search(r"/videos/\d+|/reel/\d+", url):
                        continue
                    if url in kandidaten:
                        continue
                    titel = (rij.get("aria") or "").split("\n")[0].strip()
                    tekst = await pagina.inner_text("body")
                    if not is_nederlands(titel + " " + tekst[:400] + " " + ouder):
                        continue
                    kandidaten[url] = {
                        "url": url,
                        "titel": titel[:150] or f"Facebook: {bron_label}",
                        "toelichting": f"Facebook openbaar profiel/post: {bron_label}",
                        "plaats": "",
                        "datum": "",
                        "bron": "Facebook-oogst",
                    }
                    nieuw += 1
                print(f"[Facebook-post] {bron_label[:60]}: {nieuw} video's")
                return nieuw

            for term in termen:
                try:
                    await pagina.goto(
                        f"https://www.facebook.com/search/posts/?q={term}",
                        wait_until="domcontentloaded", timeout=60000,
                    )
                    await pagina.wait_for_timeout(7000)
                    for _ in range(2):
                        await pagina.mouse.wheel(0, 1500)
                        await pagina.wait_for_timeout(1500)
                    posts = await pagina.eval_on_selector_all(
                        'a[href*="/posts/"], a[href*="/permalink/"]',
                        "els => [...new Set(els.map(e => e.href.split('?')[0]))].slice(0, 8)",
                    )
                    print(f"[Facebook-post] {term!r}: {len(posts)} posts")
                    for post_url in posts[:max_posts]:
                        m = re.match(r"https://www\.facebook\.com/([^/]+)/(?:posts|permalink)/", post_url)
                        if not m:
                            continue
                        profiel_url = f"https://www.facebook.com/{m.group(1)}/"
                        # post zelf openen
                        try:
                            await pagina.goto(post_url, wait_until="domcontentloaded", timeout=45000)
                            await pagina.wait_for_timeout(5000)
                            for _ in range(2):
                                await pagina.mouse.wheel(0, 1300)
                                await pagina.wait_for_timeout(1200)
                            await oogst_videos(post_url, post_url)
                            heeft_video = await pagina.evaluate(
                                "() => document.querySelectorAll('video').length > 0"
                            )
                            if heeft_video:
                                body = await pagina.inner_text("body")
                                titel = next((r.strip() for r in body.splitlines() if len(r.strip()) > 40), "")
                                post_videos.append({
                                    "url": post_url,
                                    "titel": titel[:160],
                                    "auteur": profiel_url,
                                })
                                print(f"[Facebook-post] post met video: {post_url[-45:]}")
                        except Exception as fout:  # noqa: BLE001
                            print(f"[Facebook-post] post faalde: {str(fout)[:70]}")
                        # auteurprofiel openen
                        try:
                            await pagina.goto(profiel_url, wait_until="domcontentloaded", timeout=45000)
                            await pagina.wait_for_timeout(5000)
                            for _ in range(3):
                                await pagina.mouse.wheel(0, 1500)
                                await pagina.wait_for_timeout(1300)
                            await oogst_videos(profiel_url, profiel_url)
                        except Exception as fout:  # noqa: BLE001
                            print(f"[Facebook-post] profiel faalde: {str(fout)[:70]}")
                        time.sleep(1.5)
                except Exception as fout:  # noqa: BLE001
                    print(f"[Facebook-post] {term!r} faalde: {str(fout)[:90]}")
                time.sleep(2.0)
            await browser.close()
        if post_videos:
            doel = os.path.expanduser("~/actieplatform-analyse/facebook-post-videos.json")
            bestaand = []
            if os.path.exists(doel):
                try:
                    bestaand = json.load(open(doel))
                except Exception:  # noqa: BLE001
                    bestaand = []
            bekend = {x["url"] for x in bestaand}
            bestaand += [x for x in post_videos if x["url"] not in bekend]
            json.dump(bestaand, open(doel, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
            print(f"[Facebook-post] {len(post_videos)} post-video's -> facebook-post-videos.json")

    asyncio.run(run())
    return kandidaten


def reacties_mijnen(kandidaten, maximaal=5):
    """Best-effort: open Facebook-videopagina's en bewaar de zichtbare
    tekstregels/links (waaronder reacties) als leads voor handmatige check."""
    fb = [item for item in kandidaten.values() if item["bron"] == "Facebook-oogst"][:maximaal]
    if not fb:
        print("[reacties] geen Facebook-kandidaten")
        return
    import asyncio
    from playwright.async_api import async_playwright

    leads = []

    async def run():
        post_videos = []
        async with async_playwright() as p:
            browser = await p.chromium.launch(
                executable_path=CHROME, headless=True, args=["--no-sandbox"],
            )
            context = await browser.new_context(
                user_agent=UA, locale="nl-NL",
                viewport={"width": 1280, "height": 900},
            )
            await context.add_cookies(koekjes("facebook.com"))
            pagina = await context.new_page()
            for item in fb:
                try:
                    await pagina.goto(item["url"], wait_until="domcontentloaded", timeout=60000)
                    await pagina.wait_for_timeout(7000)
                    for _ in range(4):
                        await pagina.mouse.wheel(0, 1300)
                        await pagina.wait_for_timeout(1200)
                    tekst = await pagina.inner_text("body")
                    regels = []
                    for regel in tekst.splitlines():
                        regel = regel.strip()
                        if 20 <= len(regel) <= 220:
                            regels.append(regel)
                        if len(regels) >= 40:
                            break
                    links = list({u.rstrip(".,)") for u in re.findall(r"https?://\S+", tekst)})
                    leads.append({
                        "bron_url": item["url"],
                        "titel": item["titel"],
                        "regels": regels,
                        "links": links[:20],
                    })
                    print(f"[reacties] {item['url'][:70]}: {len(regels)} regels, {len(links)} links")
                except Exception as fout:  # noqa: BLE001
                    print(f"[reacties] faalde: {str(fout)[:80]}")
            await browser.close()

    asyncio.run(run())
    pad = os.path.join(BASIS, "social-reacties.json")
    with open(pad, "w", encoding="utf-8") as bestand:
        json.dump(leads, bestand, ensure_ascii=False, indent=1)
    print(f"[reacties] bewaard: {len(leads)} pagina's -> {pad}")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--tiktok", nargs="*", default=None,
                        help="TikTok-zoektermen (standaard: kleine set)")
    parser.add_argument("--instagram", nargs="*", default=None,
                        help="Instagram-hashtags (standaard: kleine set)")
    parser.add_argument("--facebook", nargs="*", default=None,
                        help="Facebook-videozoektermen (standaard: kleine set)")
    parser.add_argument("--tiktok-account", nargs="*", default=None,
                        help="TikTok-accounts (standaard: bestand + ontdekte handles)")
    parser.add_argument("--instagram-profiel", nargs="*", default=None,
                        help="Instagram-profielen (standaard: 112_today)")
    parser.add_argument("--facebook-pagina", nargs="*", default=None,
                        help="Facebook-pagina-zoektermen (standaard: politiegeweld)")
    parser.add_argument("--facebook-post", nargs="*", default=None,
                        help="Facebook-postenzoek; bezoekt post + auteurprofiel (gewone mensen)")
    parser.add_argument("--reacties", action="store_true",
                        help="Facebook-videopagina's openen; tekst/links als leads bewaren")
    parser.add_argument("--alleen-tiktok", action="store_true")
    parser.add_argument("--alleen-instagram", action="store_true")
    parser.add_argument("--alleen-facebook", action="store_true")
    args = parser.parse_args()

    kandidaten = laad_bestaand()
    print(f"bestaand: {len(kandidaten)}")

    if not args.alleen_instagram and not args.alleen_facebook:
        termen = args.tiktok if args.tiktok is not None else TIKTOK_STANDAARD
        kandidaten = tiktok_zoek(termen, kandidaten=kandidaten)
    if not args.alleen_tiktok and not args.alleen_facebook:
        tags = args.instagram if args.instagram is not None else IG_STANDAARD
        kandidaten = instagram_hashtags(tags, kandidaten=kandidaten)
    if not args.alleen_tiktok and not args.alleen_instagram:
        fb_termen = args.facebook if args.facebook is not None else FACEBOOK_STANDAARD
        kandidaten = facebook_zoek(fb_termen, kandidaten=kandidaten)

    if args.tiktok_account is not None:
        kandidaten = tiktok_accounts(args.tiktok_account or None, kandidaten=kandidaten)
    if args.instagram_profiel is not None:
        profielen = args.instagram_profiel or IG_PROFIELEN_STANDAARD
        kandidaten = instagram_profielen(profielen, kandidaten=kandidaten)
    if args.facebook_pagina is not None:
        pagina_termen = args.facebook_pagina or FACEBOOK_STANDAARD
        kandidaten = facebook_pagina_zoek(pagina_termen, kandidaten=kandidaten)
    if args.facebook_post is not None:
        post_termen = args.facebook_post or FACEBOOK_STANDAARD
        kandidaten = facebook_posts_zoek(post_termen, kandidaten=kandidaten)
    if args.reacties:
        reacties_mijnen(kandidaten)

    bewaar(kandidaten)


if __name__ == "__main__":
    main()
