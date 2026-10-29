#!/usr/bin/env python3
"""Ontdek video's zonder duidelijke titel/tags via hun reacties.

Route:
1. Brede TikTok-zoekopdrachten (politie nederland, politie controle, steden).
2. Van elk resultaat de reacties ophalen (TikTokApi + msToken).
3. Video's met een zwakke titel maar politiegeweld-taal in de reacties
   worden alsnog kandidaat, met het bewijs uit de reacties erbij.
4. Links naar andere video's/posts in de reacties worden nieuwe kandidaten.

Resultaat: social-kandidaten.json (aangevuld) + social-reactiebewijs.json
"""

import asyncio
import glob
import json
import os
import re
import sqlite3
import time

BASIS = os.path.expanduser("~/actieplatform-analyse")
KANDIDATEN = os.path.join(BASIS, "social-kandidaten.json")
BEWIJS = os.path.join(BASIS, "social-reactiebewijs.json")
def _kies_cookie_db():
    """Kies het Firefox-profiel met de meeste geldige cookies voor de
    drie platforms. Firefox houdt de DB op slot; lees een tijdelijke kopie."""
    import shutil
    import tempfile

    paden = glob.glob(os.path.expanduser("~/.config/mozilla/firefox/*/cookies.sqlite"))
    beste, score = None, -1
    for pad in paden:
        try:
            tmp = os.path.join(tempfile.gettempdir(), "ff-cookies-" + str(abs(hash(pad))) + ".sqlite")
            shutil.copy2(pad, tmp)
            for ext in ("-wal", "-shm"):
                if os.path.exists(pad + ext):
                    shutil.copy2(pad + ext, tmp + ext)
            con = sqlite3.connect(tmp)
            n = con.execute(
                "select count(*) from moz_cookies where host like '%tiktok.com%' "
                "or host like '%instagram.com%' or host like '%facebook.com%'"
            ).fetchone()[0]
            con.close()
        except Exception:
            continue
        if n > score:
            beste, score = tmp, n
    return beste or (paden[0] if paden else "")

DB = _kies_cookie_db()
CHROME = os.path.expanduser(
    "~/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome"
)
UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
)

BREED = [
    "politie nederland",
    "politie controle nederland",
    "politie aanhouding nederland",
    "politie amsterdam",
    "politie rotterdam",
    "politie utrecht",
    "politie den haag",
    "politie eindhoven",
    "politie groningen",
    "agent nederland",
    "politie straat",
    "politie geweld",
]

# Alleen gewelds-/machtswoorden gelden als bewijs; "politie"/"agent" alleen
# is te zwak (elke politiepost heeft dat in de reacties).
GEWELD = [
    "geweld", "mishandel", "slaat", "sloeg", "geslagen", "schopt", "schopte",
    "trapt", "trapte", "duwt", "duwde", "sleurt", "sleurde", "wurg",
    "nekklem", "taser", "wapenstok", "pepperspray", "arrestat", "aanhoud",
    "profiler", "discrimin", "racisme", "stopformulier", "klacht", "aangifte",
    "overleden", "dood", "natrap", "knijpt", "brak",
]
NL = [
    "nederland", "amsterdam", "rotterdam", "den haag", "utrecht", "eindhoven",
    "groningen", "tilburg", "almere", "breda", "nijmegen", "apeldoorn",
    "haarlem", "arnhem", "enschede", "amersfoort", "zaanstad", "den bosch",
    "zwolle", "leiden", "maastricht", "dordrecht", "zoetermeer", "deventer",
    "delft", "alkmaar", "venlo", "hilversum", "heerlen", "lelystad", "gouda",
    "emmen", "assen", "middelburg", "vlissingen", "spijkenisse", "twente",
    "friesland", "limburg", "brabant", "gelderland", "overijssel", "drenthe",
    "zeeland", "flevoland", "noord-holland", "zuid-holland",
]
BUITEN = [
    "belgië", "belgie", "brussel", "antwerpen", "vlaanderen", "frankrijk",
    "duitsland", "verenigd koninkrijk", "spanje", "italië", "suriname",
    "curaçao", "aruba", "verenigde staten", "amerika", "canada", "oekraïne",
    "rusland", "vrt", "hln",
]


def nl(tekst):
    laag = tekst.lower()
    if any(w in laag for w in BUITEN):
        return False
    return any(w in laag for w in NL)


def bewaar(kandidaten):
    os.makedirs(BASIS, exist_ok=True)
    with open(KANDIDATEN, "w", encoding="utf-8") as bestand:
        json.dump(list(kandidaten.values()), bestand, ensure_ascii=False, indent=1)
    print(f"bewaard: {len(kandidaten)} kandidaten -> {KANDIDATEN}")


