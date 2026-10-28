/**
 * UmbraShark - Service Worker (Background)
 * Manages action click navigation, declarativeNetRequest HTTP header rules,
 * WebRTC privacy policies, and default profile initialization.
 */

// Import presets database
importScripts('/data/profiles.js', '/data/ip_alignment.js', '/data/settings.js', '/content/stealth_injected.js', '/content/diagnostics.js');

const frameQueues = new Map();
function queueFrame(documentId, task) {
  const next = (frameQueues.get(documentId) || Promise.resolve()).catch(() => {}).then(task);
  frameQueues.set(documentId, next);
  next.finally(() => { if (frameQueues.get(documentId) === next) frameQueues.delete(documentId); }).catch(() => {});
  return next;
}

async function frameState(tab, frameId, data, frames) {
  const hosts = [];
  const add = url => { try { hosts.push(new URL(url).hostname); } catch (e) {} };
  add(tab.url);
  const byId = new Map(frames.map(f => [f.frameId, f]));
  const visited = new Set();
  let current = byId.get(frameId);
  while (current && !visited.has(current.frameId)) {
    visited.add(current.frameId); add(current.url); current = byId.get(current.parentFrameId);
  }
  return CLOAK_SETTINGS.state(data, hosts);
}

async function refreshEngine(sender) {
  const tab = await chrome.tabs.get(sender.tab.id);
  const frames = await chrome.webNavigation.getAllFrames({ tabId: tab.id }) || [];
  const frame = frames.find(f => f.documentId === sender.documentId && f.frameId === sender.frameId);
  if (!frame) return { ok: false, error: 'Document has navigated.' };
  const data = await chrome.storage.local.get(null);
  const state = await frameState(tab, frame.frameId, data, frames);
  const credentialId = 'engine:' + tab.id + ':' + sender.documentId;
  let credentials = (await chrome.storage.session.get(credentialId))[credentialId];
  if (!credentials) {
    credentials = { key: '__umbra_' + crypto.randomUUID().replaceAll('-', ''), token: crypto.randomUUID() + crypto.randomUUID() };
    await chrome.storage.session.set({ [credentialId]: credentials });
  }
  const result = await chrome.scripting.executeScript({
    target: { tabId: tab.id, documentIds: [sender.documentId] }, world: 'MAIN', injectImmediately: true,
    func: credentials.installed ? function(next, key, token) { return window[key](token, next); } : installStealthEngine,
    args: [state, credentials.key, credentials.token]
  });
  if (!credentials.installed) {
    credentials.installed = true;
    await chrome.storage.session.set({ [credentialId]: credentials });
  }
  return { ok: result[0] && result[0].result && result[0].result.ok === true, enabled: state.enabled, error: state.error };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || !['REFRESH_ENGINE', 'GET_DIAGNOSTIC_TABS', 'RUN_PAGE_DIAGNOSTICS'].includes(message.type)) return;
  const dashboard = sender.id === chrome.runtime.id && sender.url === chrome.runtime.getURL('ui/dashboard.html');
  let task;
  if (message.type === 'REFRESH_ENGINE') {
    if (sender.id !== chrome.runtime.id || !sender.tab || !sender.documentId) {
      sendResponse({ ok: false, error: 'Only extension content scripts can refresh their own document.' }); return;
    }
    task = queueFrame(sender.documentId, () => refreshEngine(sender));
  } else if (!dashboard) {
    sendResponse({ ok: false, error: 'Open the dashboard to run diagnostics.' }); return;
  } else if (message.type === 'GET_DIAGNOSTIC_TABS') {
    task = chrome.tabs.query({}).then(tabs => ({ ok: true, tabs: tabs.filter(t => /^https?:/.test(t.url || '')).map(t => ({ id: t.id, title: t.title || t.url, url: t.url })) }));
  } else {
    task = runTabDiagnostics(message.tabId);
  }
  task.then(sendResponse, error => sendResponse({ ok: false, error: error.message }));
  return true;
});

async function runTabDiagnostics(tabId) {
  if (!Number.isInteger(tabId)) throw new Error('Select a regular webpage first.');
  const tab = await chrome.tabs.get(tabId);
  if (!/^https?:/.test(tab.url || '')) throw new Error('Diagnostics need a regular HTTP or HTTPS webpage.');
  const frames = await chrome.webNavigation.getAllFrames({ tabId }) || [];
  const data = await chrome.storage.local.get(null);
  const results = await Promise.all(frames.map(async frame => {
    try {
      const expected = await frameState(tab, frame.frameId, data, frames);
      const injection = await chrome.scripting.executeScript({ target: { tabId, documentIds: [frame.documentId] }, world: 'MAIN', func: runPageDiagnostics, args: [expected] });
      if (!injection[0] || !injection[0].result || !Array.isArray(injection[0].result.checks)) throw new Error('The frame navigated or returned no diagnostic result.');
      return { frameId: frame.frameId, url: frame.url, ...injection[0].result };
    } catch (error) { return { frameId: frame.frameId, url: frame.url, error: error.message, checks: [] }; }
  }));
  const policy = await chrome.privacy.network.webRTCIPHandlingPolicy.get({});
  return { ok: true, frames: results, policy: { value: policy.value, levelOfControl: policy.levelOfControl },
    rules: (await chrome.declarativeNetRequest.getDynamicRules()).map(rule => ({ id: rule.id, action: rule.action.type })) };
}

