/**
 * UmbraShark - Service Worker (Background)
 * Manages action click navigation, declarativeNetRequest HTTP header rules,
 * WebRTC privacy policies, and default profile initialization.
 */

// Import presets database
importScripts('/data/profiles.js');

const RULE_ID_HEADERS = 1001;

// 1. OPEN DASHBOARD ON ACTION ICON CLICK
chrome.action.onClicked.addListener((tab) => {
  const dashboardUrl = chrome.runtime.getURL('ui/dashboard.html');
  // Check if dashboard is already open in an existing tab to prevent duplicate clutter
  chrome.tabs.query({ url: dashboardUrl }, (tabs) => {
    if (tabs && tabs.length > 0) {
      chrome.tabs.update(tabs[0].id, { active: true });
      if (tabs[0].windowId) {
        chrome.windows.update(tabs[0].windowId, { focused: true });
      }
    } else {
      chrome.tabs.create({ url: dashboardUrl });
    }
  });
});

// Format brands for Sec-CH-UA header e.g. '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"'
function formatSecChUa(brands) {
  if (!brands || !Array.isArray(brands)) return '"Chromium";v="126"';
  return brands.map(b => `"${b.brand}";v="${b.version}"`).join(', ');
}

// 2. DYNAMIC NETWORK HEADER SPOOFING VIA DECLARATIVENETREQUEST
async function updateNetworkHeaders(profile, enabled, whitelist = []) {
  try {
    // Remove existing rule first
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [RULE_ID_HEADERS]
    });

    if (!enabled || !profile || !profile.ua) {
      return;
    }

    const requestHeaders = [
      { header: 'User-Agent', operation: 'set', value: profile.ua }
    ];

    if (profile.brands && profile.brands.length) {
      requestHeaders.push({
        header: 'Sec-CH-UA',
        operation: 'set',
        value: formatSecChUa(profile.brands)
      });
      requestHeaders.push({
        header: 'Sec-CH-UA-Mobile',
        operation: 'set',
        value: '?0'
      });
      requestHeaders.push({
        header: 'Sec-CH-UA-Platform',
        operation: 'set',
        value: `"${profile.chPlatform || 'Windows'}"`
      });
    }

    if (profile.acceptLanguage) {
      requestHeaders.push({
        header: 'Accept-Language',
        operation: 'set',
        value: profile.acceptLanguage
      });
    }

    const condition = {
      urlFilter: '|http*',
      resourceTypes: [
        'main_frame', 'sub_frame', 'stylesheet', 'script',
        'image', 'font', 'object', 'xmlhttprequest', 'ping', 'other'
      ]
    };

    if (whitelist && whitelist.length > 0) {
      condition.excludedRequestDomains = whitelist;
    }

    const newRule = {
      id: RULE_ID_HEADERS,
      priority: 1,
      action: {
        type: 'modifyHeaders',
        requestHeaders: requestHeaders
      },
      condition: condition
    };

    await chrome.declarativeNetRequest.updateDynamicRules({
      addRules: [newRule]
    });
  } catch (err) {
    console.error('Failed to update declarativeNetRequest rules:', err);
  }
}

// 3. WEBRTC LEAK PROTECTION
function applyWebRtcPolicy(protect) {
  if (chrome.privacy && chrome.privacy.network && chrome.privacy.network.webRTCIPHandlingPolicy) {
    const policy = protect ? 'default_public_interface_only' : 'default';
    chrome.privacy.network.webRTCIPHandlingPolicy.set({ value: policy }, () => {
      if (chrome.runtime.lastError) {
        console.warn('WebRTC policy error:', chrome.runtime.lastError);
      }
    });
  }
}

// 4. STORAGE INITIALIZATION & SYNC
chrome.runtime.onInstalled.addListener(async () => {
  const stored = await chrome.storage.local.get(['cloakProfile', 'cloakEnabled', 'whitelist']);
  if (!stored.cloakProfile) {
    const defaultProfile = CLOAK_PRESETS.DEFAULT_PROFILE;
    await chrome.storage.local.set({
      cloakEnabled: true,
      cloakProfile: defaultProfile,
      whitelist: ['localhost', '127.0.0.1'],
      canvasNoise: true,
      audioNoise: true,
      webRtcProtect: true
    });
    await updateNetworkHeaders(defaultProfile, true, ['localhost', '127.0.0.1']);
    applyWebRtcPolicy(true);
  } else {
    await updateNetworkHeaders(stored.cloakProfile, stored.cloakEnabled !== false, stored.whitelist || []);
    applyWebRtcPolicy(true);
  }
});

// Watch storage modifications
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local') {
    chrome.storage.local.get(['cloakProfile', 'cloakEnabled', 'whitelist', 'webRtcProtect'], (data) => {
      updateNetworkHeaders(data.cloakProfile, data.cloakEnabled !== false, data.whitelist || []);
      if (typeof data.webRtcProtect !== 'undefined') {
        applyWebRtcPolicy(data.webRtcProtect);
      }
    });
  }
});
