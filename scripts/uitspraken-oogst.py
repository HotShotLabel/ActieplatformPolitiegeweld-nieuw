#!/usr/bin/env python3
"""Oogst uitspraken over politiebetrokkenheid voor /uitspraken.

Twee stappen:
1. Zoeken via de publieke zoek-API van uitspraken.rechtspraak.nl (/api/zoek).
2. Per ECLI de officiële tekst ophalen via de Open Data van rechtspraak.nl
   (data.rechtspraak.nl) en daar de metadata en de inhoudsindicatie uit halen.

Schrijft src/lib/uitspraken-bulk.ts. De curated entries in uitspraken.ts
blijven staan; deze generator vult de bulk aan.

Gebruik:
    python3 scripts/uitspraken-oogst.py

Vriendelijk gebruik: kleine pauzes tussen verzoeken, alleen de officiële
publieke endpoints, geen persoonsgegevens (uitspraken zijn gepseudonimiseerd).
"""

import html
import json
import pathlib
import re
import sys
import time
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
from datetime import date

WORTEL = pathlib.Path(__file__).resolve().parent.parent
ZOEK_URL = "https://uitspraken.rechtspraak.nl/api/zoek"
CONTENT_URL = "https://data.rechtspraak.nl/uitspraken/content?id={ecli}"
UA = "ActieplatformPolitiegeweld-oogst/1.0 (+https://actieplatform-politiegeweld-nieuw.vercel.app)"

# (categorie, zoektermen). De categorie geeft de hoofdvraag van de groep aan.
GROEPEN = [
    ("beklag-12sv", ["artikel 12 Sv politie", "beklag politiegeweld"]),
    ("civiel", ["politie aansprakelijk geweld", "onrechtmatige daad politie"]),
    (
        "agent-vervolgd",
        [
            "rijksrecherche politie mishandeling",
            "verdachte politieambtenaar mishandeling",
            "politieambtenaar doodslag",
            "politieagent doodslag",
            "politieambtenaar verkrachting",
            "politieagent verkrachting",
            "politieambtenaar moord",
            "oud-politieagent geweld",
            "verdachte politieagent schietincident",
        ],
    ),
    (
        "geweld-tegen-politie",
        [
            "mishandeling politieambtenaar",
            "geweld tegen politieagent",
            "wederspannigheid politieagent",
            "politieagent geslagen",
        ],
    ),
]

PER_TERM = 30          # resultaten per zoekterm (relevantie-sortering)
MAX_DOWNLOADS = 420    # maximaal aantal teksten ophalen
MAX_ENTRIES = 230      # maximaal aantal entries in de bulk
PAUZE_ZOEK = 0.6
PAUZE_DOWNLOAD = 0.35


def zoek(term, start):
    criteria = {
        "StartRow": start,
        "PageSize": PER_TERM,
        "ShouldReturnHighlights": True,
        "ShouldCountFacets": False,
        "SortOrder": "Relevance",
        "SearchTerms": [{"Term": term, "Field": "AlleVelden"}],
        "Contentsoorten": [],
        "Rechtsgebieden": [],
        "Instanties": [],
        "DatumPublicatie": [],
        "DatumUitspraak": [],
        "Advanced": {"PublicatieStatus": "AlleenGepubliceerd"},
        "CorrelationId": f"oogst-{abs(hash(term)) % 10**8}",
        "Proceduresoorten": [],
    }
    verzoek = urllib.request.Request(
        ZOEK_URL,
        data=json.dumps(criteria).encode(),
        headers={
            "Content-Type": "application/json",
            "Accept": "application/json",
            "User-Agent": UA,
        },
        method="POST",
    )
    with urllib.request.urlopen(verzoek, timeout=60) as antwoord:
        return json.load(antwoord)


def haal_xml(ecli):
    verzoek = urllib.request.Request(
        CONTENT_URL.format(ecli=urllib.parse.quote(ecli)),
        headers={"User-Agent": UA},
    )
    with urllib.request.urlopen(verzoek, timeout=60) as antwoord:
        return antwoord.read().decode("utf-8", errors="replace")


def veld(xml, patroon):
    treffer = re.search(patroon, xml, re.S)
    if not treffer:
        return ""
    tekst = re.sub(r"<[^>]+>", " ", treffer.group(1))
    return re.sub(r"\s+", " ", html.unescape(tekst)).strip()


def zonder_accenten(tekst):
    return unicodedata.normalize("NFD", tekst).encode("ascii", "ignore").decode()


