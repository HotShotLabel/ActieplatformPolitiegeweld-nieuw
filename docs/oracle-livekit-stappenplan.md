# Stappenplan: eigen gratis streaming-server (Oracle Always Free)

Doel: LiveKit zelf draaien op een gratis Oracle-server, zodat mensen op de
site hun **eigen kanaal** kunnen starten. De huidige situatie (LiveKit Cloud
gratis) blijft gewoon draaien tot de nieuwe server bewezen werkt.

## 1. Wachten op het Oracle-account

Aanmelding is gedaan. Het account is binnen ~15 minuten klaar; er komt een
e-mail met instructies. Inloggen op cloud.oracle.com.

## 2. Server aanmaken (in de console)

- Compute -> Instances -> Create instance
- Naam: `actieplatform-live`
- Image: Canonical Ubuntu 24.04
- Shape: Change shape -> Ampere -> **VM.Standard.A1.Flex, 2 OCPU / 12 GB**
- Networking: publiek IPv4-adres aan
- SSH-sleutel: "Paste public keys" met:
  `ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIIMCqbfE3D4lJEPjYbKyM2FEnP2Zj3hK8ZSlg+yVhUfh actieplatform-live-server`
- Create (duurt 1-2 minuten)

Bij "Out of capacity": opnieuw proberen op een ander moment; Oracle heeft
soms geen ARM-capaciteit vrij in Amsterdam.

## 3. Poorten openzetten (Security List)

Networking -> Virtual Cloud Networks -> (jouw VCN) -> Security Lists ->
Default Security List -> Add Ingress Rules. Zes regels, bron 0.0.0.0/0:
poort 443/tcp, 80/tcp, 7881/tcp, 7882/udp, 3478/udp, 5349/tcp.

## 4. Ik neem het over (SSH)

Zodra het publieke IP bekend is:

    scp -i ~/.ssh/actieplatform_oracle scripts/server/livekit-installeren.sh ubuntu@<IP>:/tmp/
    ssh -i ~/.ssh/actieplatform_oracle ubuntu@<IP> \
      "sudo bash /tmp/livekit-installeren.sh live.<IP>.nip.io"

Het adres `live.<IP>.nip.io` wijst automatisch naar het IP (geen domein
nodig); Caddy regelt het gratis certificaat. Het script print de drie
sleutelwaarden.

## 5. Overstappen van de site (geen uitval)

1. Nieuwe waarden in Vercel zetten: LIVEKIT_URL, LIVEKIT_API_KEY,
   LIVEKIT_API_SECRET (productie + preview + development) en in .env.local
2. Pushen/herdeployen; daarna testen: uitzenden, kijken, chat, opname
3. Rollback als er iets misgaat: de drie waarden terugzetten naar
   LiveKit Cloud (2 minuten werk)

De oude cloud blijft dus als achtervang bestaan.

## 6. Daarna (site-werk)

- Meerdere kanalen op de site: hoofd-kanaal + ieder zijn eigen kanaal
- Per kanaal een eigen noodstop voor het beheer
- Capaciteit meten met de officiele load-tester (`lk load-test`) en de
  uitslag vastleggen in docs/live-op-schaal-onderzoek.md
