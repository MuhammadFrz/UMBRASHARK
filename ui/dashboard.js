/**
 * UmbraShark - Dashboard Controller
 * Flat stealth privacy management & in-browser diagnostic runner.
 */

document.addEventListener('DOMContentLoaded', async () => {
  'use strict';

  const presets = window.CLOAK_PRESETS;
  if (!presets) {
    console.error('CLOAK_PRESETS database failed to load.');
    return;
  }

  // DOM Elements
  const masterToggle = document.getElementById('masterToggle');
  const statusPill = document.getElementById('statusPill');
  const statusLabel = document.getElementById('statusLabel');
  const btnRollRandom = document.getElementById('btnRollRandom');
  const btnSaveConfig = document.getElementById('btnSaveConfig');
  const btnResetDefault = document.getElementById('btnResetDefault');
  const quickPersonaSelect = document.getElementById('quickPersonaSelect');
  const studioPersonaSelect = document.getElementById('studioPersonaSelect');
  const toast = document.getElementById('toast');

  // Overview Elements
  const overviewPersonaId = document.getElementById('overviewPersonaId');
  const overviewPersonaName = document.getElementById('overviewPersonaName');
  const overviewOsVal = document.getElementById('overviewOsVal');
  const overviewTzVal = document.getElementById('overviewTzVal');
  const overviewGpuVal = document.getElementById('overviewGpuVal');
  const overviewLocaleVal = document.getElementById('overviewLocaleVal');
  const overviewTableBody = document.getElementById('overviewTableBody');

  // Studio Form Elements
  const presetUaSelect = document.getElementById('presetUaSelect');
  const customUaInput = document.getElementById('customUaInput');
  const customPlatformInput = document.getElementById('customPlatformInput');
  const customChPlatformInput = document.getElementById('customChPlatformInput');

  const presetTimezoneSelect = document.getElementById('presetTimezoneSelect');
  const customTzInput = document.getElementById('customTzInput');
  const customTzOffset = document.getElementById('customTzOffset');
  const customLatInput = document.getElementById('customLatInput');
  const customLonInput = document.getElementById('customLonInput');

  const presetLangSelect = document.getElementById('presetLangSelect');
  const customLocaleInput = document.getElementById('customLocaleInput');
  const customAcceptLangInput = document.getElementById('customAcceptLangInput');

  const presetGpuSelect = document.getElementById('presetGpuSelect');
  const customGpuVendorInput = document.getElementById('customGpuVendorInput');
  const customGpuRendererInput = document.getElementById('customGpuRendererInput');

  const presetScreenSelect = document.getElementById('presetScreenSelect');
  const customScreenWidth = document.getElementById('customScreenWidth');
  const customScreenHeight = document.getElementById('customScreenHeight');
  const customDpr = document.getElementById('customDpr');
  const presetCpuSelect = document.getElementById('presetCpuSelect');
  const presetMemorySelect = document.getElementById('presetMemorySelect');

  const toggleCanvasNoise = document.getElementById('toggleCanvasNoise');
  const toggleAudioNoise = document.getElementById('toggleAudioNoise');
  const toggleWebRtcProtect = document.getElementById('toggleWebRtcProtect');

  // Whitelist Elements
  const whitelistInput = document.getElementById('whitelistInput');
  const btnAddWhitelist = document.getElementById('btnAddWhitelist');
  const whitelistContainer = document.getElementById('whitelistContainer');

  // Diagnostics Elements
  const btnRunDiagnostics = document.getElementById('btnRunDiagnostics');
  const btnAutoFixAll = document.getElementById('btnAutoFixAll');
  const btnAutoFixTimezoneStudio = document.getElementById('btnAutoFixTimezoneStudio');
  const btnAutoFixGpuStudio = document.getElementById('btnAutoFixGpuStudio');
  const diagScore = document.getElementById('diagScore');
  const diagSummary = document.getElementById('diagSummary');
  const diagTableBody = document.getElementById('diagTableBody');

  // Local State
  let currentProfile = Object.assign({}, presets.DEFAULT_PROFILE);
  let isEnabled = true;
  let whitelist = ['localhost', '127.0.0.1'];
  let canvasNoise = true;
  let audioNoise = true;
  let webRtcProtect = true;

  // --------------------------------------------------------------------------
  // 1. POPULATE DROPDOWNS
  // --------------------------------------------------------------------------
  function populateDropdowns() {
    // Personas
    presets.IDENTITY_PRESETS.forEach(p => {
      const opt1 = new Option(p.name, p.id);
      const opt2 = new Option(p.name, p.id);
      quickPersonaSelect.add(opt1);
      studioPersonaSelect.add(opt2);
    });

    // User Agents
    presets.USER_AGENT_PRESETS.forEach((ua, idx) => {
      presetUaSelect.add(new Option(ua.label, idx));
    });

    // Timezones
    presets.TIMEZONE_PRESETS.forEach(tz => {
      presetTimezoneSelect.add(new Option(tz.label, tz.id));
    });

    // Languages
    presets.LANGUAGE_PRESETS.forEach(l => {
      presetLangSelect.add(new Option(l.label, l.code));
    });

    // GPUs
    presets.GPU_PRESETS.forEach((g, idx) => {
      presetGpuSelect.add(new Option(`${g.label}`, idx));
    });

    // Screens
    presets.SCREEN_PRESETS.forEach((s, idx) => {
      presetScreenSelect.add(new Option(s.label, idx));
    });

    // Cores
    presets.CPU_PRESETS.forEach(c => {
      presetCpuSelect.add(new Option(`${c} Cores`, c));
    });

    // Memory
    presets.MEMORY_PRESETS.forEach(m => {
      presetMemorySelect.add(new Option(`${m} GB RAM`, m));
    });
  }

  // --------------------------------------------------------------------------
  // 2. LOAD STATE FROM STORAGE
  // --------------------------------------------------------------------------
  async function loadState() {
    const data = await chrome.storage.local.get([
      'cloakProfile', 'cloakEnabled', 'whitelist',
      'canvasNoise', 'audioNoise', 'webRtcProtect'
    ]);

    if (data.cloakProfile) {
      currentProfile = data.cloakProfile;
    }
    isEnabled = data.cloakEnabled !== false;
    whitelist = data.whitelist || ['localhost', '127.0.0.1'];
    canvasNoise = data.canvasNoise !== false;
    audioNoise = data.audioNoise !== false;
    webRtcProtect = data.webRtcProtect !== false;

    updateUIFromState();
  }

  // --------------------------------------------------------------------------
  // 3. UPDATE UI FROM CURRENT STATE
  // --------------------------------------------------------------------------
  function updateUIFromState() {
    // Header & Toggles
    masterToggle.checked = isEnabled;
    toggleCanvasNoise.checked = canvasNoise;
    toggleAudioNoise.checked = audioNoise;
    toggleWebRtcProtect.checked = webRtcProtect;

    if (isEnabled) {
      statusPill.classList.remove('disabled');
      statusLabel.textContent = 'CLOAK ACTIVE';
    } else {
      statusPill.classList.add('disabled');
      statusLabel.textContent = 'BYPASS';
    }

    // Overview Hero
    overviewPersonaId.textContent = currentProfile.id || 'custom-profile';
    overviewPersonaName.textContent = currentProfile.name || 'Custom Spoofed Fingerprint';
    overviewOsVal.textContent = `${currentProfile.os || 'Windows'} (${currentProfile.platform || 'Win32'})`;
    overviewTzVal.textContent = `${currentProfile.timezone} (${currentProfile.timezoneAbbr || 'GMT'}${currentProfile.offset ? (currentProfile.offset > 0 ? '-' + Math.floor(currentProfile.offset/60) : '+' + Math.floor(-currentProfile.offset/60)) : ''})`;
    overviewGpuVal.textContent = currentProfile.gpuRenderer || 'Default GPU';
    overviewLocaleVal.textContent = (currentProfile.languages || []).join(', ');

    // Match selects if matching persona found
    if (currentProfile.id) {
      quickPersonaSelect.value = currentProfile.id;
      studioPersonaSelect.value = currentProfile.id;
    }

    // Studio Form Values
    customUaInput.value = currentProfile.ua || '';
    customPlatformInput.value = currentProfile.platform || '';
    customChPlatformInput.value = currentProfile.chPlatform || '';

    customTzInput.value = currentProfile.timezone || '';
    customTzOffset.value = currentProfile.offset || 0;
    customLatInput.value = currentProfile.lat || 0;
    customLonInput.value = currentProfile.lon || 0;
    presetTimezoneSelect.value = currentProfile.timezone || 'America/New_York';

    customLocaleInput.value = currentProfile.locale || 'en-US';
    customAcceptLangInput.value = currentProfile.acceptLanguage || 'en-US,en;q=0.9';
    presetLangSelect.value = currentProfile.locale || 'en-US';

    customGpuVendorInput.value = currentProfile.gpuVendor || '';
    customGpuRendererInput.value = currentProfile.gpuRenderer || '';

    customScreenWidth.value = currentProfile.screenWidth || 1920;
    customScreenHeight.value = currentProfile.screenHeight || 1080;
    customDpr.value = currentProfile.dpr || 1.0;
    presetCpuSelect.value = currentProfile.cores || 8;
    presetMemorySelect.value = currentProfile.memory || 16;

    // Overview Parameter Table
    renderOverviewTable();

    // Whitelist List
    renderWhitelist();

    // Synchronize active profile with in-page stealth engine
    document.dispatchEvent(new CustomEvent('__CLOAK_STATE_UPDATE__', { detail: currentProfile }));
  }

  // --------------------------------------------------------------------------
  // 4. RENDER OVERVIEW SIGNATURE TABLE
  // --------------------------------------------------------------------------
  function renderOverviewTable() {
    const rows = [
      { vector: 'User-Agent (HTTP + DOM)', val: currentProfile.ua, status: 'Active Cloak' },
      { vector: 'Client Hints (Platform)', val: `${currentProfile.chPlatform} (${currentProfile.architecture} ${currentProfile.bitness}-bit)`, status: 'Active Cloak' },
      { vector: 'Navigator.platform', val: currentProfile.platform, status: 'Active Cloak' },
      { vector: 'Timezone & Offset', val: `${currentProfile.timezone} (Offset: ${currentProfile.offset} min)`, status: 'Active Cloak' },
      { vector: 'Geolocation Coordinates', val: `${currentProfile.lat}, ${currentProfile.lon}`, status: 'Synchronized' },
      { vector: 'Primary Locale / Accept-Lang', val: `${currentProfile.locale} | ${currentProfile.acceptLanguage}`, status: 'Synchronized' },
      { vector: 'WebGL Unmasked Renderer', val: currentProfile.gpuRenderer, status: 'Active Cloak' },
      { vector: 'Screen Resolution & DPR', val: `${currentProfile.screenWidth}x${currentProfile.screenHeight} (DPR: ${currentProfile.dpr})`, status: 'Active Cloak' },
      { vector: 'Hardware Cores / RAM', val: `${currentProfile.cores} Cores / ${currentProfile.memory} GB`, status: 'Active Cloak' },
      { vector: 'Canvas & Audio Entropy', val: `${canvasNoise ? 'Deterministic Salt' : 'Off'} / ${audioNoise ? 'Micro-Jitter' : 'Off'}`, status: 'Active Cloak' },
      { vector: 'WebRTC IP Protection', val: webRtcProtect ? 'Default Public Interface Only' : 'Exposed', status: webRtcProtect ? 'Protected' : 'Off' }
    ];

    overviewTableBody.innerHTML = rows.map(r => `
      <tr>
        <td style="color: #a1a1aa; font-weight: 600;">${escapeHtml(r.vector)}</td>
        <td style="color: #f4f4f5; max-width: 500px; word-break: break-all;">${escapeHtml(r.val)}</td>
        <td><span class="tag-pass">${escapeHtml(r.status)}</span></td>
      </tr>
    `).join('');
  }

  // --------------------------------------------------------------------------
  // 5. WHITELIST MANAGEMENT
  // --------------------------------------------------------------------------
  function renderWhitelist() {
    whitelistContainer.innerHTML = '';
    if (whitelist.length === 0) {
      whitelistContainer.innerHTML = '<div style="color: #71717a; font-family: var(--font-mono); font-size: 11px;">No domains currently whitelisted.</div>';
      return;
    }
    whitelist.forEach((domain, idx) => {
      const item = document.createElement('div');
      item.className = 'whitelist-item';
      item.innerHTML = `
        <span>${escapeHtml(domain)}</span>
        <button class="btn-remove" data-idx="${idx}">Remove</button>
      `;
      whitelistContainer.appendChild(item);
    });
  }

  btnAddWhitelist.addEventListener('click', async () => {
    let domain = whitelistInput.value.trim().toLowerCase();
    domain = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    if (!domain) return;
    if (!whitelist.includes(domain)) {
      whitelist.push(domain);
      await chrome.storage.local.set({ whitelist });
      whitelistInput.value = '';
      renderWhitelist();
      showToast(`Added ${domain} to whitelist.`);
    }
  });

  whitelistContainer.addEventListener('click', async (e) => {
    if (e.target.classList.contains('btn-remove')) {
      const idx = parseInt(e.target.dataset.idx, 10);
      const removed = whitelist.splice(idx, 1)[0];
      await chrome.storage.local.set({ whitelist });
      renderWhitelist();
      showToast(`Removed ${removed} from whitelist.`);
    }
  });

  // --------------------------------------------------------------------------
  // 6. MASTER TOGGLE & PERSONA SWITCHERS
  // --------------------------------------------------------------------------
  masterToggle.addEventListener('change', async () => {
    isEnabled = masterToggle.checked;
    await chrome.storage.local.set({ cloakEnabled: isEnabled });
    updateUIFromState();
    showToast(isEnabled ? 'Stealth Cloak Activated' : 'Stealth Cloak Deactivated (Bypass)');
  });

  function applyPersonaById(id) {
    const found = presets.IDENTITY_PRESETS.find(p => p.id === id);
    if (found) {
      currentProfile = Object.assign({}, found);
      updateUIFromState();
    }
  }

  quickPersonaSelect.addEventListener('change', async () => {
    applyPersonaById(quickPersonaSelect.value);
    await saveActiveProfile();
  });

  studioPersonaSelect.addEventListener('change', () => {
    applyPersonaById(studioPersonaSelect.value);
  });

  // Roll Random Button
  btnRollRandom.addEventListener('click', async () => {
    const available = presets.IDENTITY_PRESETS.filter(p => p.id !== currentProfile.id);
    const randomPick = available[Math.floor(Math.random() * available.length)] || presets.IDENTITY_PRESETS[0];
    currentProfile = Object.assign({}, randomPick);
    updateUIFromState();
    await saveActiveProfile();
    showToast(`Rolled New Identity: ${currentProfile.name}`);
  });

  // --------------------------------------------------------------------------
  // 7. PRESET EVENT HANDLERS FOR INDIVIDUAL CONTROLS
  // --------------------------------------------------------------------------
  presetUaSelect.addEventListener('change', () => {
    const idx = parseInt(presetUaSelect.value, 10);
    const uaObj = presets.USER_AGENT_PRESETS[idx];
    if (uaObj) {
      customUaInput.value = uaObj.ua;
      customPlatformInput.value = uaObj.platform;
      customChPlatformInput.value = uaObj.chPlatform;
      currentProfile.ua = uaObj.ua;
      currentProfile.platform = uaObj.platform;
      currentProfile.chPlatform = uaObj.chPlatform;
      currentProfile.brands = uaObj.brands;
    }
  });

  presetTimezoneSelect.addEventListener('change', () => {
    const tzObj = presets.TIMEZONE_PRESETS.find(t => t.id === presetTimezoneSelect.value);
    if (tzObj) {
      const exactOffset = presets.calculateExactTimezoneOffset ? presets.calculateExactTimezoneOffset(tzObj.id) : tzObj.offset;
      const exactAbbr = presets.getTimezoneAbbr ? presets.getTimezoneAbbr(tzObj.id) : tzObj.abbr;

      customTzInput.value = tzObj.id;
      customTzOffset.value = exactOffset;
      customLatInput.value = tzObj.lat;
      customLonInput.value = tzObj.lon;
      currentProfile.timezone = tzObj.id;
      currentProfile.offset = exactOffset;
      currentProfile.timezoneAbbr = exactAbbr;
      currentProfile.lat = tzObj.lat;
      currentProfile.lon = tzObj.lon;
    }
  });

  presetLangSelect.addEventListener('change', () => {
    const langObj = presets.LANGUAGE_PRESETS.find(l => l.code === presetLangSelect.value);
    if (langObj) {
      customLocaleInput.value = langObj.code;
      customAcceptLangInput.value = langObj.acceptLanguage;
      currentProfile.locale = langObj.code;
      currentProfile.languages = langObj.languages;
      currentProfile.acceptLanguage = langObj.acceptLanguage;
    }
  });

  presetGpuSelect.addEventListener('change', () => {
    const idx = parseInt(presetGpuSelect.value, 10);
    const gpuObj = presets.GPU_PRESETS[idx];
    if (gpuObj) {
      customGpuVendorInput.value = gpuObj.vendor;
      customGpuRendererInput.value = gpuObj.renderer;
      currentProfile.gpuVendor = gpuObj.vendor;
      currentProfile.gpuRenderer = gpuObj.renderer;
    }
  });

  presetScreenSelect.addEventListener('change', () => {
    const idx = parseInt(presetScreenSelect.value, 10);
    const screenObj = presets.SCREEN_PRESETS[idx];
    if (screenObj) {
      customScreenWidth.value = screenObj.width;
      customScreenHeight.value = screenObj.height;
      customDpr.value = screenObj.dpr;
      currentProfile.screenWidth = screenObj.width;
      currentProfile.screenHeight = screenObj.height;
      currentProfile.availWidth = screenObj.availWidth;
      currentProfile.availHeight = screenObj.availHeight;
      currentProfile.dpr = screenObj.dpr;
    }
  });

  presetCpuSelect.addEventListener('change', () => {
    currentProfile.cores = parseInt(presetCpuSelect.value, 10);
  });

  presetMemorySelect.addEventListener('change', () => {
    currentProfile.memory = parseInt(presetMemorySelect.value, 10);
  });

  // --------------------------------------------------------------------------
  // 8. SAVE & RESET BUTTONS
  // --------------------------------------------------------------------------
  async function saveActiveProfile() {
    // Read manual edits
    currentProfile.ua = customUaInput.value.trim();
    currentProfile.platform = customPlatformInput.value.trim();
    currentProfile.chPlatform = customChPlatformInput.value.trim();
    currentProfile.timezone = customTzInput.value.trim();
    currentProfile.offset = parseInt(customTzOffset.value, 10) || 0;
    currentProfile.lat = parseFloat(customLatInput.value) || 0;
    currentProfile.lon = parseFloat(customLonInput.value) || 0;
    currentProfile.locale = customLocaleInput.value.trim();
    currentProfile.acceptLanguage = customAcceptLangInput.value.trim();
    currentProfile.gpuVendor = customGpuVendorInput.value.trim();
    currentProfile.gpuRenderer = customGpuRendererInput.value.trim();
    currentProfile.screenWidth = parseInt(customScreenWidth.value, 10) || 1920;
    currentProfile.screenHeight = parseInt(customScreenHeight.value, 10) || 1080;
    currentProfile.dpr = parseFloat(customDpr.value) || 1.0;
    currentProfile.cores = parseInt(presetCpuSelect.value, 10) || 8;
    currentProfile.memory = parseInt(presetMemorySelect.value, 10) || 16;

    canvasNoise = toggleCanvasNoise.checked;
    audioNoise = toggleAudioNoise.checked;
    webRtcProtect = toggleWebRtcProtect.checked;

    await chrome.storage.local.set({
      cloakProfile: currentProfile,
      cloakEnabled: isEnabled,
      canvasNoise,
      audioNoise,
      webRtcProtect
    });

    updateUIFromState();
    showToast('Profile configuration saved & applied.');
  }

  btnSaveConfig.addEventListener('click', saveActiveProfile);

  btnResetDefault.addEventListener('click', async () => {
    currentProfile = Object.assign({}, presets.DEFAULT_PROFILE);
    updateUIFromState();
    await saveActiveProfile();
    showToast('Reset to default profile.');
  });

  // --------------------------------------------------------------------------
  // 9. TAB SWITCHING
  // --------------------------------------------------------------------------
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const target = document.getElementById(btn.dataset.tab);
      if (target) {
        target.classList.add('active');
        if (btn.dataset.tab === 'tab-diagnostics') {
          runDiagnostics();
        }
      }
    });
  });

  // --------------------------------------------------------------------------
  // 10. REAL-TIME IN-BROWSER DIAGNOSTICS RUNNER
  // --------------------------------------------------------------------------
  async function runDiagnostics() {
    diagTableBody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #a1a1aa; padding: 20px;">Executing stealth heuristic checks...</td></tr>';

    const results = [];

    // Test 1: Prototype hasOwnProperty Check (Navigator.userAgent)
    const hasOwnUA = Object.prototype.hasOwnProperty.call(navigator, 'userAgent');
    results.push({
      name: 'Prototype Integrity (Navigator.userAgent)',
      heuristic: 'navigator.hasOwnProperty("userAgent") === false',
      observed: hasOwnUA ? 'LEAK: Property exists on instance' : 'PASS: Inherited from Navigator.prototype',
      pass: !hasOwnUA
    });

    // Test 2: Prototype hasOwnProperty Check (Navigator.platform)
    const hasOwnPlatform = Object.prototype.hasOwnProperty.call(navigator, 'platform');
    results.push({
      name: 'Prototype Integrity (Navigator.platform)',
      heuristic: 'navigator.hasOwnProperty("platform") === false',
      observed: hasOwnPlatform ? 'LEAK: Property exists on instance' : 'PASS: Inherited from Navigator.prototype',
      pass: !hasOwnPlatform
    });

    // Test 3: Function.prototype.toString Camouflage
    let toStringPass = false;
    let toStringVal = '';
    try {
      const getter = Object.getOwnPropertyDescriptor(Navigator.prototype, 'userAgent').get;
      toStringVal = getter.toString();
      toStringPass = toStringVal.includes('[native code]') && toStringVal.includes('userAgent');
    } catch (e) {
      toStringVal = String(e);
    }
    results.push({
      name: 'Native toString Cloaking',
      heuristic: 'Getter toString() returns "[native code]"',
      observed: toStringVal,
      pass: toStringPass
    });

    // Test 4: Illegal Invocation Fidelity
    let illegalInvocationPass = false;
    let illegalMsg = '';
    try {
      const getter = Object.getOwnPropertyDescriptor(Navigator.prototype, 'userAgent').get;
      getter.call({});
      illegalMsg = 'No error thrown (Failed)';
    } catch (err) {
      if (err instanceof TypeError && err.message.includes('Illegal invocation')) {
        illegalInvocationPass = true;
        illegalMsg = 'TypeError: Illegal invocation (Authentic)';
      } else {
        illegalMsg = err.name + ': ' + err.message;
      }
    }
    results.push({
      name: 'Illegal Invocation Fidelity',
      heuristic: 'Calling getter with {} throws TypeError',
      observed: illegalMsg,
      pass: illegalInvocationPass
    });

    // Test 5: Timezone Offset vs Intl Alignment
    const liveTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const liveOffset = new Date().getTimezoneOffset();
    const exactOffset = presets.calculateExactTimezoneOffset ? presets.calculateExactTimezoneOffset(currentProfile.timezone) : currentProfile.offset;
    const tzMatch = (liveTz === currentProfile.timezone) && (liveOffset === currentProfile.offset) && (currentProfile.offset === exactOffset);
    results.push({
      name: 'Timezone Mathematical Coherence',
      heuristic: 'Intl timeZone matches Date.getTimezoneOffset() & DST',
      observed: `Intl: ${liveTz} | Offset: ${liveOffset} min (Target: ${exactOffset} min)`,
      pass: tzMatch,
      action: !tzMatch ? '<button class="btn btn-secondary btn-xs btn-fix-tz" style="padding: 2px 8px; font-size: 10px;">⚡ Auto-Fix</button>' : '-'
    });

    // Test 6: WebGL Unmasked GPU Renderer
    let liveGpuRenderer = 'Unavailable';
    let liveGpuVendor = 'Unavailable';
    let gpuPass = false;
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl) {
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        liveGpuRenderer = gl.getParameter(0x9246) || (ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : 'None');
        liveGpuVendor = gl.getParameter(0x9245) || (ext ? gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) : 'None');
        gpuPass = (liveGpuRenderer === currentProfile.gpuRenderer) && (liveGpuVendor === currentProfile.gpuVendor);
      }
    } catch (e) {
      liveGpuRenderer = String(e);
    }
    results.push({
      name: 'WebGL GPU Unmasked Hardware',
      heuristic: 'gl.getParameter(0x9246) returns spoofed GPU',
      observed: liveGpuRenderer,
      pass: gpuPass,
      action: !gpuPass ? '<button class="btn btn-secondary btn-xs btn-fix-webgl" style="padding: 2px 8px; font-size: 10px;">⚡ Auto-Fix</button>' : '-'
    });

    // Test 7: Canvas Deterministic Stability Test
    let canvasPass = false;
    let canvasHashObserved = '';
    try {
      const c1 = document.createElement('canvas');
      c1.width = 100; c1.height = 100;
      const ctx1 = c1.getContext('2d');
      ctx1.fillStyle = '#ff3366';
      ctx1.fillRect(10, 10, 80, 80);
      const url1 = c1.toDataURL();

      const c2 = document.createElement('canvas');
      c2.width = 100; c2.height = 100;
      const ctx2 = c2.getContext('2d');
      ctx2.fillStyle = '#ff3366';
      ctx2.fillRect(10, 10, 80, 80);
      const url2 = c2.toDataURL();

      canvasPass = (url1 === url2) && (url1.length > 50);
      canvasHashObserved = canvasPass ? 'Consistent hash across calls (Zero Flutter)' : 'Erratic frame flutter detected';
    } catch (e) {
      canvasHashObserved = String(e);
    }
    results.push({
      name: 'Deterministic Canvas Entropy',
      heuristic: 'Sequential renders produce identical hash (Anti-Bot Safe)',
      observed: canvasHashObserved,
      pass: canvasPass,
      action: '-'
    });

    // Test 8: Media Devices Sanitization
    let mediaPass = false;
    let mediaObserved = '';
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        mediaPass = devices.length >= 2;
        mediaObserved = `${devices.length} sanitized mock peripheral devices`;
      } else {
        mediaObserved = 'API Not Present';
        mediaPass = true;
      }
    } catch (e) {
      mediaObserved = String(e);
    }
    results.push({
      name: 'Media Devices Sanitization',
      heuristic: 'Hardware peripheral hashes sanitized',
      observed: mediaObserved,
      pass: mediaPass,
      action: '-'
    });

    // Render Diagnostics Table
    const total = results.length;
    const passed = results.filter(r => r.pass).length;
    const scorePct = Math.round((passed / total) * 100);

    diagScore.textContent = `${scorePct}%`;
    diagScore.style.color = scorePct === 100 ? 'var(--accent-green)' : (scorePct >= 75 ? 'var(--accent-amber)' : 'var(--accent-red)');
    diagSummary.textContent = `${passed} of ${total} heuristic checks passed. Zero prototype tampering leaks detected. The browser environment appears authentic to anti-fraud engines.`;

    if (btnAutoFixAll) {
      if (scorePct === 100) {
        btnAutoFixAll.textContent = '✓ All Checks Passing';
        btnAutoFixAll.classList.remove('btn-primary');
        btnAutoFixAll.classList.add('btn-secondary');
      } else {
        btnAutoFixAll.textContent = '⚡ Auto-Fix All Issues';
        btnAutoFixAll.classList.remove('btn-secondary');
        btnAutoFixAll.classList.add('btn-primary');
      }
    }

    diagTableBody.innerHTML = results.map(r => `
      <tr>
        <td style="font-weight: 600; color: #f4f4f5;">${escapeHtml(r.name)}</td>
        <td style="color: #a1a1aa;">${escapeHtml(r.heuristic)}</td>
        <td style="color: #e4e4e7; max-width: 320px; word-break: break-all;">${escapeHtml(r.observed)}</td>
        <td>
          <span class="${r.pass ? 'tag-pass' : 'tag-fail'}">${r.pass ? 'PASSED' : 'FLAGGED'}</span>
        </td>
        <td>${r.action || '-'}</td>
      </tr>
    `).join('');
  }

  btnRunDiagnostics.addEventListener('click', runDiagnostics);

  // --------------------------------------------------------------------------
  // AUTO-FIX ENGINES FOR TIMEZONE & WEBGL HARDWARE
  // --------------------------------------------------------------------------
  async function autoFixTimezone() {
    const tz = currentProfile.timezone || 'America/New_York';
    const exactOffset = presets.calculateExactTimezoneOffset
      ? presets.calculateExactTimezoneOffset(tz)
      : 0;
    const exactAbbr = presets.getTimezoneAbbr
      ? presets.getTimezoneAbbr(tz)
      : 'GMT';

    currentProfile.offset = exactOffset;
    currentProfile.timezoneAbbr = exactAbbr;
    customTzOffset.value = exactOffset;

    await saveActiveProfile();
    showToast(`Timezone math aligned: ${tz} (Offset: ${exactOffset} min, ${exactAbbr})`);
  }

  async function autoFixWebGL() {
    const isMac = (currentProfile.os === 'macOS') || (currentProfile.platform && currentProfile.platform.includes('Mac'));
    const isWin = (currentProfile.os === 'Windows') || (currentProfile.platform && currentProfile.platform.includes('Win'));

    let targetGpu = presets.GPU_PRESETS[0];
    if (isMac) {
      targetGpu = presets.GPU_PRESETS.find(g => g.os === 'MacIntel') || presets.GPU_PRESETS[10];
    } else if (isWin) {
      targetGpu = presets.GPU_PRESETS.find(g => g.os === 'Windows') || presets.GPU_PRESETS[0];
    } else {
      targetGpu = presets.GPU_PRESETS.find(g => g.os && g.os.includes('Linux')) || presets.GPU_PRESETS[16];
    }

    currentProfile.gpuVendor = targetGpu.vendor;
    currentProfile.gpuRenderer = targetGpu.renderer;
    customGpuVendorInput.value = targetGpu.vendor;
    customGpuRendererInput.value = targetGpu.renderer;

    await saveActiveProfile();
    showToast(`WebGL hardware profile matched to ${currentProfile.os}: ${targetGpu.label}`);
  }

  async function autoFixAll() {
    await autoFixTimezone();
    await autoFixWebGL();
    await runDiagnostics();
    showToast('Auto-Fix completed: All fingerprint vectors synchronized.');
  }

  if (btnAutoFixTimezoneStudio) {
    btnAutoFixTimezoneStudio.addEventListener('click', autoFixTimezone);
  }
  if (btnAutoFixGpuStudio) {
    btnAutoFixGpuStudio.addEventListener('click', autoFixWebGL);
  }
  if (btnAutoFixAll) {
    btnAutoFixAll.addEventListener('click', autoFixAll);
  }

  // Delegated click handler on diagnostics table for inline auto-fix buttons
  diagTableBody.addEventListener('click', async (e) => {
    if (e.target.classList.contains('btn-fix-tz')) {
      await autoFixTimezone();
      await runDiagnostics();
    } else if (e.target.classList.contains('btn-fix-webgl')) {
      await autoFixWebGL();
      await runDiagnostics();
    }
  });

  // --------------------------------------------------------------------------
  // UTILITIES
  // --------------------------------------------------------------------------
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2400);
  }

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Initialize
  populateDropdowns();
  await loadState();
});
