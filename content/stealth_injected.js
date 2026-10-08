/**
 * UmbraShark - Stealth Injection Engine (Main World)
 * Runs at document_start in the MAIN execution context.
 * Hardened prototype-level evasion with authentic V8 descriptor & toString fidelity.
 */

(function() {
  'use strict';

  // Prevent double execution in frames if already initialized
  if (window.__CLOAK_ENGINE_INITIALIZED__) return;
  Object.defineProperty(window, '__CLOAK_ENGINE_INITIALIZED__', {
    value: true,
    enumerable: false,
    configurable: false,
    writable: false
  });

  // Default baseline profile (Alienware Windows 11 RTX 4080 / NYC)
  const DEFAULT_STATE = {
    enabled: true,
    os: "Windows",
    platform: "Win32",
    chPlatform: "Windows",
    chPlatformVersion: "15.0.0",
    architecture: "x86",
    bitness: "64",
    ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    appVersion: "5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    brands: [
      { brand: "Not/A)Brand", version: "8" },
      { brand: "Chromium", version: "126" },
      { brand: "Google Chrome", version: "126" }
    ],
    gpuVendor: "Google Inc. (NVIDIA)",
    gpuRenderer: "ANGLE (NVIDIA, NVIDIA GeForce RTX 4080 Direct3D11 vs_5_0 ps_5_0, D3D11)",
    cores: 16,
    memory: 32,
    screenWidth: 2560,
    screenHeight: 1440,
    availWidth: 2560,
    availHeight: 1400,
    dpr: 1.0,
    colorDepth: 24,
    timezone: "America/New_York",
    offset: 240, // minutes behind UTC (EDT = UTC-4 = 240)
    timezoneAbbr: "EDT",
    locale: "en-US",
    languages: ["en-US", "en"],
    lat: 40.7128,
    lon: -74.0060,
    canvasNoise: true,
    audioNoise: true,
    webRtcProtect: true,
    whitelisted: false
  };

  // Active state container
  let state = Object.assign({}, DEFAULT_STATE);

  // Try to restore cached state from sessionStorage if available for instant tick-0 sync
  try {
    const cached = sessionStorage.getItem('__cloak_sync_cache__');
    if (cached) {
      const parsed = JSON.parse(cached);
      Object.assign(state, parsed);
    }
  } catch (e) {}

  // -------------------------------------------------------------
  // 1. NATIVE CAMOUFLAGE UTILITY (toString & Descriptor Fidelity)
  // -------------------------------------------------------------
  const nativeToString = Function.prototype.toString;
  const hookedFunctionsMap = new WeakMap();

  function makeNative(fn, name, isGetter = false) {
    const nativeStr = isGetter
      ? `function get ${name}() { [native code] }`
      : `function ${name}() { [native code] }`;
    
    hookedFunctionsMap.set(fn, nativeStr);

    try {
      Object.defineProperty(fn, 'name', {
        value: isGetter ? `get ${name}` : name,
        configurable: true
      });
    } catch (e) {}

    return fn;
  }

  // Hook Function.prototype.toString
  const customToString = function toString() {
    if (hookedFunctionsMap.has(this)) {
      return hookedFunctionsMap.get(this);
    }
    return nativeToString.apply(this, arguments);
  };
  hookedFunctionsMap.set(customToString, "function toString() { [native code] }");

  try {
    Object.defineProperty(Function.prototype, 'toString', {
      value: customToString,
      writable: true,
      configurable: true,
      enumerable: false
    });
  } catch (e) {}

  // Helper to safely define a stealth getter on a prototype
  function defineStealthGetter(proto, prop, getterFn, expectedContext) {
    const originalDescriptor = Object.getOwnPropertyDescriptor(proto, prop);

    const hookedGetter = function() {
      if (expectedContext && !(this instanceof expectedContext)) {
        throw new TypeError('Illegal invocation');
      }
      if (!state.enabled || state.whitelisted) {
        if (originalDescriptor && originalDescriptor.get) {
          return originalDescriptor.get.call(this);
        }
      }
      return getterFn.call(this);
    };

    makeNative(hookedGetter, prop, true);

    try {
      Object.defineProperty(proto, prop, {
        get: hookedGetter,
        set: undefined,
        enumerable: true,
        configurable: true
      });
    } catch (e) {}
  }

  // -------------------------------------------------------------
  // 2. NAVIGATOR & CLIENT HINTS CLOAK
  // -------------------------------------------------------------
  defineStealthGetter(Navigator.prototype, 'userAgent', () => state.ua, Navigator);
  defineStealthGetter(Navigator.prototype, 'appVersion', () => state.appVersion || state.ua.replace(/^Mozilla\//, ''), Navigator);
  defineStealthGetter(Navigator.prototype, 'platform', () => state.platform, Navigator);
  defineStealthGetter(Navigator.prototype, 'vendor', () => "Google Inc.", Navigator);
  defineStealthGetter(Navigator.prototype, 'language', () => state.locale, Navigator);
  defineStealthGetter(Navigator.prototype, 'languages', () => Object.freeze([...state.languages]), Navigator);
  defineStealthGetter(Navigator.prototype, 'hardwareConcurrency', () => state.cores, Navigator);
  defineStealthGetter(Navigator.prototype, 'deviceMemory', () => state.memory, Navigator);
  defineStealthGetter(Navigator.prototype, 'maxTouchPoints', () => 0, Navigator);

  // High-Entropy Client Hints: navigator.userAgentData
  if ('userAgentData' in Navigator.prototype || 'userAgentData' in navigator) {
    const originalUAData = navigator.userAgentData;

    const mockUAData = {
      get brands() {
        if (!state.enabled || state.whitelisted) {
          return originalUAData ? originalUAData.brands : [];
        }
        return state.brands;
      },
      get mobile() {
        return false;
      },
      get platform() {
        if (!state.enabled || state.whitelisted) {
          return originalUAData ? originalUAData.platform : "Windows";
        }
        return state.chPlatform || "Windows";
      },
      toJSON: function toJSON() {
        return {
          brands: this.brands,
          mobile: this.mobile,
          platform: this.platform
        };
      },
      getHighEntropyValues: function getHighEntropyValues(hints) {
        if (!state.enabled || state.whitelisted) {
          return originalUAData ? originalUAData.getHighEntropyValues(hints) : Promise.resolve({});
        }
        return Promise.resolve({
          brands: state.brands,
          mobile: false,
          platform: state.chPlatform,
          platformVersion: state.chPlatformVersion || "15.0.0",
          architecture: state.architecture || "x86",
          bitness: state.bitness || "64",
          model: "",
          fullVersionList: state.brands.map(b => ({ brand: b.brand, version: b.version + ".0.0.0" }))
        });
      }
    };

    makeNative(mockUAData.toJSON, 'toJSON');
    makeNative(mockUAData.getHighEntropyValues, 'getHighEntropyValues');

    defineStealthGetter(Navigator.prototype, 'userAgentData', () => mockUAData, Navigator);
  }

  // -------------------------------------------------------------
  // 3. SCREEN & DISPLAY METRICS CLOAK
  // -------------------------------------------------------------
  defineStealthGetter(Screen.prototype, 'width', () => state.screenWidth, Screen);
  defineStealthGetter(Screen.prototype, 'height', () => state.screenHeight, Screen);
  defineStealthGetter(Screen.prototype, 'availWidth', () => state.availWidth, Screen);
  defineStealthGetter(Screen.prototype, 'availHeight', () => state.availHeight, Screen);
  defineStealthGetter(Screen.prototype, 'colorDepth', () => state.colorDepth || 24, Screen);
  defineStealthGetter(Screen.prototype, 'pixelDepth', () => state.colorDepth || 24, Screen);

  // window.devicePixelRatio
  try {
    const originalDprDescriptor = Object.getOwnPropertyDescriptor(window, 'devicePixelRatio');
    const dprGetter = function() {
      if (!state.enabled || state.whitelisted) {
        return originalDprDescriptor && originalDprDescriptor.get ? originalDprDescriptor.get.call(window) : 1;
      }
      return state.dpr || 1.0;
    };
    makeNative(dprGetter, 'devicePixelRatio', true);
    Object.defineProperty(window, 'devicePixelRatio', {
      get: dprGetter,
      configurable: true,
      enumerable: true
    });
  } catch (e) {}

  // -------------------------------------------------------------
  // 4. TIMEZONE & DATE SYNCHRONIZATION
  // -------------------------------------------------------------
  const originalGetTimezoneOffset = Date.prototype.getTimezoneOffset;
  const originalResolvedOptions = Intl.DateTimeFormat.prototype.resolvedOptions;
  const originalDateToString = Date.prototype.toString;
  const originalToTimeString = Date.prototype.toTimeString;
  const originalToLocaleString = Date.prototype.toLocaleString;
  const originalToLocaleTimeString = Date.prototype.toLocaleTimeString;
  const originalToLocaleDateString = Date.prototype.toLocaleDateString;

  // Capture real host timezone at initialization
  let realHostTimezone = 'UTC';
  try {
    realHostTimezone = originalResolvedOptions.call(new Intl.DateTimeFormat()).timeZone;
  } catch (e) {}

  // Date.prototype.getTimezoneOffset
  Date.prototype.getTimezoneOffset = makeNative(function getTimezoneOffset() {
    if (!state.enabled || state.whitelisted) {
      return originalGetTimezoneOffset.apply(this, arguments);
    }
    return state.offset; // returns target offset in minutes
  }, 'getTimezoneOffset');

  // Intl.DateTimeFormat.prototype.resolvedOptions
  Intl.DateTimeFormat.prototype.resolvedOptions = makeNative(function resolvedOptions() {
    const options = originalResolvedOptions.apply(this, arguments);
    if (!state.enabled || state.whitelisted) return options;
    options.timeZone = state.timezone;
    options.locale = state.locale;
    return options;
  }, 'resolvedOptions');

  // Helper to format date string to target timezone
  function formatWithSpoofedTimezone(date, includeTime = true, includeDate = true) {
    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: state.timezone,
        weekday: includeDate ? 'short' : undefined,
        month: includeDate ? 'short' : undefined,
        day: includeDate ? '2-digit' : undefined,
        year: includeDate ? 'numeric' : undefined,
        hour: includeTime ? '2-digit' : undefined,
        minute: includeTime ? '2-digit' : undefined,
        second: includeTime ? '2-digit' : undefined,
        hour12: false
      });
      const parts = formatter.formatToParts(date);
      const map = {};
      parts.forEach(p => map[p.type] = p.value);

      // Format offset sign and padding e.g. GMT-0400
      const totalMinutes = -state.offset;
      const sign = totalMinutes >= 0 ? '+' : '-';
      const absMin = Math.abs(totalMinutes);
      const hrs = String(Math.floor(absMin / 60)).padStart(2, '0');
      const mins = String(absMin % 60).padStart(2, '0');
      const offsetStr = `GMT${sign}${hrs}${mins} (${state.timezoneAbbr || 'Standard Time'})`;

      if (includeDate && includeTime) {
        return `${map.weekday} ${map.month} ${map.day} ${map.year} ${map.hour}:${map.minute}:${map.second} ${offsetStr}`;
      } else if (includeTime) {
        return `${map.hour}:${map.minute}:${map.second} ${offsetStr}`;
      }
    } catch (e) {}
    return originalDateToString.call(date);
  }

  Date.prototype.toString = makeNative(function toString() {
    if (!state.enabled || state.whitelisted) return originalDateToString.apply(this, arguments);
    return formatWithSpoofedTimezone(this, true, true);
  }, 'toString');

  Date.prototype.toTimeString = makeNative(function toTimeString() {
    if (!state.enabled || state.whitelisted) return originalToTimeString.apply(this, arguments);
    return formatWithSpoofedTimezone(this, true, false);
  }, 'toTimeString');

  Date.prototype.toLocaleString = makeNative(function toLocaleString(locales, options) {
    if (!state.enabled || state.whitelisted) return originalToLocaleString.apply(this, arguments);
    const opts = Object.assign({}, options);
    if (!opts.timeZone) opts.timeZone = state.timezone;
    return originalToLocaleString.call(this, locales || state.locale, opts);
  }, 'toLocaleString');

  Date.prototype.toLocaleDateString = makeNative(function toLocaleDateString(locales, options) {
    if (!state.enabled || state.whitelisted) return originalToLocaleDateString.apply(this, arguments);
    const opts = Object.assign({}, options);
    if (!opts.timeZone) opts.timeZone = state.timezone;
    return originalToLocaleDateString.call(this, locales || state.locale, opts);
  }, 'toLocaleDateString');

  Date.prototype.toLocaleTimeString = makeNative(function toLocaleTimeString(locales, options) {
    if (!state.enabled || state.whitelisted) return originalToLocaleTimeString.apply(this, arguments);
    const opts = Object.assign({}, options);
    if (!opts.timeZone) opts.timeZone = state.timezone;
    return originalToLocaleTimeString.call(this, locales || state.locale, opts);
  }, 'toLocaleTimeString');

  // -------------------------------------------------------------
  // 5. GEOLOCATION SYNCHRONIZATION
  // -------------------------------------------------------------
  if (navigator.geolocation) {
    const mockCoordinates = () => ({
      latitude: state.lat + (Math.sin(state.lat) * 0.0001),
      longitude: state.lon + (Math.cos(state.lon) * 0.0001),
      accuracy: 25.0,
      altitude: 15.0,
      altitudeAccuracy: 5.0,
      heading: null,
      speed: null
    });

    const originalGetCurrentPosition = navigator.geolocation.getCurrentPosition;
    navigator.geolocation.getCurrentPosition = makeNative(function getCurrentPosition(success, error, options) {
      if (!state.enabled || state.whitelisted) {
        return originalGetCurrentPosition.apply(this, arguments);
      }
      setTimeout(() => {
        if (typeof success === 'function') {
          success({
            coords: mockCoordinates(),
            timestamp: Date.now()
          });
        }
      }, 30);
    }, 'getCurrentPosition');

    const originalWatchPosition = navigator.geolocation.watchPosition;
    navigator.geolocation.watchPosition = makeNative(function watchPosition(success, error, options) {
      if (!state.enabled || state.whitelisted) {
        return originalWatchPosition.apply(this, arguments);
      }
      const watchId = Math.floor(Math.random() * 100000);
      setTimeout(() => {
        if (typeof success === 'function') {
          success({
            coords: mockCoordinates(),
            timestamp: Date.now()
          });
        }
      }, 30);
      return watchId;
    }, 'watchPosition');
  }

  // -------------------------------------------------------------
  // 6. WEBGL GPU UNMASKED VENDOR & RENDERER
  // -------------------------------------------------------------
  const UNMASKED_VENDOR_WEBGL = 0x9245;
  const UNMASKED_RENDERER_WEBGL = 0x9246;

  function hookWebGL(glProto) {
    if (!glProto) return;

    if (glProto.getParameter) {
      const originalGetParameter = glProto.getParameter;
      glProto.getParameter = makeNative(function getParameter(param) {
        if (!state.enabled || state.whitelisted) {
          return originalGetParameter.apply(this, arguments);
        }
        if (param === UNMASKED_VENDOR_WEBGL) {
          return state.gpuVendor || "Google Inc. (NVIDIA)";
        }
        if (param === UNMASKED_RENDERER_WEBGL) {
          return state.gpuRenderer || "ANGLE (NVIDIA, NVIDIA GeForce RTX 4080 Direct3D11 vs_5_0 ps_5_0, D3D11)";
        }
        return originalGetParameter.apply(this, arguments);
      }, 'getParameter');
    }

    if (glProto.getExtension) {
      const originalGetExtension = glProto.getExtension;
      glProto.getExtension = makeNative(function getExtension(name) {
        if (!state.enabled || state.whitelisted) {
          return originalGetExtension.apply(this, arguments);
        }
        if (name === 'WEBGL_debug_renderer_info') {
          return {
            UNMASKED_VENDOR_WEBGL: UNMASKED_VENDOR_WEBGL,
            UNMASKED_RENDERER_WEBGL: UNMASKED_RENDERER_WEBGL
          };
        }
        return originalGetExtension.apply(this, arguments);
      }, 'getExtension');
    }

    if (glProto.getSupportedExtensions) {
      const originalGetSupportedExtensions = glProto.getSupportedExtensions;
      glProto.getSupportedExtensions = makeNative(function getSupportedExtensions() {
        const list = originalGetSupportedExtensions.apply(this, arguments) || [];
        if (!state.enabled || state.whitelisted) return list;
        if (!list.includes('WEBGL_debug_renderer_info')) {
          return [...list, 'WEBGL_debug_renderer_info'];
        }
        return list;
      }, 'getSupportedExtensions');
    }
  }

  if (typeof WebGLRenderingContext !== 'undefined') {
    hookWebGL(WebGLRenderingContext.prototype);
  }
  if (typeof WebGL2RenderingContext !== 'undefined') {
    hookWebGL(WebGL2RenderingContext.prototype);
  }

  // -------------------------------------------------------------
  // 7. SPEECH SYNTHESIS VOICES HARMONIZATION
  // -------------------------------------------------------------
  if (typeof window.speechSynthesis !== 'undefined') {
    const originalGetVoices = window.speechSynthesis.getVoices;

    window.speechSynthesis.getVoices = makeNative(function getVoices() {
      if (!state.enabled || state.whitelisted) {
        return originalGetVoices.apply(this, arguments);
      }

      // Check OS voice profile
      const isMac = state.platform.includes('Mac');
      const isWin = state.platform.includes('Win');
      
      const mockVoices = isMac ? [
        { name: "Samantha", lang: "en-US", default: true, localService: true, voiceURI: "Samantha" },
        { name: "Alex", lang: "en-US", default: false, localService: true, voiceURI: "Alex" },
        { name: "Victoria", lang: "en-US", default: false, localService: true, voiceURI: "Victoria" },
        { name: "Fred", lang: "en-US", default: false, localService: true, voiceURI: "Fred" },
        { name: "Daniel", lang: "en-GB", default: false, localService: true, voiceURI: "Daniel" }
      ] : isWin ? [
        { name: "Microsoft David - English (United States)", lang: "en-US", default: true, localService: true, voiceURI: "Microsoft David" },
        { name: "Microsoft Zira - English (United States)", lang: "en-US", default: false, localService: true, voiceURI: "Microsoft Zira" },
        { name: "Microsoft Mark - English (United States)", lang: "en-US", default: false, localService: true, voiceURI: "Microsoft Mark" }
      ] : [
        { name: "Google US English", lang: "en-US", default: true, localService: false, voiceURI: "Google US English" },
        { name: "Google UK English Female", lang: "en-GB", default: false, localService: false, voiceURI: "Google UK English Female" }
      ];

      return mockVoices;
    }, 'getVoices');
  }

  // -------------------------------------------------------------
  // 8. MEDIA DEVICES HARMONIZATION
  // -------------------------------------------------------------
  if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
    const originalEnumerateDevices = navigator.mediaDevices.enumerateDevices;

    navigator.mediaDevices.enumerateDevices = makeNative(function enumerateDevices() {
      if (!state.enabled || state.whitelisted) {
        return originalEnumerateDevices.apply(this, arguments);
      }
      // Standard clean peripheral set (1 mic, 1 camera, 1 output)
      return Promise.resolve([
        { deviceId: "default", kind: "audioinput", label: "", groupId: "group-audio-default" },
        { deviceId: "comm-mic-id", kind: "audioinput", label: "", groupId: "group-audio-ext" },
        { deviceId: "default", kind: "audiooutput", label: "", groupId: "group-audio-default" },
        { deviceId: "video-cam-id", kind: "videoinput", label: "", groupId: "group-video-default" }
      ]);
    }, 'enumerateDevices');
  }

  // -------------------------------------------------------------
  // 9. DETERMINISTIC SEEDED CANVAS NOISE
  // -------------------------------------------------------------
  // Hash function for origin-based deterministic noise (zero frame flutter)
  function getDeterministicSeed(originStr) {
    let hash = 0;
    const str = originStr || window.location.host || 'default-seed';
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  const originSeed = getDeterministicSeed(window.location.host);

  if (typeof HTMLCanvasElement !== 'undefined') {
    const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;

    HTMLCanvasElement.prototype.toDataURL = makeNative(function toDataURL(type, quality) {
      if (!state.enabled || state.whitelisted || !state.canvasNoise) {
        return originalToDataURL.apply(this, arguments);
      }

      // If canvas is microscopic or purely zero dimension, don't modify
      if (this.width === 0 || this.height === 0) {
        return originalToDataURL.apply(this, arguments);
      }

      try {
        const ctx = this.getContext('2d');
        if (ctx) {
          // Read a single pixel at deterministically chosen coordinate
          const x = (originSeed % Math.max(1, this.width));
          const y = ((originSeed >> 3) % Math.max(1, this.height));
          const imgData = ctx.getImageData(x, y, 1, 1);
          // Modulate lowest significant bit deterministically
          imgData.data[0] = (imgData.data[0] ^ (originSeed & 1));
          ctx.putImageData(imgData, x, y);
        }
      } catch (e) {}

      return originalToDataURL.apply(this, arguments);
    }, 'toDataURL');
  }

  // -------------------------------------------------------------
  // 10. AUDIO CONTEXT DETERMINISTIC JITTER
  // -------------------------------------------------------------
  if (typeof AudioBuffer !== 'undefined') {
    const originalGetChannelData = AudioBuffer.prototype.getChannelData;

    AudioBuffer.prototype.getChannelData = makeNative(function getChannelData(channel) {
      const data = originalGetChannelData.apply(this, arguments);
      if (!state.enabled || state.whitelisted || !state.audioNoise) return data;

      // Deterministic microscopic math salt on first sample
      if (data && data.length > 0) {
        const delta = (originSeed % 100) * 0.00000001;
        data[0] = data[0] + delta;
      }
      return data;
    }, 'getChannelData');
  }

  // -------------------------------------------------------------
  // 11. DYNAMIC STATE SYNCHRONIZATION LISTENER
  // -------------------------------------------------------------
  document.addEventListener('__CLOAK_STATE_UPDATE__', function(e) {
    if (e.detail) {
      Object.assign(state, e.detail);
      try {
        sessionStorage.setItem('__cloak_sync_cache__', JSON.stringify(state));
      } catch (err) {}
    }
  });

  // Signal isolated world that main world engine is active and ready
  document.dispatchEvent(new CustomEvent('__CLOAK_ENGINE_READY__'));

})();
