// ==UserScript==
// @name         Poki Reward/Ad Bypass + Blacktop Unlock
// @namespace    local.poki.bypass
// @version      1.2
// @description  Bypass Poki rewarded/commercial ads y desbloquea vehículos/dinero en Blacktop: Police Chase.
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
      Object.defineProperty(sdk, 'rewardedBreak', { configurable: true, writable: true, value: function (onStart) { try { if (typeof onStart === 'function') onStart(); } catch (_) {} console.log('[Poki Bypass] rewardedBreak -> success'); return Promise.resolve(true); } });
      Object.defineProperty(sdk, 'commercialBreak', { configurable: true, writable: true, value: function (onStart) { try { if (typeof onStart === 'function') onStart(); } catch (_) {} console.log('[Poki Bypass] commercialBreak -> skip'); return Promise.resolve(); } });
      Object.defineProperty(sdk, 'gameplayStart', { configurable: true, writable: true, value: function(){ return Promise.resolve(); } });
      Object.defineProperty(sdk, 'gameplayStop',  { configurable: true, writable: true, value: function(){ return Promise.resolve(); } });
      sdk.__bypassed = true; console.log('[Poki Bypass] PokiSDK enganchado');
    } catch (e) { sdk.rewardedBreak = function () { return Promise.resolve(true); }; sdk.commercialBreak = function () { return Promise.resolve(); }; sdk.__bypassed = true; }
    return sdk;
  }
  if (window.PokiSDK) hookSDK(window.PokiSDK);
  let _sdk = window.PokiSDK;
  try { Object.defineProperty(window, 'PokiSDK', { configurable: true, enumerable: true, get: function () { return _sdk; }, set: function (v) { _sdk = hookSDK(v); } }); } catch (_) {}
  const t = setInterval(function () { if (window.PokiSDK && !window.PokiSDK.__bypassed) hookSDK(window.PokiSDK); }, 50);
  setTimeout(function () { clearInterval(t); }, 30000);

  // --- Blacktop: Police Chase unlock (runs in poki-gdn game frame) ---
  function unlockBlacktop() {
    try {
      const key = 'Blacktop1_Save';
      const raw = localStorage.getItem(key);
      if (!raw) return false;
      const s = JSON.parse(raw);
      const cars = [];
      for (let x = 0; x <= 20; x++) for (let y = 0; y <= 10; y++) cars.push({x, y});
      s.money = Math.max(Number(s.money)||0, 999999999);
      s.unlockedCars = cars;
      s.hiScore = Math.max(Number(s.hiScore)||0, 999999);
      localStorage.setItem(key, JSON.stringify(s));
      console.log('[Poki Bypass] Blacktop1_Save actualizado: dinero max + vehiculos (grid 0-20 x 0-10) desbloqueados. Recarga si ya estabas en menu.');
      return true;
    } catch(e) { console.log('[Poki Bypass] unlock error', e); return false; }
  }
  function tryUnlockLoop() {
    let tries = 0;
    const iv = setInterval(() => {
      tries++;
      if (unlockBlacktop() || tries > 120) clearInterval(iv);
    }, 1000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', tryUnlockLoop);
  else tryUnlockLoop();
})();