def classificeer(samenvatting):
    """Bepaal de categorie uit de officiële inhoudsindicatie.

    Geeft None terug voor ruis (geen politiebetrokkenheid of procedurele
    schadevergoedingszaken).
    """
    t = zonder_accenten(samenvatting.lower())

    if not re.search(r"politie|verbalisant|agent|wederspannigheid", t):
        return None
    if "591a sv" in t or "rekestenprocedure" in t:
        return None

    p = r"politie(ambtenaren|ambtenaar|agenten|agent)|verbalisant|agenten"

    # beklag bij het gerechtshof (artikel 12 Sv)
    if (
        re.search(r"12\s*sv", t)
        or "klaagschrift" in t
        or "artikel 12 van het wetboek van strafvordering" in t
        or ("beklag" in t and "vervolg" in t)
        or ("bevel" in t and "vervolging" in t and "politie" in t)
        or ("politiegeweld" in t and ("beklag" in t or "klacht" in t))
    ):
        return "beklag-12sv"

    # civiele aansprakelijkheidszaken
    if any(
        kern in t
        for kern in [
            "aansprakelijk",
            "onrechtmatige daad",
            "onrechtmatige overheidsdaad",
            "overheidsaansprakelijkheid",
            "letselschade",
            "deelgeschil",
        ]
    ) and "benadeelde partij" not in t:
        return "civiel"

    # strafzaken tegen politieambtenaren (politie als verdachte)
    if re.search(r"meineed|vals proces|valse proces|vals opmaken", t) and re.search(
        r"politie|verbalisant", t
    ):
        return "agent-vervolgd"
    if "rijksrecherche" in t and "politie" in t:
        return "agent-vervolgd"
    if re.search(
        r"geweldsinstructie[^.]{0,60}(geschonden|schending)"
        r"|(schending|geschonden)[^.]{0,60}geweldsinstructie",
        t,
    ):
        return "agent-vervolgd"
    if re.search(
        r"verdachte politieambtenaar|politieambtenaar\) heeft|politie-ambtenaar"
        r"|vrijspraak politieagent|politieambtenaar vrijgesproken"
        r"|verdenking dat een politie|door (toenmalige )?politieambtenaar",
        t,
    ):
        return "agent-vervolgd"

    # geweld tegen politie (politie als slachtoffer)
    if "wederspannigheid" in t:
        return "geweld-tegen-politie"
    if "openlijk" in t and "geweld" in t and re.search(p, t):
        return "geweld-tegen-politie"
    if re.search(r"beledig\w* [^.]{0,20}(politie|ambtenaar)", t):
        return "geweld-tegen-politie"
    if re.search(r"(tegen|op) (de )?politie(agent|ambtenaar)?", t):
        return "geweld-tegen-politie"
    if re.search(r"richting (de )?politie", t):
        return "geweld-tegen-politie"
    if re.search(r"bedreig\w* van de politie", t):
        return "geweld-tegen-politie"
    if re.search(
        r"(mishandel\w*|geslagen|slaan|bedreig\w*|gestoken|geschop\w*|geschoten"
        r"|verzet|tegengewerkt|bespuug\w*|inrijden|aangereden|neergeschoten)"
        rf"[^.]{{0,80}}{p}",
        t,
    ):
        return "geweld-tegen-politie"
    if re.search(
        rf"{p}[^.]{{0,80}}(mishandel\w*|geslagen|bedreig\w*|gestoken|geschop\w*"
        r"|geschoten|verzet|tegengewerkt|aangereden|gespoten)",
        t,
    ):
        return "geweld-tegen-politie"

    return "overig"


def uit_xml(xml):
    return {
        "ecli": veld(xml, r"<dcterms:identifier>(.*?)</dcterms:identifier>"),
        "instantie": veld(xml, r"<dcterms:creator[^>]*>(.*?)</dcterms:creator>"),
        "datum": veld(
            xml, r'<dcterms:date rdfs:label="Uitspraakdatum">(.*?)</dcterms:date>'
        ),
        "zaaknummer": veld(xml, r"<psi:zaaknummer[^>]*>(.*?)</psi:zaaknummer>"),
        "inhoudsindicatie": veld(
            xml, r"<inhoudsindicatie[^>]*>(.*?)</inhoudsindicatie>"
        ),
    }


