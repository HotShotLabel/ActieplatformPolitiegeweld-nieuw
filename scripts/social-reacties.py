#!/usr/bin/env python3
"""Reacties oogsten van TikTok, Instagram en Facebook met de eigen sessie.

Bewezen routes:
- TikTok: TikTokApi met msToken uit de Firefox-cookies (comments-endpoint).
- Instagram: headed Playwright (DISPLAY) met Firefox-cookies; reacties staan
  in de pagina na het openen van de post.
- Facebook: headed Playwright met cookies; videopagina's en openbare groepen.
- Facebook-groepen: geef --groep URL mee; alleen groepen waar je lid van bent
  of die openbaar zijn.

Resultaat: ~/actieplatform-analyse/social-reacties.json
"""

import argparse
import asyncio
import glob
import json
import os
import re
import sys
import time

BASIS = os.path.expanduser("~/actieplatform-analyse")
KANDIDATEN = os.path.join(BASIS, "social-kandidaten.json")
UIT = os.path.join(BASIS, "social-reacties.json")
DB = glob.glob(os.path.expanduser("~/.config/mozilla/firefox/*/cookies.sqlite"))
CHROME = os.path.expanduser(
    "~/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome"
)
UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
)

RUIS = (
    "vind-ik-leuks", "vind ik leuk", "antwoord", "bekijk alle",
    "meer opmerkingen", "opmerking plaatsen", "reageren", "delen",
    "zie meer", "vertaling bekijken", "origineel bekijken",
)


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


def bewaar(leads):
    os.makedirs(BASIS, exist_ok=True)
    with open(UIT, "w", encoding="utf-8") as bestand:
        json.dump(leads, bestand, ensure_ascii=False, indent=1)
    print(f"bewaard: {len(leads)} pagina's -> {UIT}")


def nette_regels(tekst):
    uit = []
    for regel in tekst.splitlines():
        regel = " ".join(regel.split())
        if not (15 <= len(regel) <= 220):
            continue
        laag = regel.lower()
        if any(ruis in laag for ruis in RUIS):
            continue
        uit.append(regel)
    return uit


async def tiktok_reacties(urls, aantal=10):
    from TikTokApi import TikTokApi

    try:
        import browser_cookie3
        jar = browser_cookie3.firefox(cookie_file=DB[0], domain_name="tiktok.com")
        ms = next((c.value for c in jar if c.name == "msToken"), None)
    except Exception:
        ms = None
    if not ms:
        print("[tiktok] geen msToken gevonden; log in bij TikTok.")
        return []

    resultaten = []
    async with TikTokApi() as api:
        await api.create_sessions(
            ms_tokens=[ms], num_sessions=1, sleep_after=3, headless=True
        )
        for url in urls:
            match = re.search(r"/video/(\d+)", url)
            if not match:
                continue
            try:
                video = api.video(id=match.group(1))
                reacties = []
                async for comment in video.comments(count=aantal):
                    tekst = " ".join((comment.text or "").split())
                    if not tekst:
                        continue
                    auteur = comment.author.username if comment.author else "?"
                    reacties.append(f"{auteur}: {tekst[:180]}")
                resultaten.append({"url": url, "platform": "tiktok", "reacties": reacties})
                print(f"[tiktok] {url[-40:]}: {len(reacties)} reacties")
            except Exception as fout:  # noqa: BLE001
                print(f"[tiktok] faalde {url[-40:]}: {str(fout)[:90]}")
            time.sleep(1.0)
    return resultaten


async def web_reacties(urls, platform, aantal_scrolls=3):
    from playwright.async_api import async_playwright

    resultaten = []
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            executable_path=CHROME, headless=False, args=["--no-sandbox"]
        )
        context = await browser.new_context(
            user_agent=UA, locale="nl-NL",
            viewport={"width": 1280, "height": 900},
        )
        await context.add_cookies(koekjes("facebook.com" if platform == "facebook" else "instagram.com"))
        pagina = await context.new_page()
        for url in urls:
            try:
                await pagina.goto(url, wait_until="domcontentloaded", timeout=60000)
                await pagina.wait_for_timeout(7000)
                for sel in (
                    'button:has-text("Alle reacties")',
                    'button:has-text("View all comments")',
                    'button:has-text("Bekijk alle")',
                ):
                    knop = pagina.locator(sel).first
                    if await knop.count():
                        try:
                            await knop.click(timeout=2500)
                        except Exception:
                            pass
                        break
                for _ in range(aantal_scrolls):
                    await pagina.mouse.wheel(0, 1400)
                    await pagina.wait_for_timeout(1200)
                tekst = await pagina.inner_text("body")
                regels = nette_regels(tekst)
                links = list({u.rstrip(".,)") for u in re.findall(r"https?://\S+", tekst)})
                resultaten.append({
                    "url": url,
                    "platform": platform,
                    "reacties": regels,
                    "links": links[:20],
                })
                print(f"[{platform}] {url[-40:]}: {len(regels)} regels, {len(links)} links")
            except Exception as fout:  # noqa: BLE001
                print(f"[{platform}] faalde {url[-40:]}: {str(fout)[:90]}")
            time.sleep(1.0)
        await browser.close()
    return resultaten


async def facebook_groep(url, aantal_scrolls=4):
    return await web_reacties([url], "facebook", aantal_scrolls)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--tiktok", nargs="*", default=None,
                        help="TikTok-video-URLs (standaard: uit kandidaten, max 3)")
    parser.add_argument("--instagram", nargs="*", default=None,
                        help="Instagram-post-URLs (standaard: uit kandidaten, max 3)")
    parser.add_argument("--facebook", nargs="*", default=None,
                        help="Facebook-video-URLs (standaard: uit kandidaten, max 3)")
    parser.add_argument("--groep", nargs="*", default=None,
                        help="Facebook-groep-URL's om posten/reacties te lezen")
    parser.add_argument("--max", type=int, default=3)
    args = parser.parse_args()

    kandidaten = []
    if os.path.exists(KANDIDATEN):
        kandidaten = json.load(open(KANDIDATEN, encoding="utf-8"))

    tiktok = args.tiktok if args.tiktok is not None else [
        item["url"] for item in kandidaten
        if item["bron"] == "TikTok-oogst" and "/video/" in item["url"]
    ][:args.max]
    instagram = args.instagram if args.instagram is not None else [
        item["url"] for item in kandidaten
        if item["bron"] == "Instagram-oogst"
    ][:args.max]
    facebook = args.facebook if args.facebook is not None else [
        item["url"] for item in kandidaten
        if item["bron"] == "Facebook-oogst"
    ][:args.max]

    leads = []
    if tiktok:
        leads += asyncio.run(tiktok_reacties(tiktok))
    if instagram:
        leads += asyncio.run(web_reacties(instagram, "instagram"))
    if facebook:
        leads += asyncio.run(web_reacties(facebook, "facebook"))
    if args.groep:
        leads += asyncio.run(facebook_groep(args.groep[0]))

    if leads:
        bewaar(leads)
    else:
        print("geen leads")


if __name__ == "__main__":
    main()
