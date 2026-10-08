/**
 * UmbraShark - Isolated Bridge Content Script
 * Bridges chrome.storage.local and active settings to the MAIN world stealth engine.
 */

(function() {
  'use strict';

  function syncStateToMainWorld() {
    chrome.storage.local.get(['cloakProfile', 'cloakEnabled', 'whitelist', 'canvasNoise', 'audioNoise', 'webRtcProtect'], (data) => {
      if (chrome.runtime.lastError) return;

      const enabled = data.cloakEnabled !== false;
      const profile = data.cloakProfile || {};
      const whitelist = data.whitelist || [];
      const currentHost = window.location.hostname;

      // Check if current domain is whitelisted
      const isWhitelisted = whitelist.some(domain => {
        return currentHost === domain || currentHost.endsWith('.' + domain);
      });

      const payload = Object.assign({}, profile, {
        enabled: enabled,
        whitelisted: isWhitelisted,
        canvasNoise: data.canvasNoise !== false,
        audioNoise: data.audioNoise !== false,
        webRtcProtect: data.webRtcProtect !== false
      });

      // Dispatch to main world script
      document.dispatchEvent(new CustomEvent('__CLOAK_STATE_UPDATE__', {
        detail: payload
      }));
    });
  }

  // Initial sync immediately at document_start
  syncStateToMainWorld();

  // Listen for engine ready signal from main world
  document.addEventListener('__CLOAK_ENGINE_READY__', () => {
    syncStateToMainWorld();
  });

  // Listen for runtime storage updates from dashboard
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local') {
      syncStateToMainWorld();
    }
  });

})();