def kort(tekst, maximum):
    tekst = tekst.strip()
    if len(tekst) <= maximum:
        return tekst
    geknipt = tekst[:maximum]
    for scheiding in [". ", "; ", ", "]:
        positie = geknipt.rfind(scheiding)
        if positie > maximum * 0.55:
            return geknipt[: positie + 1].strip()
    positie = geknipt.rfind(" ")
    return geknipt[:positie].strip() + "…"


def lees_curated_eclis():
    bestand = WORTEL / "src/lib/uitspraken.ts"
    if not bestand.exists():
        return set()
    return set(re.findall(r"ECLI:NL:[A-Z0-9:]+", bestand.read_text()))


def hoofdletter_eerste(zin):
    return zin[:1].upper() + zin[1:] if zin else zin


def main():
    curated = lees_curated_eclis()
    kandidaten = {}
    for _groep, termen in GROEPEN:
        for term in termen:
            try:
                data = zoek(term, 0)
            except urllib.error.HTTPError as fout:
                print(f"zoekfout voor '{term}': {fout}", file=sys.stderr)
                time.sleep(2)
                continue
            gevonden = 0
            for resultaat in data.get("Results", []):
                ecli = resultaat.get("TitelEmphasis") or ""
                if not ecli.startswith("ECLI:"):
                    continue
                if resultaat.get("GerechtelijkProductType") != "uitspraak":
                    continue
                if resultaat.get("IsInactief"):
                    continue
                if ecli in curated or ecli in kandidaten:
                    continue
                kandidaten[ecli] = {
                    "zoekdatum": resultaat.get("Uitspraakdatum", ""),
                }
                gevonden += 1
            print(f"{term!r}: {gevonden} nieuwe kandidaten (totaal {len(kandidaten)})")
            time.sleep(PAUZE_ZOEK)

    # nieuwste eerst, en dan de teksten ophalen
    gesorteerd = sorted(
        kandidaten.items(),
        key=lambda paar: paar[1]["zoekdatum"],
        reverse=True,
    )[:MAX_DOWNLOADS]

    entries = []
    overgeslagen = 0
    for index, (ecli, _info) in enumerate(gesorteerd, start=1):
        try:
            xml = haal_xml(ecli)
        except Exception as fout:  # noqa: BLE001
            print(f"  overgeslagen {ecli}: {fout}", file=sys.stderr)
            continue
        meta = uit_xml(xml)
        ind = meta["inhoudsindicatie"]
        if not ind or ind == "-":
            continue
        if not meta["datum"]:
            continue
        categorie = classificeer(ind)
        if categorie is None:
            overgeslagen += 1
            continue
        entries.append(
            {
                "ecli": ecli,
                "titel": hoofdletter_eerste(kort(ind, 110)),
                "instantie": meta["instantie"],
                "datum": meta["datum"],
                "zaaknummer": meta["zaaknummer"],
                "categorie": categorie,
                "samenvatting": kort(ind, 420),
            }
        )
        if index % 25 == 0:
            print(f"  {index}/{len(gesorteerd)} opgehaald…")
        time.sleep(PAUZE_DOWNLOAD)

    print(f"ruis overgeslagen: {overgeslagen}")

    entries.sort(key=lambda item: item["datum"], reverse=True)
    entries = entries[:MAX_ENTRIES]

    uit = WORTEL / "src/lib/uitspraken-bulk.ts"
    regels = [
        'import type { Uitspraak } from "./uitspraken";',
        "",
        f"// Automatisch gegenereerd door scripts/uitspraken-oogst.py op {date.today().isoformat()}.",
        "// Samenvattingen zijn de officiële inhoudsindicaties van rechtspraak.nl.",
        "export const UITSPRAKEN_BULK: Uitspraak[] = [",
    ]
    for entry in entries:
        regels.append("  {")
        for sleutel in [
            "ecli",
            "titel",
            "instantie",
            "datum",
            "zaaknummer",
            "categorie",
        ]:
            regels.append(f"    {sleutel}: {json.dumps(entry[sleutel], ensure_ascii=False)},")
        regels.append(
            f"    samenvatting: {json.dumps(entry['samenvatting'], ensure_ascii=False)},"
        )
        regels.append('    samenvattingBron: "inhoudsindicatie",')
        regels.append("  },")
    regels.append("];")
    uit.write_text("\n".join(regels) + "\n", encoding="utf-8")

    print(f"klaar: {len(entries)} entries in {uit.relative_to(WORTEL)}")


if __name__ == "__main__":
    main()
