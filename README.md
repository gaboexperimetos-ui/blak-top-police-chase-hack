# Blacktop Police Chase (Poki) — bypass recompensas + desbloqueo (local)

Herramientas locales para **Blacktop: Police Chase** en Poki (`https://poki.com/en/g/blacktop-police-chase`), probadas el **2026-11-08**:

- **Bypass de recompensas:** engancha `PokiSDK.rewardedBreak()` para resolver `success=true` sin ver el video (y salta `commercialBreak`). Funciona cuando el juego concede la recompensa del lado cliente vía el callback del Poki SDK.
- **Desbloqueo local (guardado en navegador):** parchea el guardado del juego en el frame `*.poki-gdn.com`.

> Nota: si un juego/red usa verificación de recompensas en servidor, el hook cliente puede no acreditar recompensas validadas por servidor. El progreso se guarda en el almacenamiento del **perfil/origen del navegador** donde se aplica.

## Guardado verificado (Blacktop: Police Chase)
- Origen/frame: `https://<uuid>.gdn.poki.com/.../index.html` (iframe del juego en Poki)
- LocalStorage key: **`Blacktop1_Save`** (JSON)
- Por defecto observado: `money:0, hiScore:0, unlockedCars:[{"x":0,"y":0},{"x":1,"y":0},{"x":7,"y":1}]`
- Parche aplicado/verificado: `money: 999999999`, `hiScore: 999999`, `unlockedCars`: **231** entradas cubriendo la grilla `x:0..20, y:0..10` (incluye `(0,0)` y `(20,10)`, supera los IDs observados).

## Uso rápido (Chromium, como perfil local verificado)
1. Usa la extensión desempaquetada en `extension/`.
2. Lanza Chromium con un perfil dedicado:
   ```bash
   chromium --user-data-dir=/tmp/opencode/chromium-poki-profile \
     --load-extension=./extension --no-first-run --no-default-browser-check \
     "https://poki.com/en/g/blacktop-police-chase"
   ```
   (ajusta rutas). O usa `launcher/jugar-blacktop-unlock.sh`.

## Zen/Firefox (persistente)
- Instala **Violentmonkey/Tampermonkey** (firmado) e importa `userscript/poki-reward-bypass.user.js`. Corre en `poki.com` y `*.poki-gdn.com` (`document-start`, `allFrames`) y auto-parchea `Blacktop1_Save` cuando existe.
- Alternativa puntual: F12 → Consola → selecciona el frame `*.poki-gdn.com` → pega `console/blacktop-unlock-console.js` → Enter → recarga.

## Bloqueadores
Si tus bloqueadores (navegador/DNS) impiden cargar el SDK/juego, permite como excepción mínima: `poki.com`, `*.poki.com`, `*.poki-gdn.com`, `*.poki-cdn.com`. El bypass lo hace el script, no el anuncio.

## Skill (OpenCode)
`skill/SKILL.md` es un skill de OpenCode con los pasos para repetir esto en **cualquier juego de Poki** (inspeccionar frame `poki-gdn`, encontrar la clave de guardado, parchear y verificar). Cópialo a `~/.config/opencode/skills/poki-reward-bypass/SKILL.md`.

## Contenido
- `userscript/poki-reward-bypass.user.js` — userscript (Tampermonkey/Violentmonkey)
- `extension/` — extensión MV3 desempaquetada (Chromium)
- `console/blacktop-unlock-console.js` — snippet para consola (frame `poki-gdn.com`)
- `launcher/` — script + `.desktop`
- `skill/SKILL.md` — skill OpenCode

## Aviso
Uso educativo/personal sobre tu propia sesión local. Respeta los términos del juego/plataforma.
