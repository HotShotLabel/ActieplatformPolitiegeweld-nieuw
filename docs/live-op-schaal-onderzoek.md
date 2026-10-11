# Onderzoek: live met velen tegelijk (50+ plekken), zo goedkoop mogelijk

Datum: 11 oktober 2026. Alle cijfers komen uit primaire bronnen, hieronder met link.

## De vraag

Als er opeens op 50 plekken iets gebeurt, moet iedereen live kunnen. Ons huidige
kanaal (LiveKit Cloud gratis) kan dat niet: maximaal 100 mensen tegelijk en
5.000 kijkers-minuten per maand.

## Harde feiten (gemeten, met bron)

### LiveKit Cloud (huidige motor)

| Plan | Prijs | WebRTC-minuten | Gelijktijdig | Data |
|---|---|---|---|---|
| Build (nu) | $0 | 5.000 | 100 | 50 GB |
| Ship | $50/mnd | 150.000 | 1.000 | 250 GB, dan $0.12/GB |
| Scale | $500/mnd | 1.5 miljoen | 5.000 | 3 TB |

Bron: livekit.com/pricing.md en docs.livekit.io/deploy/admin/quotas-and-limits (beide gelezen 11-10-2026).

Rekensom Ship: 50 uitzenders × 30 min × (1 zender + 3 kijkers) = 6.000 minuten
per golf. 150.000 minuten = 25 zulke golven per maand. Dat past ruim.

### LiveKit zelf hosten (open source)

- Licentie: **Apache 2.0** (bron: github.com/livekit/livekit/LICENSE). Gratis, ook commercieel.
- Officiele deployment op 1 VM: Docker Compose + Caddy, TURN/TLS inbegrepen
  (bron: docs.livekit.io/transport/self-hosting/vm). Eisen: een eigen domein
  voor TLS (gratis truc: nip.io/sslip.io subdomein).
- Capaciteit: gebonden aan CPU en bandbreedte. Benchmark op 16 cores
  (c2-standard-16): 150 zenders + 150 kijkers tegelijk op 85% CPU; livestream
  1 zender + 3.000 kijkers op 92%. Per kern ruwweg 10-19 deelnemers.
  (bron: docs.livekit.io/transport/self-hosting/benchmark)
- Max per kamer zelf gehost: ~3.000 gebruikers. Meerdere kamers op 1 node kan;
  een kamer past op 1 node (bron: docs.livekit.io/transport/self-hosting/).
- Onze site werkt hier zonder herbouw: alleen LIVEKIT_URL + 2 sleutels wisselen
  en de "een uitzender tegelijk"-regel verruimen naar meerdere kamers.

### Goedkope/gratis machines voor de zelfhost

| Machine | Prijs | Specificaties | Data inbegrepen |
|---|---|---|---|
| Oracle Always Free (Ampere A1) | €0 | 2 OCPU / 12 GB ARM | 10 TB/mnd |
| Hetzner CX22 | €4,49/mnd | 2 vCPU / 4 GB | 20 TB/mnd (EU) |
| Hetzner CAX21 (ARM) | €6,49/mnd | 4 vCPU / 8 GB | 20 TB/mnd (EU) |

Bronnen: docs.oracle.com Always Free Resources (bijgewerkt juli 2026: 2 OCPU/12 GB,
10 TB uitgaand), community.oracle.com (wijziging 21-07-2026), hetzner.com/cloud,
usehcm.com/hetzner-pricing/cx22, cloudcostly.com/provider/hetzner.

Bandbreedte-rekensom: 1 kijker op 1 Mbps = ~0,45 GB per uur. 20 TB = ruwweg
44.000 kijkuren. Bij 10 TB (Oracle): ~22.000 kijkuren. Kortom: data is niet de grens.

### Wat de grens dan wel is

- **CPU van de machine** bij zelfhost. Schatting op basis van de benchmark:
  2 vCPU ARM: ~10-25 gelijktijdige streams; 4 vCPU ARM: ~25-50.
  Dit is een schatting; definitief maken met de officiele load-tester
  (`lk load-test`, bron: docs.livekit.io/transport/self-hosting/benchmark).
- **Moderatie**: meer kanalen = meer toezicht. Noodstop per kanaal nodig.

### Andere routes (voor de volledigheid)

- **Cloudflare Realtime (SFU/TURN)**: eerste 1.000 GB/mnd gratis, dan $0.05/GB.
  Rauwe bouwstenen; eigen signaal/room-laag nodig. Meer werk, geen kant-en-klare oplossing.
  (bron: developers.cloudflare.com/realtime/sfu/pricing)
- **Agora**: 10.000 gratis standaardminuten/mnd (video HD telt 4x, dus ~2.500
  videominuten); daarna $45,99/mnd voor 50.000 minuten.
  (bron: agora.io/en/pricing + docs.agora.io)
- **Daily.co**: 10.000 gratis deelnemerminuten/mnd; daarna $0,004/min; tot
  100.000 gelijktijdige sessies met kaart op het account; SDK-bouw nodig.
  (bron: daily.co/pricing/video-sdk)
- **Jitsi meet.jit.si (gratis publiek)**: sinds 9 oktober 2026 max 95 minuten per
  vergadering; de eerste persoon moet inloggen (Google/GitHub/Facebook);
  insluiten op andere sites beperkt tot 5-minuten-demo's. Niet geschikt voor ons.
  Zelf gehoste Jitsi heeft geen limieten, maar dan beheer je zelf een server.
  (bron: jitsi.org/blog/changes-coming + jitsi.help + jitsi.org/blog/authentication-on-meet-jit-si)
- **Externe kanalen**: mensen met TikTok/YouTube/Instagram gaan daar live;
  wij tonen de links. Kost niets, schaalt oneindig.

## Conclusie

Twee werkende routes naar 50+ gelijktijdige uitzendingen:

1. **Zelf hosten (aanrader voor "zo gratis mogelijk")**: Hetzner ARM €6,49/mnd
   of Oracle gratis (kleiner). Onze code blijft, 1 dag werk, capaciteit meten
   met de load-tester. Data-ruimte: tienduizenden kijkuren.
2. **LiveKit Ship $50/mnd**: nul onderhoud, 1.000 mensen tegelijk, 150.000
   minuten. Werkt direct met onze bestaande sleutels.

Daarnaast altijd: externe live-links verzamelen op de site + directe
video-insturing, want die schalen zonder enige technische grens.
