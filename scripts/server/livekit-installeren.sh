#!/usr/bin/env bash
# Installeert de LiveKit-streamingserver op een schone Ubuntu-VM (Oracle
# Always Free, ARM). Gebruik:
#
#   sudo bash livekit-installeren.sh live.<IP>.nip.io
#
# Daarna print het script de drie waarden voor de site (URL, sleutel, geheim).

set -euo pipefail

HOST="${1:-}"
if [ -z "$HOST" ]; then
  echo "Gebruik: sudo bash livekit-installeren.sh <hostnaam, bijv. live.1.2.3.4.nip.io>"
  exit 1
fi

echo "== 1/6 Docker installeren =="
if ! command -v docker > /dev/null; then
  curl -fsSL https://get.docker.com | sh
fi

echo "== 2/6 Sleutels genereren =="
API_KEY="APItr$(openssl rand -hex 6)"
API_SECRET="$(openssl rand -hex 24)"

echo "== 3/6 Configuratie schrijven naar /opt/livekit =="
mkdir -p /opt/livekit
cd /opt/livekit

cat > livekit.yaml <<EOF
port: 7880
rtc:
  tcp_port: 7881
  udp_port: 7882
  use_external_ip: true
  enable_loopback_candidate: false
keys:
  ${API_KEY}: ${API_SECRET}
turn:
  enabled: true
  domain: ${HOST}
  tls_port: 5349
  udp_port: 3478
  external_tls: true
logging:
  level: info
EOF

cat > Caddyfile <<EOF
${HOST} {
  reverse_proxy 127.0.0.1:7880
}
EOF

cat > docker-compose.yml <<'EOF'
services:
  caddy:
    image: caddy:2
    restart: unless-stopped
    network_mode: host
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
    depends_on:
      - livekit
  livekit:
    image: livekit/livekit-server:latest
    restart: unless-stopped
    network_mode: host
    command: --config /etc/livekit.yaml
    volumes:
      - ./livekit.yaml:/etc/livekit.yaml
volumes:
  caddy_data:
EOF

echo "== 4/6 Poorten openzetten in de VM (naast SSH) =="
# Oracle Ubuntu-images hebben eigen iptables-regels; deze toevoegen en bewaren.
for regel in \
  "-p tcp --dport 80 -j ACCEPT" \
  "-p tcp --dport 443 -j ACCEPT" \
  "-p tcp --dport 7881 -j ACCEPT" \
  "-p udp --dport 7882 -j ACCEPT" \
  "-p udp --dport 3478 -j ACCEPT" \
  "-p tcp --dport 5349 -j ACCEPT"; do
  # shellcheck disable=SC2086
  iptables -C INPUT $regel 2>/dev/null || iptables -I INPUT 1 $regel
done
if command -v netfilter-persistent > /dev/null; then
  netfilter-persistent save
else
  mkdir -p /etc/iptables
  iptables-save > /etc/iptables/rules.v4
fi

echo "== 5/6 Starten =="
docker compose up -d

echo "== 6/6 Controleren =="
sleep 5
if curl -sf "http://127.0.0.1:7880" > /dev/null || curl -s -o /dev/null "http://127.0.0.1:7880"; then
  echo "LiveKit antwoordt lokaal. Caddy haalt nu het certificaat op (kan 1 minuut duren)."
else
  echo "LET OP: LiveKit antwoordt nog niet; bekijk: docker compose logs livekit"
fi

echo
echo "================ KLAAR ================"
echo "Zet deze drie waarden in de site (Vercel -> Environment Variables):"
echo "LIVEKIT_URL=wss://${HOST}"
echo "LIVEKIT_API_KEY=${API_KEY}"
echo "LIVEKIT_API_SECRET=${API_SECRET}"
echo "======================================="
