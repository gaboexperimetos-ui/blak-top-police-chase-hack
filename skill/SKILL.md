---
name: poki-reward-bypass
description: Bypass rewarded/commercial ads and unlock progress in Poki web games by hooking PokiSDK and (when saves are local) patching the game's save in the poki-gdn.com iframe. Use when the user wants rewards without watching videos, has ad blockers breaking rewards, or wants to unlock cars/items/money in a Poki game (e.g. Blacktop Police Chase). Covers any Poki game: identify the game, install a userscript/extension, inspect the poki-gdn frame localStorage/IndexedDB for save keys, patch safely, verify, and create a quick-launch Chromium profile.
user-invocable: true
metadata:
  version: "1"
  verified_on:
    - "Blacktop Police Chase (Steelpan Interactive) — 2026-11-08"
---

# Poki reward bypass + local save unlock (any Poki game)

Use this when a user wants to: claim Poki rewarded-ad rewards without watching videos, or unlock in-game progress (vehicles/items/money) in a Poki web game. Work from real evidence (DevTools console/network/storage, command output) for the specific game.

## How Poki rewards work (baseline)

- Poki games run inside a Poki shell; the actual game is usually in an iframe on `*.poki-gdn.com` / `*.poki-cdn.com`, while the outer page is `poki.com`.
- Games commonly use `PokiSDK.rewardedBreak(onStart?) -> Promise<boolean>` and `PokiSDK.commercialBreak(onStart?) -> Promise<void>`. The *game* typically grants the reward client-side when `rewardedBreak` resolves `true`.
- If a game/network uses **server-side verification** against the ad network, a client hook may not grant server-validated rewards. Many Poki arcade titles grant via the SDK callback; verify per game.
- Ad blockers (browser + DNS/Pi-hole/AdGuard) can block SDK/ad endpoints and break the game or reward button. You may need minimal exceptions for `poki.com`, `*.poki.com`, `*.poki-gdn.com`, `*.poki-cdn.com` while still bypassing the ad flow via script.

## 1) Identify the target

1. Get the exact game URL (e.g. `https://poki.com/en/g/<slug>`).
2. Confirm reward mechanism: in DevTools console (select the **game iframe** context, not `top`) check `typeof PokiSDK !== 'undefined' && Object.keys(PokiSDK)`. If `rewardedBreak` exists, the SDK hook applies.
3. Note the game iframe origin (look for `*.poki-gdn.com` frame). Saves are usually stored under that origin.

## 2) Reward bypass (userscript, works across Poki games)

Install a userscript manager (Tampermonkey/Violentmonkey). Create a script that hooks `PokiSDK` in **all frames** at **document-start** and intercepts later assignment of `window.PokiSDK`:

```javascript
// ==UserScript==
// @name         Poki Reward Bypass (generic)
// @namespace    local.poki.bypass
// @version      1.0
// @description  Auto-resolve PokiSDK rewarded/commercial breaks.
// @match        https://poki.com/*
// @match        https://*.poki.com/*
// @match        https://*.poki-gdn.com/*
// @match        https://*.poki-cdn.com/*
// @run-at       document-start
// @grant        none
// @allFrames    true
// ==/UserScript==
(function () {
  'use strict';
  function hookSDK(sdk) {
    if (!sdk || sdk.__bypassed) return sdk;
    try {
      Object.defineProperty(sdk, 'rewardedBreak', { configurable:true, writable:true, value: function (onStart) {
        try { if (typeof onStart === 'function') onStart(); } catch(_) {}
        console.log('[Poki Bypass] rewardedBreak -> success');
        return Promise.resolve(true);
      }});
      Object.defineProperty(sdk, 'commercialBreak', { configurable:true, writable:true, value: function (onStart) {
        try { if (typeof onStart === 'function') onStart(); } catch(_) {}
        console.log('[Poki Bypass] commercialBreak -> skip');
        return Promise.resolve();
      }});
      sdk.__bypassed = true;
    } catch(e) {
      sdk.rewardedBreak = () => Promise.resolve(true);
      sdk.commercialBreak = () => Promise.resolve();
      sdk.__bypassed = true;
    }
    return sdk;
  }
  if (window.PokiSDK) hookSDK(window.PokiSDK);
  let _sdk = window.PokiSDK;
  try {
    Object.defineProperty(window, 'PokiSDK', {
      configurable:true, enumerable:true,
      get: () => _sdk,
      set: (v) => { _sdk = hookSDK(v); }
    });
  } catch(_) {}
  const t = setInterval(() => { if (window.PokiSDK && !window.PokiSDK.__bypassed) hookSDK(window.PokiSDK); }, 50);
  setTimeout(() => clearInterval(t), 30000);
})();
```

