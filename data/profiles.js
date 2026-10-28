/**
 * UmbraShark - Curated Flat Stealth Presets Database
 * Fully coherent, cross-vector verified browser identities.
 */

(function(root) {
  'use strict';

  // 1. TIMEZONE PRESETS (36+ Global Metros with IANA ID, UTC offset in minutes, city, lat/lon, locale)
  const TIMEZONE_PRESETS = [
    { id: "America/New_York", label: "New York (EDT/EST, UTC-4)", offset: 240, abbr: "EDT", city: "New York", country: "United States", lat: 40.7128, lon: -74.0060, defaultLocale: "en-US" },
    { id: "America/Chicago", label: "Chicago (CDT/CST, UTC-5)", offset: 300, abbr: "CDT", city: "Chicago", country: "United States", lat: 41.8781, lon: -87.6298, defaultLocale: "en-US" },
    { id: "America/Denver", label: "Denver (MDT/MST, UTC-6)", offset: 360, abbr: "MDT", city: "Denver", country: "United States", lat: 39.7392, lon: -104.9903, defaultLocale: "en-US" },
    { id: "America/Los_Angeles", label: "Los Angeles (PDT/PST, UTC-7)", offset: 420, abbr: "PDT", city: "Los Angeles", country: "United States", lat: 34.0522, lon: -118.2437, defaultLocale: "en-US" },
    { id: "America/Toronto", label: "Toronto (EDT, UTC-4)", offset: 240, abbr: "EDT", city: "Toronto", country: "Canada", lat: 43.6532, lon: -79.3832, defaultLocale: "en-CA" },
    { id: "America/Vancouver", label: "Vancouver (PDT, UTC-7)", offset: 420, abbr: "PDT", city: "Vancouver", country: "Canada", lat: 49.2827, lon: -123.1207, defaultLocale: "en-CA" },
    { id: "Europe/London", label: "London (BST/GMT, UTC+1)", offset: -60, abbr: "BST", city: "London", country: "United Kingdom", lat: 51.5074, lon: -0.1278, defaultLocale: "en-GB" },
    { id: "Europe/Paris", label: "Paris (CEST/CET, UTC+2)", offset: -120, abbr: "CEST", city: "Paris", country: "France", lat: 48.8566, lon: 2.3522, defaultLocale: "fr-FR" },
    { id: "Europe/Berlin", label: "Berlin (CEST/CET, UTC+2)", offset: -120, abbr: "CEST", city: "Berlin", country: "Germany", lat: 52.5200, lon: 13.4050, defaultLocale: "de-DE" },
    { id: "Europe/Amsterdam", label: "Amsterdam (CEST, UTC+2)", offset: -120, abbr: "CEST", city: "Amsterdam", country: "Netherlands", lat: 52.3676, lon: 4.9041, defaultLocale: "nl-NL" },
    { id: "Europe/Brussels", label: "Brussels (CEST, UTC+2)", offset: -120, abbr: "CEST", city: "Brussels", country: "Belgium", lat: 50.8503, lon: 4.3517, defaultLocale: "fr-BE" },
    { id: "Europe/Madrid", label: "Madrid (CEST, UTC+2)", offset: -120, abbr: "CEST", city: "Madrid", country: "Spain", lat: 40.4168, lon: -3.7038, defaultLocale: "es-ES" },
    { id: "Europe/Rome", label: "Rome (CEST, UTC+2)", offset: -120, abbr: "CEST", city: "Rome", country: "Italy", lat: 41.9028, lon: 12.4964, defaultLocale: "it-IT" },
    { id: "Europe/Zurich", label: "Zurich (CEST, UTC+2)", offset: -120, abbr: "CEST", city: "Zurich", country: "Switzerland", lat: 47.3769, lon: 8.5417, defaultLocale: "de-CH" },
    { id: "Europe/Stockholm", label: "Stockholm (CEST, UTC+2)", offset: -120, abbr: "CEST", city: "Stockholm", country: "Sweden", lat: 59.3293, lon: 18.0686, defaultLocale: "sv-SE" },
    { id: "Europe/Warsaw", label: "Warsaw (CEST, UTC+2)", offset: -120, abbr: "CEST", city: "Warsaw", country: "Poland", lat: 52.2297, lon: 21.0122, defaultLocale: "pl-PL" },
    { id: "Europe/Vienna", label: "Vienna (CEST, UTC+2)", offset: -120, abbr: "CEST", city: "Vienna", country: "Austria", lat: 48.2082, lon: 16.3738, defaultLocale: "de-AT" },
    { id: "Europe/Dublin", label: "Dublin (IST/GMT, UTC+1)", offset: -60, abbr: "IST", city: "Dublin", country: "Ireland", lat: 53.3498, lon: -6.2603, defaultLocale: "en-IE" },
    { id: "Europe/Oslo", label: "Oslo (CEST, UTC+2)", offset: -120, abbr: "CEST", city: "Oslo", country: "Norway", lat: 59.9139, lon: 10.7522, defaultLocale: "nb-NO" },
    { id: "Europe/Helsinki", label: "Helsinki (EEST, UTC+3)", offset: -180, abbr: "EEST", city: "Helsinki", country: "Finland", lat: 60.1699, lon: 24.9384, defaultLocale: "fi-FI" },
    { id: "Europe/Athens", label: "Athens (EEST, UTC+3)", offset: -180, abbr: "EEST", city: "Athens", country: "Greece", lat: 37.9838, lon: 23.7275, defaultLocale: "el-GR" },
    { id: "Asia/Tokyo", label: "Tokyo (JST, UTC+9)", offset: -540, abbr: "JST", city: "Tokyo", country: "Japan", lat: 35.6762, lon: 139.6503, defaultLocale: "ja-JP" },
    { id: "Asia/Seoul", label: "Seoul (KST, UTC+9)", offset: -540, abbr: "KST", city: "Seoul", country: "South Korea", lat: 37.5665, lon: 126.9780, defaultLocale: "ko-KR" },
    { id: "Asia/Singapore", label: "Singapore (SGT, UTC+8)", offset: -480, abbr: "SGT", city: "Singapore", country: "Singapore", lat: 1.3521, lon: 103.8198, defaultLocale: "en-SG" },
    { id: "Asia/Hong_Kong", label: "Hong Kong (HKT, UTC+8)", offset: -480, abbr: "HKT", city: "Hong Kong", country: "Hong Kong", lat: 22.3193, lon: 114.1694, defaultLocale: "zh-HK" },
    { id: "Asia/Taipei", label: "Taipei (CST, UTC+8)", offset: -480, abbr: "CST", city: "Taipei", country: "Taiwan", lat: 25.0330, lon: 121.5654, defaultLocale: "zh-TW" },
    { id: "Asia/Shanghai", label: "Shanghai (CST, UTC+8)", offset: -480, abbr: "CST", city: "Shanghai", country: "China", lat: 31.2304, lon: 121.4737, defaultLocale: "zh-CN" },
    { id: "Asia/Dubai", label: "Dubai (GST, UTC+4)", offset: -240, abbr: "GST", city: "Dubai", country: "United Arab Emirates", lat: 25.2048, lon: 55.2708, defaultLocale: "en-AE" },
    { id: "Asia/Bangkok", label: "Bangkok (ICT, UTC+7)", offset: -420, abbr: "ICT", city: "Bangkok", country: "Thailand", lat: 13.7563, lon: 100.5018, defaultLocale: "th-TH" },
    { id: "Asia/Kolkata", label: "Mumbai / Kolkata (IST, UTC+5:30)", offset: -330, abbr: "IST", city: "Mumbai", country: "India", lat: 19.0760, lon: 72.8777, defaultLocale: "en-IN" },
    { id: "Australia/Sydney", label: "Sydney (AEST/AEDT, UTC+10)", offset: -600, abbr: "AEST", city: "Sydney", country: "Australia", lat: -33.8688, lon: 151.2093, defaultLocale: "en-AU" },
    { id: "Australia/Melbourne", label: "Melbourne (AEST, UTC+10)", offset: -600, abbr: "AEST", city: "Melbourne", country: "Australia", lat: -37.8136, lon: 144.9631, defaultLocale: "en-AU" },
    { id: "Pacific/Auckland", label: "Auckland (NZST/NZDT, UTC+12)", offset: -720, abbr: "NZST", city: "Auckland", country: "New Zealand", lat: -36.8485, lon: 174.7633, defaultLocale: "en-NZ" },
    { id: "America/Sao_Paulo", label: "São Paulo (BRT, UTC-3)", offset: 180, abbr: "BRT", city: "São Paulo", country: "Brazil", lat: -23.5505, lon: -46.6333, defaultLocale: "pt-BR" },
    { id: "America/Buenos_Aires", label: "Buenos Aires (ART, UTC-3)", offset: 180, abbr: "ART", city: "Buenos Aires", country: "Argentina", lat: -34.6037, lon: -58.3816, defaultLocale: "es-AR" },
    { id: "America/Mexico_City", label: "Mexico City (CST, UTC-6)", offset: 360, abbr: "CST", city: "Mexico City", country: "Mexico", lat: 19.4326, lon: -99.1332, defaultLocale: "es-MX" },
    { id: "Africa/Johannesburg", label: "Johannesburg (SAST, UTC+2)", offset: -120, abbr: "SAST", city: "Johannesburg", country: "South Africa", lat: -26.2041, lon: 28.0473, defaultLocale: "en-ZA" }
  ];

  // 2. LANGUAGE & KEYBOARD / LOCALE PRESETS (25+ authentic combinations)
  const LANGUAGE_PRESETS = [
    { code: "en-US", label: "English (US) - en-US, en", languages: ["en-US", "en"], acceptLanguage: "en-US,en;q=0.9" },
    { code: "en-GB", label: "English (UK) - en-GB, en", languages: ["en-GB", "en", "en-US"], acceptLanguage: "en-GB,en;q=0.9,en-US;q=0.8" },
    { code: "en-CA", label: "English (Canada) - en-CA, en", languages: ["en-CA", "en", "en-US"], acceptLanguage: "en-CA,en;q=0.9,en-US;q=0.8" },
    { code: "en-AU", label: "English (Australia) - en-AU, en", languages: ["en-AU", "en", "en-US"], acceptLanguage: "en-AU,en;q=0.9,en-US;q=0.8" },
    { code: "de-DE", label: "German (Germany) - de-DE, de, en", languages: ["de-DE", "de", "en-US", "en"], acceptLanguage: "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7" },
    { code: "fr-FR", label: "French (France) - fr-FR, fr, en", languages: ["fr-FR", "fr", "en-US", "en"], acceptLanguage: "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7" },
    { code: "es-ES", label: "Spanish (Spain) - es-ES, es, en", languages: ["es-ES", "es", "en-US", "en"], acceptLanguage: "es-ES,es;q=0.9,en-US;q=0.8,en;q=0.7" },
    { code: "es-MX", label: "Spanish (Mexico) - es-MX, es, en", languages: ["es-MX", "es", "en-US", "en"], acceptLanguage: "es-MX,es;q=0.9,en-US;q=0.8,en;q=0.7" },
    { code: "it-IT", label: "Italian (Italy) - it-IT, it, en", languages: ["it-IT", "it", "en-US", "en"], acceptLanguage: "it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7" },
    { code: "pt-BR", label: "Portuguese (Brazil) - pt-BR, pt, en", languages: ["pt-BR", "pt", "en-US", "en"], acceptLanguage: "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7" },
    { code: "nl-NL", label: "Dutch (Netherlands) - nl-NL, nl, en", languages: ["nl-NL", "nl", "en-US", "en"], acceptLanguage: "nl-NL,nl;q=0.9,en-US;q=0.8,en;q=0.7" },
    { code: "ja-JP", label: "Japanese (Japan) - ja-JP, ja, en", languages: ["ja-JP", "ja", "en-US", "en"], acceptLanguage: "ja,ja-JP;q=0.9,en-US;q=0.8,en;q=0.7" },
    { code: "ko-KR", label: "Korean (South Korea) - ko-KR, ko, en", languages: ["ko-KR", "ko", "en-US", "en"], acceptLanguage: "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7" },
    { code: "zh-CN", label: "Chinese (Simplified) - zh-CN, zh, en", languages: ["zh-CN", "zh", "en-US", "en"], acceptLanguage: "zh-CN,zh;q=0.9,en;q=0.8" },
    { code: "zh-TW", label: "Chinese (Traditional) - zh-TW, zh, en", languages: ["zh-TW", "zh", "en-US", "en"], acceptLanguage: "zh-TW,zh;q=0.9,en;q=0.8" },
    { code: "sv-SE", label: "Swedish (Sweden) - sv-SE, sv, en", languages: ["sv-SE", "sv", "en-US", "en"], acceptLanguage: "sv-SE,sv;q=0.9,en-US;q=0.8,en;q=0.7" },
    { code: "pl-PL", label: "Polish (Poland) - pl-PL, pl, en", languages: ["pl-PL", "pl", "en-US", "en"], acceptLanguage: "pl-PL,pl;q=0.9,en-US;q=0.8,en;q=0.7" },
    { code: "ru-RU", label: "Russian (Russia) - ru-RU, ru, en", languages: ["ru-RU", "ru", "en-US", "en"], acceptLanguage: "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7" },
    { code: "tr-TR", label: "Turkish (Turkey) - tr-TR, tr, en", languages: ["tr-TR", "tr", "en-US", "en"], acceptLanguage: "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7" },
    { code: "ar-SA", label: "Arabic (Saudi Arabia) - ar-SA, ar, en", languages: ["ar-SA", "ar", "en-US", "en"], acceptLanguage: "ar-SA,ar;q=0.9,en-US;q=0.8,en;q=0.7" },
    { code: "el-GR", label: "Greek (Greece) - el-GR, el, en", languages: ["el-GR", "el", "en-US", "en"], acceptLanguage: "el-GR,el;q=0.9,en-US;q=0.8,en;q=0.7" },
    { code: "cs-CZ", label: "Czech (Czechia) - cs-CZ, cs, en", languages: ["cs-CZ", "cs", "en-US", "en"], acceptLanguage: "cs-CZ,cs;q=0.9,en-US;q=0.8,en;q=0.7" },
    { code: "da-DK", label: "Danish (Denmark) - da-DK, da, en", languages: ["da-DK", "da", "en-US", "en"], acceptLanguage: "da-DK,da;q=0.9,en-US;q=0.8,en;q=0.7" },
    { code: "fi-FI", label: "Finnish (Finland) - fi-FI, fi, en", languages: ["fi-FI", "fi", "en-US", "en"], acceptLanguage: "fi-FI,fi;q=0.9,en-US;q=0.8,en;q=0.7" },
    { code: "no-NO", label: "Norwegian (Norway) - no-NO, no, en", languages: ["no-NO", "no", "en-US", "en"], acceptLanguage: "no-NO,no;q=0.9,en-US;q=0.8,en;q=0.7" }
  ];

  // 3. SCREEN RESOLUTION PRESETS (sample displays)
  const SCREEN_PRESETS = [
    {
      "label": "2560 x 1440 (QHD 1440p Gaming / Pro Display)",
      "width": 2560,
      "height": 1440,
      "availWidth": 2560,
      "availHeight": 1400,
      "dpr": 1,
      "colorDepth": 24
    },
    {
      "label": "1728 x 1117 (MacBook Pro 16\" M2/M3 Retina, DPR 2)",
      "width": 1728,
      "height": 1117,
      "availWidth": 1728,
      "availHeight": 1092,
      "dpr": 2,
      "colorDepth": 30
    },
    {
      "label": "1920 x 1200 (WUXGA 16:10 Business Display)",
      "width": 1920,
      "height": 1200,
      "availWidth": 1920,
      "availHeight": 1152,
      "dpr": 1,
      "colorDepth": 24
    }
  ];

  // 4. WEBGL GPU VENDOR & RENDERER PRESETS (sample GPU strings)
  const GPU_PRESETS = [
    {
      "label": "NVIDIA GeForce RTX 4080 (Direct3D11 - Windows)",
      "os": "Windows",
      "vendor": "Google Inc. (NVIDIA)",
      "renderer": "ANGLE (NVIDIA, NVIDIA GeForce RTX 4080 Direct3D11 vs_5_0 ps_5_0, D3D11)"
    },
    {
      "label": "Apple M3 Max (Metal - macOS Sonoma)",
      "os": "MacIntel",
      "vendor": "Apple Inc.",
      "renderer": "ANGLE (Apple, ANGLE Metal Renderer: Apple M3 Max, Version 14.5 (Build 23F79))"
    },
    {
      "label": "AMD Radeon RX 6700 XT (Mesa / Linux)",
      "os": "Linux x86_64",
      "vendor": "Mesa/X.org",
      "renderer": "AMD Radeon RX 6700 XT (radeonsi, navi22, LLVM 17.0.6, DRM 3.57)"
    }
  ];

  // 5. HARDWARE CONCURRENCY & MEMORY PRESETS
  const CPU_PRESETS = [4, 6, 8, 12, 16, 24, 32];
  const MEMORY_PRESETS = [4, 8];

  // 7. USER AGENT SAMPLE LIST (three historical configuration samples)
  const USER_AGENT_PRESETS = [
    {
      "label": "Chrome 126 on Windows 11 (64-bit)",
      "ua": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
      "browser": "Chrome",
      "browserVersion": "126.0.0.0",
      "os": "Windows",
      "osVersion": "15.0.0",
      "platform": "Win32",
      "chPlatform": "Windows",
      "brands": [
        {
          "brand": "Not/A)Brand",
          "version": "8"
        },
        {
          "brand": "Chromium",
          "version": "126"
        },
        {
          "brand": "Google Chrome",
          "version": "126"
        }
      ]
    },
    {
      "label": "Chrome 126 on macOS Sonoma (Apple Silicon)",
      "ua": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
      "browser": "Chrome",
      "browserVersion": "126.0.0.0",
      "os": "macOS",
      "osVersion": "14.5.0",
      "platform": "MacIntel",
      "chPlatform": "macOS",
      "brands": [
        {
          "brand": "Not/A)Brand",
          "version": "8"
        },
        {
          "brand": "Chromium",
          "version": "126"
        },
        {
          "brand": "Google Chrome",
          "version": "126"
        }
      ]
    },
    {
      "label": "Chrome 126 on Ubuntu Linux (x86_64)",
      "ua": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
      "browser": "Chrome",
      "browserVersion": "126.0.0.0",
      "os": "Linux",
      "osVersion": "6.8.0",
      "platform": "Linux x86_64",
      "chPlatform": "Linux",
      "brands": [
        {
          "brand": "Not/A)Brand",
          "version": "8"
        },
        {
          "brand": "Chromium",
          "version": "126"
        },
        {
          "brand": "Google Chrome",
          "version": "126"
        }
      ]
    }
  ];

  // 8. FULL COHERENT IDENTITY PERSONAS (three configuration samples)
  const IDENTITY_PRESETS = [
    {
      "id": "win11-chrome-rtx4080-ny",
      "name": "Windows sample · America/New_York",
      "os": "Windows",
      "platform": "Win32",
      "chPlatform": "Windows",
      "chPlatformVersion": "15.0.0",
      "architecture": "x86",
      "bitness": "64",
      "ua": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
      "brands": [
        {
          "brand": "Not/A)Brand",
          "version": "8"
        },
        {
          "brand": "Chromium",
          "version": "126"
        },
        {
          "brand": "Google Chrome",
          "version": "126"
        }
      ],
      "gpuVendor": "Google Inc. (NVIDIA)",
      "gpuRenderer": "ANGLE (NVIDIA, NVIDIA GeForce RTX 4080 Direct3D11 vs_5_0 ps_5_0, D3D11)",
      "cores": 16,
      "memory": 8,
      "screenWidth": 2560,
      "screenHeight": 1440,
      "availWidth": 2560,
      "availHeight": 1400,
      "dpr": 1,
      "colorDepth": 24,
      "timezone": "America/New_York",
      "locale": "en-US",
      "languages": [
        "en-US",
        "en"
      ],
      "acceptLanguage": "en-US,en;q=0.9",
      "lat": 40.7128,
      "lon": -74.006
    },
    {
      "id": "mac-m3max-chrome-tokyo",
      "name": "macOS sample · Asia/Tokyo",
      "os": "macOS",
      "platform": "MacIntel",
      "chPlatform": "macOS",
      "chPlatformVersion": "14.5.0",
      "architecture": "arm",
      "bitness": "64",
      "ua": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
      "brands": [
        {
          "brand": "Not/A)Brand",
          "version": "8"
        },
        {
          "brand": "Chromium",
          "version": "126"
        },
        {
          "brand": "Google Chrome",
          "version": "126"
        }
      ],
      "gpuVendor": "Apple Inc.",
      "gpuRenderer": "ANGLE (Apple, ANGLE Metal Renderer: Apple M3 Max, Version 14.5 (Build 23F79))",
      "cores": 16,
      "memory": 8,
      "screenWidth": 1728,
      "screenHeight": 1117,
      "availWidth": 1728,
      "availHeight": 1092,
      "dpr": 2,
      "colorDepth": 30,
      "timezone": "Asia/Tokyo",
      "locale": "ja-JP",
      "languages": [
        "ja-JP",
        "ja",
        "en-US",
        "en"
      ],
      "acceptLanguage": "ja,ja-JP;q=0.9,en-US;q=0.8,en;q=0.7",
      "lat": 35.6762,
      "lon": 139.6503
    },
    {
      "id": "linux-thinkpad-chrome-frankfurt",
      "name": "Linux sample · Europe/Berlin",
      "os": "Linux",
      "platform": "Linux x86_64",
      "chPlatform": "Linux",
      "chPlatformVersion": "6.8.0",
      "architecture": "x86",
      "bitness": "64",
      "ua": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
      "brands": [
        {
          "brand": "Not/A)Brand",
          "version": "8"
        },
        {
          "brand": "Chromium",
          "version": "126"
        },
        {
          "brand": "Google Chrome",
          "version": "126"
        }
      ],
      "gpuVendor": "Mesa/X.org",
      "gpuRenderer": "AMD Radeon RX 6700 XT (radeonsi, navi22, LLVM 17.0.6, DRM 3.57)",
      "cores": 8,
      "memory": 8,
      "screenWidth": 1920,
      "screenHeight": 1200,
      "availWidth": 1920,
      "availHeight": 1152,
      "dpr": 1,
      "colorDepth": 24,
      "timezone": "Europe/Berlin",
      "locale": "de-DE",
      "languages": [
        "de-DE",
        "de",
        "en-US",
        "en"
      ],
      "acceptLanguage": "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7",
      "lat": 50.1109,
      "lon": 8.6821
    }
  ];

  // Mathematical exact offset and abbreviation calculator (DST-aware)
  function calculateExactTimezoneOffset(timezoneId, date = new Date()) {
    try {
      // Numeric wall-clock parts avoid reparsing locale strings in the host timezone.
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: timezoneId, year: 'numeric', era: 'short', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
      }).formatToParts(date);
      const values = Object.fromEntries(parts.map(p => [p.type, p.value]));
      const wall = new Date(0);
      wall.setUTCFullYear(values.era === 'BC' ? 1 - Number(values.year) : Number(values.year), +values.month - 1, +values.day);
      wall.setUTCHours(+values.hour, +values.minute, +values.second, 0);
      return (Math.floor(date.getTime() / 1000) * 1000 - wall.getTime()) / 60000;
    } catch (e) {
      return 0;
    }
  }

  function getTimezoneAbbr(timezoneId, date = new Date()) {
    try {
      const parts = new Intl.DateTimeFormat('en-US', { timeZone: timezoneId, timeZoneName: 'short' }).formatToParts(date);
      const tzPart = parts.find(p => p.type === 'timeZoneName');
      return tzPart ? tzPart.value : 'GMT';
    } catch (e) {
      return 'GMT';
    }
  }

  // Identity samples omit offsets in the data; resolve them for the current date.
  IDENTITY_PRESETS.forEach(profile => {
    profile.offset = calculateExactTimezoneOffset(profile.timezone);
    profile.timezoneAbbr = getTimezoneAbbr(profile.timezone);
  });

  // Export to global scope
  const CLOAK_PRESETS = {
    TIMEZONE_PRESETS,
    LANGUAGE_PRESETS,
    SCREEN_PRESETS,
    GPU_PRESETS,
    CPU_PRESETS,
    MEMORY_PRESETS,
    USER_AGENT_PRESETS,
    IDENTITY_PRESETS,
    DEFAULT_PROFILE: IDENTITY_PRESETS[0],
    calculateExactTimezoneOffset,
    getTimezoneAbbr
  };

  root.CLOAK_PRESETS = CLOAK_PRESETS;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = CLOAK_PRESETS;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
