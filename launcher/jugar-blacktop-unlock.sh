#!/usr/bin/env bash
# Acceso rápido: abre Blacktop Police Chase en Chromium con bypass de recompensas + vehículos/dinero desbloqueados (perfil local verificado)
PROFILE="/tmp/opencode/chromium-poki-profile"
EXT="/tmp/opencode/poki-ext"
URL="https://poki.com/en/g/blacktop-police-chase"
if [ ! -d "$EXT" ]; then
  # fallback: copiar desde el paquete local si /tmp se limpió
  if [ -d "$HOME/blacktop-unlock-local/poki-ext" ]; then EXT="$HOME/blacktop-unlock-local/poki-ext"; fi
fi
mkdir -p "$PROFILE"
exec /usr/bin/chromium --user-data-dir="$PROFILE" --load-extension="$EXT" --no-first-run --no-default-browser-check "$URL"