**Verify:** reload game → console (game frame) shows `[Poki Bypass] rewardedBreak -> success` when claiming a reward.

## 3) Unlock progress (game-specific, local saves)

Only possible when progress is stored client-side (localStorage/IndexedDB) in the browser for the game frame origin. Never claim it works without inspecting the actual save.

1. Open the game, play enough to create a save if needed.
2. DevTools → **Application/Storage** → select the `*.poki-gdn.com` (game) frame origin.
3. Inspect **Local Storage** and **IndexedDB**. Search keys/values for: `save`, `player`, `profile`, `data`, `progress`, `cash`, `money`, `coin`, `gold`, `car`, `vehicle`, `unlock`, `level`, `item`, and the game name/developer.
4. **Back up** the raw value before editing.
5. Identify the schema and patch the minimum needed (e.g., set currency high, mark items unlocked). Prefer a *generous but plausible* grid/range when IDs are unknown (extra invalid unlock entries are often ignored; verify in-game).
6. Reload the game and confirm.

### Verified example: Blacktop Police Chase (Steelpan Interactive)
- URL: `https://poki.com/en/g/blacktop-police-chase`
- Frame: `https://<uuid>.gdn.poki.com/.../index.html` (poki-gdn)
- LocalStorage key: `Blacktop1_Save` (JSON)
- Observed default: `money:0, hiScore:0, unlockedCars:[{"x":0,"y":0},{"x":1,"y":0},{"x":7,"y":1}]`
- Unlock patch (run in the **poki-gdn game frame** console, or automate in a userscript on that frame): set `money`/`hiScore` high and `unlockedCars` to a full grid (verified covering x:0..20,y:0..10 → 231 entries) then `localStorage.setItem('Blacktop1_Save', JSON.stringify(s))` and reload.

```javascript
// Console snippet (run in *.poki-gdn.com game frame)
(() => {
  const key='Blacktop1_Save', raw=localStorage.getItem(key);
  if(!raw) return console.error('No', key, '- select the poki-gdn game frame');
  const s=JSON.parse(raw), cars=[];
  for(let x=0;x<=20;x++) for(let y=0;y<=10;y++) cars.push({x,y});
  s.money=999999999; s.hiScore=Math.max(Number(s.hiScore)||0,999999); s.unlockedCars=cars;
  localStorage.setItem(key, JSON.stringify(s));
  console.log('OK', {money:s.money, cars:cars.length}); location.reload();
})();
```

## 4) Reliable quick-launch (local, no userscript-manager dependency)

When installing into the user's main browser is hard, create a working local launcher:
1. Save an unpacked MV3 extension with a `content_scripts` entry (`matches` poki/poki-gdn/poki-cdn, `run_at: document_start`, `all_frames: true`) containing the hook (+ optional game-specific save patch).
2. Launch Chromium/Chrome with a dedicated profile:  
   `chromium --user-data-dir=<profile-dir> --load-extension=<ext-dir> --no-first-run --no-default-browser-check "https://poki.com/en/g/<slug>"`
3. Create a `.sh` launcher and a `.desktop` entry (`~/.local/share/applications/`, and `~/Escritorio/` or `~/Desktop/` if present) for one-click access.
4. **Verify** by inspecting the poki-gdn frame `localStorage` (Playwright/DevTools protocol or DevTools manually) and confirm the reward callback logs.

## 5) Verification checklist (always)

- [ ] Hook active: `[Poki Bypass] ...` in the **game frame** console.
- [ ] Reward flow: claiming a rewarded item grants it (or callback resolves success) without a watched ad.
- [ ] Save patch (if used): correct origin (`poki-gdn.com` frame), correct key, values reflect unlock/money, and in-game UI shows unlocked items after reload.
- [ ] Ad blockers not breaking the game: if SDK/game fails to load, add minimal domain exceptions (poki/poki-gdn/poki-cdn).
- [ ] Report limitations honestly: server-verified rewards, game-specific save schemas, and browser profile scope (changes apply to the profile where storage was modified).

## 6) Packaging for reuse

Bundle: userscript `.user.js`, unpacked extension dir, game-specific console snippet, launcher `.sh` + `.desktop`, and a short README noting the verified save key/schema and origin. Keep it local; do not close the user's browser without confirmation. If a change needs sudo, ask and explain the exact command.