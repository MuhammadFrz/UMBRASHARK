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

  // Studio Form Elements - Device & OS
  const presetDeviceSelect = document.getElementById('presetDeviceSelect');
  const customProfileNameInput = document.getElementById('customProfileNameInput');
  const customModelInput = document.getElementById('customModelInput');
  const customOsInput = document.getElementById('customOsInput');
  const customOsVersionInput = document.getElementById('customOsVersionInput');
  const customPlatformInput = document.getElementById('customPlatformInput');
  const customChPlatformInput = document.getElementById('customChPlatformInput');
  const customArchInput = document.getElementById('customArchInput');
  const customBitnessInput = document.getElementById('customBitnessInput');
  const customTouchPointsInput = document.getElementById('customTouchPointsInput');
  const customMobileToggle = document.getElementById('customMobileToggle');

  // Studio Form Elements - Browser Identity
  const presetUaSelect = document.getElementById('presetUaSelect');
  const btnBuildUaStudio = document.getElementById('btnBuildUaStudio');
  const customBrowserNameInput = document.getElementById('customBrowserNameInput');
  const customBrowserVersionInput = document.getElementById('customBrowserVersionInput');
  const customVendorInput = document.getElementById('customVendorInput');
  const customUaInput = document.getElementById('customUaInput');
  const customBrandsInput = document.getElementById('customBrandsInput');

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
  const customAvailWidth = document.getElementById('customAvailWidth');
  const customAvailHeight = document.getElementById('customAvailHeight');
  const customDpr = document.getElementById('customDpr');
  const customColorDepth = document.getElementById('customColorDepth');
  const presetCpuSelect = document.getElementById('presetCpuSelect');
  const customCoresInput = document.getElementById('customCoresInput');
  const presetMemorySelect = document.getElementById('presetMemorySelect');
  const customMemoryInput = document.getElementById('customMemoryInput');

  const toggleCanvasNoise = document.getElementById('toggleCanvasNoise');
  const toggleAudioNoise = document.getElementById('toggleAudioNoise');
  const toggleWebRtcProtect = document.getElementById('toggleWebRtcProtect');
  const webRtcPolicySelect = document.getElementById('webRtcPolicySelect');

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
  let webRtcPolicy = 'disable_non_proxied_udp';

  const btnDetectIp = document.getElementById('btnDetectIp');
  const btnApplyIp = document.getElementById('btnApplyIp');
  const btnUndoIp = document.getElementById('btnUndoIp');
  const ipStatus = document.getElementById('ipStatus');
  const ipPreview = document.getElementById('ipPreview');
  const ipMatchLanguage = document.getElementById('ipMatchLanguage');
  let detectedLocation = null;
  let profileBeforeAlignment = null;

  function formatBrands(brands) {
    if (!Array.isArray(brands) || !brands.length) return 'Not/A)Brand:8, Chromium:136, Google Chrome:136';
    return brands.map(b => `${b.brand}:${b.version}`).join(', ');
  }

  function parseBrands(text, fallbackBrands) {
    const items = String(text || '').split(',').map(s => s.trim()).filter(Boolean).map(entry => {
      const idx = entry.lastIndexOf(':');
      if (idx <= 0) return null;
      const brand = entry.slice(0, idx).trim();
      const version = entry.slice(idx + 1).trim();
      if (!brand || !/^\d{1,4}$/.test(version)) return null;
      return { brand, version };
    }).filter(Boolean);
    return items.length ? items : (Array.isArray(fallbackBrands) && fallbackBrands.length ? fallbackBrands : [{ brand: 'Not/A)Brand', version: '8' }, { brand: 'Chromium', version: '136' }]);
  }

  function inferBrowserInfo(profile) {
    const ua = profile.ua || '';
    if (profile.browserName && profile.browserVersion) {
      return { name: profile.browserName, version: profile.browserVersion };
    }
    let m;
    if ((m = ua.match(/SamsungBrowser\/([\d.]+)/))) return { name: 'Samsung Internet', version: m[1] };
    if ((m = ua.match(/Edg\/([\d.]+)/))) return { name: 'Edge', version: m[1] };
    if ((m = ua.match(/CriOS\/([\d.]+)/))) return { name: 'Chrome iOS', version: m[1] };
    if ((m = ua.match(/Firefox\/([\d.]+)/))) return { name: 'Firefox', version: m[1] };
    if ((m = ua.match(/Version\/([\d.]+).*Safari/))) return { name: profile.mobile ? 'Safari Mobile' : 'Safari', version: m[1] };
    if ((m = ua.match(/Chrome\/([\d.]+)/))) return { name: profile.mobile ? 'Chrome Mobile' : 'Chrome', version: m[1] };
    return { name: profile.browserName || 'Chrome', version: profile.browserVersion || '136.0.0.0' };
  }

  function setIpStatus(message, state = '') {
    ipStatus.textContent = message;
    ipStatus.dataset.state = state;
  }

  btnDetectIp.addEventListener('click', async () => {
    btnDetectIp.disabled = true;
    btnDetectIp.textContent = 'Detecting connection…';
    btnApplyIp.disabled = true;
    detectedLocation = null;
    setIpStatus('Looking up your public connection with ipwho.is…');
    try {
      const response = await chrome.runtime.sendMessage({ type: 'DETECT_IP_LOCATION' });
      if (!response || !response.ok) throw new Error(response && response.error || 'No response from the extension. Reload it and try again.');
      detectedLocation = response.location;
      const details = window.IP_ALIGNMENT.timezoneDetails(detectedLocation.timezone);
      document.getElementById('ipAddress').textContent = detectedLocation.ip;
      document.getElementById('ipLocation').textContent = [detectedLocation.city, detectedLocation.country].filter(Boolean).join(', ');
      document.getElementById('ipTimezone').textContent = detectedLocation.timezone + ' · ' + formatOffset(details.offset);
      document.getElementById('ipLanguage').textContent = detectedLocation.suggestedLocale;
      document.getElementById('ipDetectedAt').textContent = 'Detected ' + new Date(detectedLocation.detectedAt).toLocaleTimeString();
      ipPreview.hidden = false;
      btnApplyIp.disabled = false;
      setIpStatus('Location detected. Review the details below before applying.', 'success');
    } catch (error) {
      setIpStatus(error.message + ' Your saved profile was not changed.', 'error');
    } finally {
      btnDetectIp.disabled = false;
      btnDetectIp.textContent = 'Detect again ↗';
    }
  });

  btnApplyIp.addEventListener('click', async () => {
    if (!detectedLocation) return;
    if (Date.now() - detectedLocation.detectedAt > 5 * 60 * 1000) {
      setIpStatus('This preview is over five minutes old. Detect again before applying.', 'error');
      btnApplyIp.disabled = true;
      return;
    }
    btnApplyIp.disabled = true;
    const previous = structuredClone(currentProfile);
    try {
      const next = window.IP_ALIGNMENT.alignProfile(currentProfile, detectedLocation, ipMatchLanguage.checked);
      // Save once before updating the UI. Detection alone never writes settings.
      await chrome.storage.local.set({ cloakProfile: next });
      currentProfile = next;
      profileBeforeAlignment = previous;
      btnUndoIp.hidden = false;
      updateUIFromState();
      setIpStatus('Profile aligned. Reload open webpages to check the new settings.' + (isEnabled ? '' : ' Overrides are currently paused.'), 'success');
      showToast('IP location applied to your profile.');
    } catch (error) {
      setIpStatus('Could not save alignment. ' + error.message, 'error');
    } finally {
      btnApplyIp.disabled = false;
    }
  });

  btnUndoIp.addEventListener('click', async () => {
    if (!profileBeforeAlignment) return;
    btnUndoIp.disabled = true;
    try {
      await chrome.storage.local.set({ cloakProfile: profileBeforeAlignment });
      currentProfile = profileBeforeAlignment;
      profileBeforeAlignment = null;
      btnUndoIp.hidden = true;
      updateUIFromState();
      setIpStatus('Previous profile restored. Reload open webpages to check it.', 'success');
    } catch (error) {
      setIpStatus('Could not restore the previous profile. ' + error.message, 'error');
    } finally { btnUndoIp.disabled = false; }
  });

  function formatOffset(offset) {
    const minutes = Math.abs(offset);
    return 'UTC' + (offset > 0 ? '−' : '+') + String(Math.floor(minutes / 60)).padStart(2, '0') + ':' + String(minutes % 60).padStart(2, '0');
  }

  // --------------------------------------------------------------------------
  // 1. POPULATE DROPDOWNS
  // --------------------------------------------------------------------------
  function populateDropdowns() {
    quickPersonaSelect.add(new Option('Custom profile', ''));
    studioPersonaSelect.add(new Option('Custom profile', ''));
    if (presetDeviceSelect) presetDeviceSelect.add(new Option('Custom device configuration', ''));
    presetTimezoneSelect.add(new Option('Custom / IP-detected timezone', ''));
    presetLangSelect.add(new Option('Custom / IP-suggested locale', ''));
    presetUaSelect.add(new Option('Custom browser values', ''));
    presetGpuSelect.add(new Option('Custom graphics values', ''));
    presetScreenSelect.add(new Option('Custom display values', ''));

    // Personas
    presets.IDENTITY_PRESETS.forEach(p => {
      const opt1 = new Option(p.name, p.id);
      const opt2 = new Option(p.name, p.id);
      quickPersonaSelect.add(opt1);
      studioPersonaSelect.add(opt2);
    });

    // Devices
    if (presetDeviceSelect && Array.isArray(presets.DEVICE_PRESETS)) {
      presets.DEVICE_PRESETS.forEach(d => {
        presetDeviceSelect.add(new Option(d.label, d.id));
      });
    }

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
      'canvasNoise', 'audioNoise', 'webRtcProtect', 'webRtcPolicy'
    ]);

    if (data.cloakProfile) {
      currentProfile = data.cloakProfile;
    }
    if (!Number.isFinite(currentProfile.offset)) {
      currentProfile.offset = presets.calculateExactTimezoneOffset(currentProfile.timezone);
      currentProfile.timezoneAbbr = presets.getTimezoneAbbr(currentProfile.timezone);
    }
    isEnabled = data.cloakEnabled !== false;
    whitelist = data.whitelist || ['localhost', '127.0.0.1'];
    canvasNoise = data.canvasNoise !== false;
    audioNoise = data.audioNoise !== false;
    webRtcProtect = data.webRtcProtect !== false;
    webRtcPolicy = data.webRtcPolicy === 'default_public_interface_only' ? data.webRtcPolicy : 'disable_non_proxied_udp';

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
    webRtcPolicySelect.value = webRtcPolicy;
    webRtcPolicySelect.disabled = !webRtcProtect;

    if (isEnabled) {
      statusPill.classList.remove('disabled');
      statusLabel.textContent = 'Overrides enabled';
    } else {
      statusPill.classList.add('disabled');
      statusLabel.textContent = 'Overrides paused';
    }

    const browserInfo = inferBrowserInfo(currentProfile);
    const isMobile = typeof currentProfile.mobile === 'boolean'
      ? currentProfile.mobile
      : (/Android|iOS/i.test(currentProfile.os || '') && !/iPad/i.test(currentProfile.os || ''));
    const touchPoints = Number.isInteger(currentProfile.maxTouchPoints)
      ? currentProfile.maxTouchPoints
      : (isMobile || /iPad/i.test(currentProfile.os || '') ? 5 : 0);
    const vendor = currentProfile.vendor !== undefined
      ? currentProfile.vendor
      : (/iOS|iPadOS/i.test(currentProfile.os || '') ? 'Apple Computer, Inc.' : 'Google Inc.');

    // Overview Hero
    overviewPersonaId.textContent = currentProfile.id || 'custom-profile';
    overviewPersonaName.textContent = currentProfile.name || 'Custom Spoofed Fingerprint';
    const modelSuffix = currentProfile.model ? ` · ${currentProfile.model}` : '';
    overviewOsVal.textContent = `${currentProfile.os || 'Windows'} ${currentProfile.chPlatformVersion || ''} (${currentProfile.platform || 'Win32'}${modelSuffix})`.replace(/\s+/g, ' ');
    overviewTzVal.textContent = `${currentProfile.timezone} · ${formatOffset(currentProfile.offset || 0)}`;
    overviewGpuVal.textContent = currentProfile.gpuRenderer || 'Default GPU';
    overviewLocaleVal.textContent = (currentProfile.languages || []).join(', ');

    // Match selects if matching persona found
    const presetId = presets.IDENTITY_PRESETS.some(p => p.id === currentProfile.id) ? currentProfile.id : '';
    quickPersonaSelect.value = presetId;
    studioPersonaSelect.value = presetId;

    // Studio Device & OS Values
    if (customProfileNameInput) customProfileNameInput.value = currentProfile.name || '';
    if (customModelInput) customModelInput.value = currentProfile.model || '';
    if (customOsInput) customOsInput.value = currentProfile.os || 'Windows';
    if (customOsVersionInput) customOsVersionInput.value = currentProfile.chPlatformVersion || '15.0.0';
    customPlatformInput.value = currentProfile.platform || '';
    customChPlatformInput.value = currentProfile.chPlatform || '';
    if (customArchInput) customArchInput.value = currentProfile.architecture || 'x86';
    if (customBitnessInput) customBitnessInput.value = currentProfile.bitness || '64';
    if (customTouchPointsInput) customTouchPointsInput.value = touchPoints;
    if (customMobileToggle) customMobileToggle.checked = isMobile;

    if (presetDeviceSelect && Array.isArray(presets.DEVICE_PRESETS)) {
      const matchedDevice = presets.DEVICE_PRESETS.find(d =>
        d.os === currentProfile.os &&
        d.platform === currentProfile.platform &&
        (d.model || '') === (currentProfile.model || '') &&
        d.screenWidth === currentProfile.screenWidth &&
        d.screenHeight === currentProfile.screenHeight
      );
      presetDeviceSelect.value = matchedDevice ? matchedDevice.id : '';
    }

    // Studio Browser Values
    if (customBrowserNameInput) customBrowserNameInput.value = browserInfo.name;
    if (customBrowserVersionInput) customBrowserVersionInput.value = browserInfo.version;
    if (customVendorInput) customVendorInput.value = vendor;
    customUaInput.value = currentProfile.ua || '';
    if (customBrandsInput) customBrandsInput.value = formatBrands(currentProfile.brands);
    const uaIndex = presets.USER_AGENT_PRESETS.findIndex(p => p.ua === currentProfile.ua && p.platform === currentProfile.platform);
    presetUaSelect.value = uaIndex < 0 ? '' : String(uaIndex);

    customTzInput.value = currentProfile.timezone || '';
    customTzOffset.value = currentProfile.offset || 0;
    customLatInput.value = currentProfile.lat || 0;
    customLonInput.value = currentProfile.lon || 0;
    presetTimezoneSelect.value = presets.TIMEZONE_PRESETS.some(p => p.id === currentProfile.timezone) ? currentProfile.timezone : '';

    customLocaleInput.value = currentProfile.locale || 'en-US';
    customAcceptLangInput.value = currentProfile.acceptLanguage || 'en-US,en;q=0.9';
    presetLangSelect.value = presets.LANGUAGE_PRESETS.some(p => p.code === currentProfile.locale) ? currentProfile.locale : '';

    customGpuVendorInput.value = currentProfile.gpuVendor || '';
    customGpuRendererInput.value = currentProfile.gpuRenderer || '';
    const gpuIndex = presets.GPU_PRESETS.findIndex(p => p.vendor === currentProfile.gpuVendor && p.renderer === currentProfile.gpuRenderer);
    presetGpuSelect.value = gpuIndex < 0 ? '' : String(gpuIndex);

    customScreenWidth.value = currentProfile.screenWidth || 1920;
    customScreenHeight.value = currentProfile.screenHeight || 1080;
    if (customAvailWidth) customAvailWidth.value = currentProfile.availWidth || currentProfile.screenWidth || 1920;
    if (customAvailHeight) customAvailHeight.value = currentProfile.availHeight || currentProfile.screenHeight || 1040;
    customDpr.value = currentProfile.dpr || 1.0;
    if (customColorDepth) customColorDepth.value = currentProfile.colorDepth || 24;

    if (![...presetCpuSelect.options].some(o => Number(o.value) === currentProfile.cores)) {
      presetCpuSelect.add(new Option((currentProfile.cores || 8) + ' Cores (custom)', currentProfile.cores || 8));
    }
    presetCpuSelect.value = currentProfile.cores || 8;
    if (customCoresInput) customCoresInput.value = currentProfile.cores || 8;

    if (![...presetMemorySelect.options].some(o => Number(o.value) === currentProfile.memory)) {
      presetMemorySelect.add(new Option(currentProfile.memory + ' GB (saved value)', currentProfile.memory));
    }
    presetMemorySelect.value = currentProfile.memory || 8;
    if (customMemoryInput) customMemoryInput.value = currentProfile.memory || 8;

    const screenIndex = presets.SCREEN_PRESETS.findIndex(p => p.width === currentProfile.screenWidth && p.height === currentProfile.screenHeight && p.dpr === currentProfile.dpr);
    presetScreenSelect.value = screenIndex < 0 ? '' : String(screenIndex);

    // Overview Parameter Table
    renderOverviewTable();

    // Whitelist List
    renderWhitelist();
  }

  // --------------------------------------------------------------------------
  // 4. RENDER OVERVIEW SIGNATURE TABLE
  // --------------------------------------------------------------------------
  function renderOverviewTable() {
    const isMobile = Boolean(currentProfile.mobile);
    const touchPoints = Number.isInteger(currentProfile.maxTouchPoints) ? currentProfile.maxTouchPoints : (isMobile ? 5 : 0);
    const browserInfo = inferBrowserInfo(currentProfile);
    const rows = [
      { vector: 'Device & OS Version', val: `${currentProfile.deviceName || currentProfile.os} · ${currentProfile.os} ${currentProfile.chPlatformVersion}${currentProfile.model ? ' (' + currentProfile.model + ')' : ''}`, status: 'Active Cloak' },
      { vector: 'Browser & Version', val: `${browserInfo.name} ${browserInfo.version} (Vendor: ${currentProfile.vendor ?? 'Google Inc.'})`, status: 'Active Cloak' },
      { vector: 'User-Agent (HTTP + DOM)', val: currentProfile.ua, status: 'Active Cloak' },
      { vector: 'Client Hints (Platform & Mobile)', val: `${currentProfile.chPlatform} ${currentProfile.chPlatformVersion} (${currentProfile.architecture} ${currentProfile.bitness}-bit · mobile: ${isMobile ? '?1' : '?0'})`, status: 'Active Cloak' },
      { vector: 'Navigator.platform & Touch', val: `${currentProfile.platform} · maxTouchPoints: ${touchPoints}`, status: 'Active Cloak' },
      { vector: 'Timezone & Offset', val: `${currentProfile.timezone} (Offset: ${currentProfile.offset} min)`, status: 'Active Cloak' },
      { vector: 'Geolocation Coordinates', val: `${currentProfile.lat}, ${currentProfile.lon}`, status: 'Synchronized' },
      { vector: 'Primary Locale / Accept-Lang', val: `${currentProfile.locale} | ${currentProfile.acceptLanguage}`, status: 'Synchronized' },
      { vector: 'WebGL Unmasked Renderer', val: `${currentProfile.gpuVendor} · ${currentProfile.gpuRenderer}`, status: 'Active Cloak' },
      { vector: 'Screen Resolution & DPR', val: `${currentProfile.screenWidth}x${currentProfile.screenHeight} (avail: ${currentProfile.availWidth}x${currentProfile.availHeight}, DPR: ${currentProfile.dpr}, ${currentProfile.colorDepth}-bit)`, status: 'Active Cloak' },
      { vector: 'Hardware Cores / RAM', val: `${currentProfile.cores} Cores / ${currentProfile.memory} GB`, status: 'Active Cloak' },
      { vector: 'Canvas / audio hooks', val: `${canvasNoise ? 'Enabled' : 'Off'} / ${audioNoise ? 'Enabled' : 'Off'}` },
      { vector: 'WebRTC policy request', val: webRtcProtect ? webRtcPolicy === 'disable_non_proxied_udp' ? 'Strict: block direct UDP' : 'Compatibility: public interface only' : 'Default browser policy' }
    ];

    overviewTableBody.innerHTML = rows.map(r => `
      <tr>
        <td>${escapeHtml(r.vector)}</td>
        <td>${escapeHtml(r.val)}</td>
        <td><span class="tag-pass">${isEnabled ? 'Configured' : 'Paused'}</span></td>
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
    let domain;
    try { domain = window.CLOAK_SETTINGS.domain(whitelistInput.value); }
    catch (error) { showToast(error.message); return; }
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
    showToast(isEnabled ? 'Browser overrides enabled.' : 'Browser overrides paused.');
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
    if (await saveActiveProfile()) showToast(`Sample profile saved: ${currentProfile.name}`);
  });

  // --------------------------------------------------------------------------
  // 7. PRESET EVENT HANDLERS FOR INDIVIDUAL CONTROLS
  // --------------------------------------------------------------------------
  function rebuildUaFromForm() {
    if (typeof presets.buildBrowserIdentity !== 'function') return;
    const built = presets.buildBrowserIdentity({
      browserName: customBrowserNameInput ? customBrowserNameInput.value : currentProfile.browserName,
      browserVersion: customBrowserVersionInput ? customBrowserVersionInput.value : currentProfile.browserVersion,
      os: customOsInput ? customOsInput.value : currentProfile.os,
      chPlatformVersion: customOsVersionInput ? customOsVersionInput.value : currentProfile.chPlatformVersion,
      model: customModelInput ? customModelInput.value : currentProfile.model,
      mobile: customMobileToggle ? customMobileToggle.checked : currentProfile.mobile,
      platform: customPlatformInput.value
    });
    customUaInput.value = built.ua;
    if (customVendorInput) customVendorInput.value = built.vendor;
    if (customBrandsInput) customBrandsInput.value = formatBrands(built.brands);
    currentProfile.ua = built.ua;
    currentProfile.vendor = built.vendor;
    currentProfile.brands = built.brands;
  }

  if (btnBuildUaStudio) {
    btnBuildUaStudio.addEventListener('click', () => {
      rebuildUaFromForm();
      document.getElementById('saveStatus').textContent = 'Built User-Agent & Client Hints from fields. Save the profile to apply.';
      showToast('Rebuilt User-Agent and Client Hints from configured version & device.');
    });
  }

  if (presetDeviceSelect) {
    presetDeviceSelect.addEventListener('change', () => {
      const dev = (presets.DEVICE_PRESETS || []).find(d => d.id === presetDeviceSelect.value);
      if (!dev) return;
      currentProfile.id = 'custom-' + dev.id;
      currentProfile.deviceName = dev.deviceName;
      currentProfile.name = `${dev.deviceName} · ${currentProfile.timezone || 'America/New_York'}`;
      currentProfile.os = dev.os;
      currentProfile.platform = dev.platform;
      currentProfile.chPlatform = dev.chPlatform;
      currentProfile.chPlatformVersion = dev.chPlatformVersion;
      currentProfile.architecture = dev.architecture;
      currentProfile.bitness = dev.bitness;
      currentProfile.model = dev.model;
      currentProfile.mobile = dev.mobile;
      currentProfile.maxTouchPoints = dev.maxTouchPoints;
      currentProfile.cores = dev.cores;
      currentProfile.memory = dev.memory;
      currentProfile.screenWidth = dev.screenWidth;
      currentProfile.screenHeight = dev.screenHeight;
      currentProfile.availWidth = dev.availWidth;
      currentProfile.availHeight = dev.availHeight;
      currentProfile.dpr = dev.dpr;
      currentProfile.colorDepth = dev.colorDepth;
      currentProfile.gpuVendor = dev.gpuVendor;
      currentProfile.gpuRenderer = dev.gpuRenderer;
      currentProfile.browserName = dev.defaultBrowser || 'Chrome';
      currentProfile.browserVersion = dev.defaultBrowserVersion || '136.0.0.0';

      if (typeof presets.buildBrowserIdentity === 'function') {
        const built = presets.buildBrowserIdentity(currentProfile);
        currentProfile.ua = built.ua;
        currentProfile.vendor = built.vendor;
        currentProfile.brands = built.brands;
      }
      updateUIFromState();
      presetDeviceSelect.value = dev.id;
      document.getElementById('saveStatus').textContent = `Loaded ${dev.deviceName} preset. Save the profile to apply.`;
    });
  }

  presetUaSelect.addEventListener('change', () => {
    const idx = parseInt(presetUaSelect.value, 10);
    const uaObj = presets.USER_AGENT_PRESETS[idx];
    if (uaObj) {
      customUaInput.value = uaObj.ua;
      customPlatformInput.value = uaObj.platform;
      customChPlatformInput.value = uaObj.chPlatform;
      if (customBrowserNameInput) customBrowserNameInput.value = uaObj.browser || 'Chrome';
      if (customBrowserVersionInput) customBrowserVersionInput.value = uaObj.browserVersion || '136.0.0.0';
      if (customVendorInput && uaObj.vendor !== undefined) customVendorInput.value = uaObj.vendor;
      if (customOsInput && uaObj.os) customOsInput.value = uaObj.os;
      if (customOsVersionInput && uaObj.osVersion) customOsVersionInput.value = uaObj.osVersion;
      if (customModelInput && uaObj.model !== undefined) customModelInput.value = uaObj.model;
      if (customMobileToggle && typeof uaObj.mobile === 'boolean') {
        customMobileToggle.checked = uaObj.mobile;
        if (customTouchPointsInput) customTouchPointsInput.value = uaObj.mobile || uaObj.platform === 'iPad' ? 5 : 0;
      }
      if (customBrandsInput && uaObj.brands) customBrandsInput.value = formatBrands(uaObj.brands);

      currentProfile.ua = uaObj.ua;
      currentProfile.platform = uaObj.platform;
      currentProfile.chPlatform = uaObj.chPlatform;
      currentProfile.brands = uaObj.brands;
      currentProfile.browserName = uaObj.browser || currentProfile.browserName;
      currentProfile.browserVersion = uaObj.browserVersion || currentProfile.browserVersion;
      if (uaObj.vendor !== undefined) currentProfile.vendor = uaObj.vendor;
      if (uaObj.os) currentProfile.os = uaObj.os;
      if (uaObj.osVersion) currentProfile.chPlatformVersion = uaObj.osVersion;
      if (uaObj.model !== undefined) currentProfile.model = uaObj.model;
      if (typeof uaObj.mobile === 'boolean') currentProfile.mobile = uaObj.mobile;
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
      if (customAvailWidth) customAvailWidth.value = screenObj.availWidth;
      if (customAvailHeight) customAvailHeight.value = screenObj.availHeight;
      customDpr.value = screenObj.dpr;
      if (customColorDepth) customColorDepth.value = screenObj.colorDepth || 24;
      currentProfile.screenWidth = screenObj.width;
      currentProfile.screenHeight = screenObj.height;
      currentProfile.availWidth = screenObj.availWidth;
      currentProfile.availHeight = screenObj.availHeight;
      currentProfile.dpr = screenObj.dpr;
      currentProfile.colorDepth = screenObj.colorDepth || 24;
    }
  });

  presetCpuSelect.addEventListener('change', () => {
    const val = parseInt(presetCpuSelect.value, 10);
    currentProfile.cores = val;
    if (customCoresInput) customCoresInput.value = val;
  });

  if (customCoresInput) {
    customCoresInput.addEventListener('input', () => {
      const val = parseInt(customCoresInput.value, 10);
      if (Number.isFinite(val) && val >= 1) {
        currentProfile.cores = val;
        if ([...presetCpuSelect.options].some(o => Number(o.value) === val)) presetCpuSelect.value = val;
      }
    });
  }

  presetMemorySelect.addEventListener('change', () => {
    const val = parseFloat(presetMemorySelect.value);
    currentProfile.memory = val;
    if (customMemoryInput) customMemoryInput.value = val;
  });

  if (customMemoryInput) {
    customMemoryInput.addEventListener('input', () => {
      const val = parseFloat(customMemoryInput.value);
      if (Number.isFinite(val) && val >= 0.25) {
        currentProfile.memory = val;
        if ([...presetMemorySelect.options].some(o => Number(o.value) === val)) presetMemorySelect.value = val;
      }
    });
  }

  // --------------------------------------------------------------------------
  // 8. SAVE & RESET BUTTONS
  // --------------------------------------------------------------------------
  async function saveActiveProfile() {
    for (const input of document.querySelectorAll('#tab-studio input, #tab-studio textarea')) {
      if (!input.reportValidity()) return;
    }
    let locale;
    try {
      locale = Intl.getCanonicalLocales(customLocaleInput.value.trim())[0];
      if (!locale) throw new Error('Missing locale');
      if (/[\r\n]/.test(customAcceptLangInput.value + customUaInput.value)) throw new Error('Invalid header');
    } catch (error) {
      showToast('Use a valid locale such as en-US and single-line header values.');
      return;
    }
    if (currentProfile.locale !== locale && customAcceptLangInput.value.trim() === currentProfile.acceptLanguage) {
      customAcceptLangInput.value = locale + ',' + new Intl.Locale(locale).language + ';q=0.9';
    }
    // Read manual edits - Device & OS
    if (customProfileNameInput && customProfileNameInput.value.trim()) {
      currentProfile.name = customProfileNameInput.value.trim();
    }
    if (customOsInput && customOsInput.value.trim()) {
      currentProfile.os = customOsInput.value.trim();
    }
    if (customOsVersionInput && customOsVersionInput.value.trim()) {
      currentProfile.chPlatformVersion = customOsVersionInput.value.trim();
    }
    if (customModelInput) {
      currentProfile.model = customModelInput.value.trim();
    }
    if (customArchInput && customArchInput.value.trim()) {
      currentProfile.architecture = customArchInput.value.trim();
    }
    if (customBitnessInput && customBitnessInput.value.trim()) {
      currentProfile.bitness = customBitnessInput.value.trim();
    }
    if (customMobileToggle) {
      currentProfile.mobile = Boolean(customMobileToggle.checked);
    }
    if (customTouchPointsInput) {
      const tp = parseInt(customTouchPointsInput.value, 10);
      currentProfile.maxTouchPoints = Number.isInteger(tp) && tp >= 0 && tp <= 32 ? tp : (currentProfile.mobile ? 5 : 0);
    }

    // Read manual edits - Browser
    if (customBrowserNameInput && customBrowserNameInput.value.trim()) {
      currentProfile.browserName = customBrowserNameInput.value.trim();
    }
    if (customBrowserVersionInput && customBrowserVersionInput.value.trim()) {
      currentProfile.browserVersion = customBrowserVersionInput.value.trim();
    }
    if (customVendorInput) {
      currentProfile.vendor = customVendorInput.value.trim();
    }
    if (customBrandsInput && customBrandsInput.value.trim()) {
      currentProfile.brands = parseBrands(customBrandsInput.value, currentProfile.brands);
    }

    currentProfile.ua = customUaInput.value.trim();
    currentProfile.platform = customPlatformInput.value.trim();
    currentProfile.chPlatform = customChPlatformInput.value.trim();
    currentProfile.timezone = customTzInput.value.trim();
    currentProfile.offset = parseInt(customTzOffset.value, 10) || 0;
    currentProfile.lat = parseFloat(customLatInput.value) || 0;
    currentProfile.lon = parseFloat(customLonInput.value) || 0;
    if (currentProfile.locale !== locale || !currentProfile.languages || currentProfile.languages[0] !== locale) {
      currentProfile.languages = [...new Set([locale, new Intl.Locale(locale).language])];
    }
    currentProfile.locale = locale;
    currentProfile.acceptLanguage = customAcceptLangInput.value.trim();
    currentProfile.gpuVendor = customGpuVendorInput.value.trim();
    currentProfile.gpuRenderer = customGpuRendererInput.value.trim();

    const sw = parseInt(customScreenWidth.value, 10) || 1920;
    const sh = parseInt(customScreenHeight.value, 10) || 1080;
    currentProfile.screenWidth = sw;
    currentProfile.screenHeight = sh;
    const aw = customAvailWidth ? parseInt(customAvailWidth.value, 10) : (currentProfile.availWidth || sw);
    const ah = customAvailHeight ? parseInt(customAvailHeight.value, 10) : (currentProfile.availHeight || sh);
    currentProfile.availWidth = Math.min(Number.isFinite(aw) && aw > 0 ? aw : sw, sw);
    currentProfile.availHeight = Math.min(Number.isFinite(ah) && ah > 0 ? ah : sh, sh);
    currentProfile.dpr = parseFloat(customDpr.value) || 1.0;
    if (customColorDepth) {
      currentProfile.colorDepth = parseInt(customColorDepth.value, 10) || 24;
    }
    currentProfile.cores = (customCoresInput ? parseInt(customCoresInput.value, 10) : 0) || parseInt(presetCpuSelect.value, 10) || 8;
    currentProfile.memory = (customMemoryInput ? parseFloat(customMemoryInput.value) : 0) || parseFloat(presetMemorySelect.value) || 8;

    canvasNoise = toggleCanvasNoise.checked;
    audioNoise = toggleAudioNoise.checked;
    webRtcProtect = toggleWebRtcProtect.checked;
    webRtcPolicy = webRtcPolicySelect.value;

    try {
      window.CLOAK_SETTINGS.profile(currentProfile);
      await chrome.storage.local.set({
        cloakProfile: currentProfile,
        cloakEnabled: isEnabled,
        canvasNoise,
        audioNoise,
        webRtcProtect,
        webRtcPolicy
      });
    } catch (error) {
      document.getElementById('saveStatus').textContent = 'Could not save. Your edits are still here; try again.';
      showToast('Could not save profile. ' + error.message);
      return false;
    }

    updateUIFromState();
    document.getElementById('saveStatus').textContent = 'Profile saved. Reload open webpages to verify changes.';
    showToast('Profile saved.');
    return true;
  }

  document.getElementById('tab-studio').addEventListener('input', () => {
    document.getElementById('saveStatus').textContent = 'Unsaved changes. Save the profile to apply them.';
  });

  btnSaveConfig.addEventListener('click', saveActiveProfile);
  toggleWebRtcProtect.addEventListener('change', () => { webRtcPolicySelect.disabled = !toggleWebRtcProtect.checked; });

  btnResetDefault.addEventListener('click', async () => {
    currentProfile = Object.assign({}, presets.DEFAULT_PROFILE);
    updateUIFromState();
    if (await saveActiveProfile()) showToast('Reset to default profile.');
  });

  // --------------------------------------------------------------------------
  // 9. TAB SWITCHING
  // --------------------------------------------------------------------------
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => {
        b.classList.remove('active');
        b.removeAttribute('aria-current');
      });
      tabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      btn.setAttribute('aria-current', 'page');
      document.getElementById('pageTitle').textContent = btn.dataset.title;
      const target = document.getElementById(btn.dataset.tab);
      if (target) {
        target.classList.add('active');
        if (btn.dataset.tab === 'tab-diagnostics') {
          loadDiagnosticTabs();
        }
      }
    });
  });

  // --------------------------------------------------------------------------
  // 10. REAL-TIME IN-BROWSER DIAGNOSTICS RUNNER
  // --------------------------------------------------------------------------
  const diagnosticTabSelect = document.getElementById('diagnosticTabSelect');
  const btnApplyProfileToTab = document.getElementById('btnApplyProfileToTab');
  const btnReloadProfileTab = document.getElementById('btnReloadProfileTab');
  async function applySavedProfileToTab() {
    btnApplyProfileToTab.disabled = true;
    try {
      if (!diagnosticTabSelect.value) await loadDiagnosticTabs();
      if (!diagnosticTabSelect.value) throw new Error('Select a regular webpage first.');
      const response = await chrome.runtime.sendMessage({ type: 'APPLY_PROFILE_TO_TAB', tabId: Number(diagnosticTabSelect.value) });
      if (!response || !response.ok) throw new Error(response && response.error || 'Could not apply the saved profile.');
      btnReloadProfileTab.hidden = !response.requiresReload;
      await runDiagnostics();
      const failures = response.frames.filter(frame => !frame.ok);
      if (failures.length) {
        diagSummary.textContent += ' Apply failed: ' + [...new Set(failures.map(frame => frame.error || 'Installation was not confirmed.'))].join(' ');
        return false;
      }
      diagSummary.textContent += ' Saved profile applied to ' + response.frames.length + ' frames.';
      return true;
    } catch (error) { diagSummary.textContent = error.message; return false; }
    finally { btnApplyProfileToTab.disabled = false; }
  }
  btnApplyProfileToTab.addEventListener('click', applySavedProfileToTab);
  btnReloadProfileTab.addEventListener('click', async () => {
    btnReloadProfileTab.disabled = true;
    try {
      const response = await chrome.runtime.sendMessage({ type: 'RELOAD_PROFILE_TAB', tabId: Number(diagnosticTabSelect.value) });
      if (!response || !response.ok) throw new Error(response && response.error || 'Could not reload the page.');
      btnReloadProfileTab.hidden = true;
      diagSummary.textContent = 'Selected webpage reloading. Run checks once it finishes loading.';
    } catch (error) { diagSummary.textContent = error.message; }
    finally { btnReloadProfileTab.disabled = false; }
  });
  async function loadDiagnosticTabs() {
    const selected = diagnosticTabSelect.value;
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_DIAGNOSTIC_TABS' });
      if (!response || !response.ok) throw new Error(response && response.error || 'Could not list webpages.');
      diagnosticTabSelect.replaceChildren();
      for (const tab of response.tabs || []) diagnosticTabSelect.add(new Option(tab.title, String(tab.id)));
      if ([...diagnosticTabSelect.options].some(o => o.value === selected)) diagnosticTabSelect.value = selected;
      if (!diagnosticTabSelect.options.length) diagnosticTabSelect.add(new Option('Open a regular webpage, then refresh this list', ''));
    } catch (error) { diagSummary.textContent = error.message; }
  }
  document.getElementById('btnRefreshDiagnosticTabs').addEventListener('click', loadDiagnosticTabs);
  async function runDiagnostics() {
    btnRunDiagnostics.disabled = true;
    diagScore.textContent = '—';
    diagSummary.textContent = 'Checking the selected page and its frames…';
    diagTableBody.replaceChildren();
    try {
      if (!diagnosticTabSelect.value) await loadDiagnosticTabs();
      if (!diagnosticTabSelect.value) throw new Error('Open a regular webpage and select it before running checks.');
      const response = await chrome.runtime.sendMessage({ type: 'RUN_PAGE_DIAGNOSTICS', tabId: Number(diagnosticTabSelect.value) });
      if (!response || !response.ok) throw new Error(response && response.error || 'Page checks could not run.');
      btnReloadProfileTab.hidden = !response.frames.some(frame => frame.requiresReload);
      const rows = [];
      for (const frame of response.frames) {
        if (frame.error) rows.push({name:'Frame unavailable',expectation:'Frame permits extension injection',observed:frame.error,status:'skip',scope:frame.url});
        for (const check of frame.checks) rows.push(Object.assign({}, check, {scope:'Frame ' + frame.frameId + ' · ' + frame.url}));
      }
      rows.push({name:'Effective WebRTC policy',expectation:'Browser policy is reported, not inferred',observed:response.policy.value + ' · ' + response.policy.levelOfControl,status:'info',scope:'Browser-wide'});
      const passed = rows.filter(r => r.status === 'pass').length;
      const tested = rows.filter(r => r.status === 'pass' || r.status === 'fail').length;
      diagScore.textContent = passed + '/' + tested;
      diagSummary.textContent = passed + ' of ' + tested + ' assertions passed across ' + response.frames.length + ' frames. Skipped frames and WebRTC observations are listed separately. This is not an authenticity score.';
      diagTableBody.innerHTML = rows.map(r => '<tr><td>' + escapeHtml(r.name) + '</td><td>' + escapeHtml(r.expectation) + '</td><td>' + escapeHtml(r.observed) + '</td><td><span class="' + (r.status === 'pass' ? 'tag-pass' : r.status === 'fail' ? 'tag-fail' : 'mono-meta') + '">' + escapeHtml(r.status.toUpperCase()) + '</span></td><td>' + escapeHtml(r.scope) + '</td></tr>').join('');
    } catch (error) { diagSummary.textContent = error.message; }
    finally { btnRunDiagnostics.disabled = false; }
  }
  btnRunDiagnostics.addEventListener('click', runDiagnostics);

  // --------------------------------------------------------------------------
  // AUTO-FIX ENGINES FOR TIMEZONE & WEBGL HARDWARE
  // --------------------------------------------------------------------------
  async function autoFixTimezone() {
    const tz = (customTzInput && customTzInput.value.trim()) || currentProfile.timezone || 'America/New_York';
    const exactOffset = presets.calculateExactTimezoneOffset
      ? presets.calculateExactTimezoneOffset(tz)
      : 0;
    const exactAbbr = presets.getTimezoneAbbr
      ? presets.getTimezoneAbbr(tz)
      : 'GMT';

    currentProfile.timezone = tz;
    currentProfile.offset = exactOffset;
    currentProfile.timezoneAbbr = exactAbbr;
    customTzOffset.value = exactOffset;

    if (!await saveActiveProfile()) return false;
    showToast(`Timezone math aligned: ${tz} (Offset: ${exactOffset} min, ${exactAbbr})`);
    return true;
  }

  async function autoFixWebGL() {
    const os = currentProfile.os || '';
    const platform = currentProfile.platform || '';
    const model = currentProfile.model || '';
    let targetGpu = null;

    if (/iOS|iPadOS/i.test(os) || platform === 'iPhone' || platform === 'iPad') {
      targetGpu = presets.GPU_PRESETS.find(g => g.os === 'iOS');
    } else if (/Android/i.test(os) || platform.includes('armv8')) {
      if (/Pixel 10/i.test(model)) {
        targetGpu = presets.GPU_PRESETS.find(g => g.renderer.includes('PowerVR'));
      } else if (/Pixel/i.test(model)) {
        targetGpu = presets.GPU_PRESETS.find(g => g.renderer.includes('Mali-G715'));
      } else {
        targetGpu = presets.GPU_PRESETS.find(g => g.os === 'Android');
      }
    } else {
      const isMac = (os === 'macOS') || platform.includes('Mac');
      const isWin = (os === 'Windows') || platform.includes('Win');
      const targetOs = isMac ? 'MacIntel' : isWin ? 'Windows' : 'Linux x86_64';
      targetGpu = presets.GPU_PRESETS.find(g => g.os === targetOs);
    }

    if (!targetGpu) { showToast('No graphics sample matches this platform.'); return false; }

    currentProfile.gpuVendor = targetGpu.vendor;
    currentProfile.gpuRenderer = targetGpu.renderer;
    customGpuVendorInput.value = targetGpu.vendor;
    customGpuRendererInput.value = targetGpu.renderer;

    if (!await saveActiveProfile()) return false;
    showToast(`WebGL hardware profile matched to ${currentProfile.os}: ${targetGpu.label}`);
    return true;
  }

  async function autoFixAll() {
    const previousOffset = currentProfile.offset;
    const previousGpu = currentProfile.gpuRenderer;
    if (!await autoFixTimezone()) return;
    if (!await autoFixWebGL()) return;
    const applied = await applySavedProfileToTab();
    diagSummary.textContent += ` Saved alignment: offset ${previousOffset} → ${currentProfile.offset} min; graphics ${previousGpu === currentProfile.gpuRenderer ? 'unchanged' : 'changed to the OS sample'}.`;
    showToast(applied ? 'Alignment saved and applied. Review the page assertions.' : 'Alignment saved. Page application needs attention; see diagnostics.');
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
