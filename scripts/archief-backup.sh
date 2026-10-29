#!/usr/bin/env bash
# Dagelijkse back-up: lokale analyse-JSON + publieke blob-JSON.
# Upload naar Internet Archive alleen als `ia` is ingelogd (ia configure).
set -euo pipefail
datum="$(date +%Y-%m-%d)"
map="$HOME/actieplatform-backups/$datum"
mkdir -p "$map"
cp "$HOME"/actieplatform-analyse/*.json "$map"/ 2>/dev/null || true
node --env-file="$HOME/actieplatform-nieuw/.env.local" "$HOME/actieplatform-nieuw/scripts/blob-export.mjs" "$map"
tar -czf "$HOME/actieplatform-backups/actieplatform-$datum.tar.gz" -C "$map" .
echo "lokaal: $HOME/actieplatform-backups/actieplatform-$datum.tar.gz"
if command -v ia >/dev/null 2>&1; then
  ia upload "actieplatform-$datum" "$HOME/actieplatform-backups/actieplatform-$datum.tar.gz" \
    --metadata="title:Actieplatform Politiegeweld back-up $datum" \
    --metadata="mediatype:data" || echo "Internet Archive-upload faalde; bestand blijft lokaal."
else
  echo "Internet Archive: installeer 'ia' (pipx install internetarchive), daarna 'ia configure' en dit script opnieuw."
fi