def koekjes(domein):
    import browser_cookie3

    jar = browser_cookie3.firefox(cookie_file=DB, domain_name=domein)
    uit = []
    for c in jar:
        try:
            ruw = int(c.expires) if c.expires else 0
        except (TypeError, ValueError):
            ruw = 0
        expires = -1 if ruw <= 0 else (ruw // 1000 if ruw > 10**12 else ruw)
        uit.append({
            "name": c.name, "value": c.value,
            "domain": c.domain if c.domain.startswith(".") else "." + c.domain,
            "path": c.path or "/", "secure": bool(c.secure),
            "httpOnly": False, "expires": expires,
        })
    return uit


def tiktok_breed(termen):
    from playwright.async_api import async_playwright

    resultaten = {}

    async def run():
        async with async_playwright() as p:
            browser = await p.chromium.launch(
                executable_path=CHROME, headless=True, args=["--no-sandbox"]
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
                    for _ in range(2):
                        await pagina.mouse.wheel(0, 1400)
                        await pagina.wait_for_timeout(1500)
                    rijen = await pagina.eval_on_selector_all(
                        'a[href*="/video/"]',
                        """els => [...new Map(els.map(e => [e.href.split('?')[0], {
                            href: e.href.split('?')[0],
                            alt: (e.querySelector('img')?.alt || '').slice(0, 260)
                        }])).values()]""",
                    )
                    nieuw = 0
                    for rij in rijen:
                        url = rij["href"]
                        if url in resultaten:
                            continue
                        resultaten[url] = {
                            "url": url,
                            "titel": " ".join((rij["alt"] or "").split())[:150],
                            "term": term,
                        }
                        nieuw += 1
                    print(f"[breed] {term!r}: {len(rijen)} links, {nieuw} nieuw")
                except Exception as fout:  # noqa: BLE001
                    print(f"[breed] {term!r} faalde: {str(fout)[:90]}")
                time.sleep(1.5)
            await browser.close()

    asyncio.run(run())
    return resultaten


async def check_reacties(rijen, kandidaten, maximaal=20):
    from TikTokApi import TikTokApi
    import browser_cookie3

    jar = browser_cookie3.firefox(cookie_file=DB, domain_name="tiktok.com")
    ms = next((c.value for c in jar if c.name == "msToken"), None)
    if not ms:
        print("geen msToken; log in bij TikTok.")
        return []

    bewijs = []
    async with TikTokApi() as api:
        await api.create_sessions(
            ms_tokens=[ms], num_sessions=1, sleep_after=3, headless=True
        )
        for url, info in list(rijen.items())[:maximaal]:
            match = re.search(r"/video/(\d+)", url)
            if not match:
                continue
            try:
                video = api.video(id=match.group(1))
                reacties = []
                async for comment in video.comments(count=25):
                    tekst = " ".join((comment.text or "").split())
                    if tekst:
                        reacties.append(tekst)
            except Exception as fout:  # noqa: BLE001
                print(f"[reacties] faalde {url[-30:]}: {str(fout)[:80]}")
                continue

            geheel = " ".join([info["titel"]] + reacties)
            if not any(w in geheel.lower() for w in GEWELD):
                print(f"[reacties] {url[-30:]}: geen geweldstaal")
                continue
            if not nl(geheel):
                print(f"[reacties] {url[-30:]}: geen NL-marker")
                continue

            treffer = [r for r in reacties if any(w in r.lower() for w in GEWELD)]
            if not treffer:
                print(f"[reacties] {url[-30:]}: geweld alleen in titel, niet in reacties")
                continue
            bewijs.append({
                "url": url,
                "titel": info["titel"],
                "term": info["term"],
                "zoektermen": info["term"],
                "reacties": treffer[:10],
            })
            kandidaten[url] = {
                "url": url,
                "titel": info["titel"] or f"TikTok (via reacties): {info['term']}",
                "toelichting": f"Ontdekt via reacties op zoekterm {info['term']}",
                "plaats": "",
                "datum": "",
                "bron": "TikTok-oogst",
            }
            print(f"[reacties] NIEUW {url[-30:]}: {len(treffer)} bewijsregels")

            # Links uit reacties als nieuwe kandidaten
            for tekst in reacties:
                for link in re.findall(r"https?://\S+", tekst):
                    link = link.rstrip(".,)")
                    if "tiktok.com" in link and "/video/" in link and link not in kandidaten:
                        kandidaten[link] = {
                            "url": link,
                            "titel": "TikTok (link uit reactie)",
                            "toelichting": "Gevonden in een reactie",
                            "plaats": "",
                            "datum": "",
                            "bron": "TikTok-oogst",
                        }
            time.sleep(0.8)
    return bewijs


def main():
    kandidaten = {}
    if os.path.exists(KANDIDATEN):
        kandidaten = {item["url"]: item for item in json.load(open(KANDIDATEN, encoding="utf-8"))}
    print(f"bestaand: {len(kandidaten)}")

    rijen = tiktok_breed(BREED)
    print(f"brede zoekresultaten: {len(rijen)}")
    bewijs = asyncio.run(check_reacties(rijen, kandidaten, maximaal=20))
    bewaar(kandidaten)
    with open(BEWIJS, "w", encoding="utf-8") as bestand:
        json.dump(bewijs, bestand, ensure_ascii=False, indent=1)
    print(f"bewijs: {len(bewijs)} video's met reactie-bewijs -> {BEWIJS}")


if __name__ == "__main__":
    main()