// Only the extension dashboard may initiate a lookup; websites cannot trigger it.
let locationLookup = null;
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || message.type !== 'DETECT_IP_LOCATION') return;
  if (sender.id !== chrome.runtime.id || sender.url !== chrome.runtime.getURL('ui/dashboard.html')) {
    sendResponse({ ok: false, error: 'Open the dashboard to detect your IP location.' });
    return;
  }
  if (!locationLookup) {
    locationLookup = (async () => {
      try {
        const response = await fetch('https://ipwho.is/?fields=success,ip,country,country_code,city,latitude,longitude,timezone', {
          credentials: 'omit', cache: 'no-store', referrerPolicy: 'no-referrer',
          signal: AbortSignal.timeout(12000)
        });
        if (!response.ok) throw new Error(response.status === 429
          ? 'The location service is rate limited. Try again later.'
          : 'The location service is unavailable. Try again later.');
        return { ok: true, location: IP_ALIGNMENT.normalizeLookup(await response.json()) };
      } catch (error) {
        return { ok: false, error: error.name === 'TimeoutError'
          ? 'The lookup timed out. Check your connection and try again.'
          : error instanceof TypeError ? 'Could not reach the location service. Check your connection.' : error.message };
      }
    })().finally(() => { locationLookup = null; });
  }
  locationLookup.then(sendResponse);
  return true;
});

const RULE_ID_HEADERS = 1001;
const RULE_ID_WHITELIST = 1002;

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
    if (!enabled || !profile || !profile.ua) {
      await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: [RULE_ID_HEADERS, RULE_ID_WHITELIST] });
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
      condition.excludedInitiatorDomains = whitelist;
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

    const rules = [newRule];
    if (whitelist.length) rules.push({ id: RULE_ID_WHITELIST, priority: 2,
      action: { type: 'allowAllRequests' }, condition: { requestDomains: whitelist, resourceTypes: ['main_frame', 'sub_frame'] } });
    // Atomic replacement avoids a remove/add window and stale duplicate rule IDs.
    await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: [RULE_ID_HEADERS, RULE_ID_WHITELIST], addRules: rules });
  } catch (err) {
    console.error('Failed to update declarativeNetRequest rules:', err);
    throw err;
  }
}

// 3. WEBRTC LEAK PROTECTION
function applyWebRtcPolicy(protect, requested = 'disable_non_proxied_udp') {
  if (chrome.privacy && chrome.privacy.network && chrome.privacy.network.webRTCIPHandlingPolicy) {
    const policy = requested === 'default_public_interface_only' ? requested : 'disable_non_proxied_udp';
    return new Promise((resolve, reject) => {
      chrome.privacy.network.webRTCIPHandlingPolicy[protect ? 'set' : 'clear'](protect ? { value: policy } : {}, () => {
        if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
        else resolve();
      });
    });
  }
}

// 4. STORAGE INITIALIZATION & SYNC
chrome.runtime.onInstalled.addListener(async () => {
  const stored = await chrome.storage.local.get(['cloakProfile', 'cloakEnabled', 'whitelist', 'webRtcProtect']);
  if (!stored.cloakProfile) {
    const defaultProfile = CLOAK_PRESETS.DEFAULT_PROFILE;
    await chrome.storage.local.set({
      cloakEnabled: true,
      cloakProfile: defaultProfile,
      whitelist: ['localhost', '127.0.0.1'],
      canvasNoise: true,
      audioNoise: true,
      webRtcProtect: true,
      webRtcPolicy: 'disable_non_proxied_udp'
    });
  }
  await syncBrowserSettings();
});

let browserSync = Promise.resolve();
function syncBrowserSettings() {
  browserSync = browserSync.catch(() => {}).then(async () => {
    const data = await chrome.storage.local.get(null);
    const state = CLOAK_SETTINGS.state(data);
    const domains = CLOAK_SETTINGS.whitelist(data.whitelist);
    await updateNetworkHeaders(state, state.enabled, domains);
    await applyWebRtcPolicy(state.enabled && data.webRtcProtect !== false, data.webRtcPolicy);
    // Covers already-open whitelisted top-level tabs as well as future navigation.
    const tabIds = (await chrome.tabs.query({})).filter(tab => {
      try { return CLOAK_SETTINGS.matches(new URL(tab.url).hostname, domains); } catch (e) { return false; }
    }).map(tab => tab.id);
    await chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds: [1003], addRules: tabIds.length && state.enabled
      ? [{ id: 1003, priority: 3, action: { type: 'allow' }, condition: { tabIds,
        // A subsequent top-level navigation must be evaluated by its new destination.
        resourceTypes: ['sub_frame', 'stylesheet', 'script', 'image', 'font', 'object', 'xmlhttprequest', 'ping', 'media', 'other'] } }] : [] });
  });
  return browserSync;
}
chrome.storage.onChanged.addListener((changes, area) => { if (area === 'local') syncBrowserSettings().catch(console.error); });
chrome.runtime.onStartup.addListener(() => syncBrowserSettings().catch(console.error));
chrome.tabs.onUpdated.addListener((id, changes) => { if (changes.url) syncBrowserSettings().catch(console.error); });
chrome.tabs.onRemoved.addListener(async tabId => {
  const values = await chrome.storage.session.get(null);
  const keys = Object.keys(values).filter(key => key.startsWith('engine:' + tabId + ':'));
  if (keys.length) await chrome.storage.session.remove(keys);
});
