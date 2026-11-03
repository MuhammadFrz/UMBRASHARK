/**
 * UmbraShark - Curated Flat Stealth Presets Database
 * Fully coherent, cross-vector verified browser and device identities.
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

  // 3. SCREEN RESOLUTION PRESETS (Desktop, Samsung Galaxy, Google Pixel, iOS / iPadOS)
  const SCREEN_PRESETS = [
    {
      label: "2560 x 1440 (QHD 1440p Gaming / Pro Display)",
      width: 2560, height: 1440, availWidth: 2560, availHeight: 1400, dpr: 1, colorDepth: 24
    },
    {
      label: "1728 x 1117 (MacBook Pro 16\" M3/M4 Retina, DPR 2)",
      width: 1728, height: 1117, availWidth: 1728, availHeight: 1092, dpr: 2, colorDepth: 30
    },
    {
      label: "1920 x 1200 (WUXGA 16:10 Business Display)",
      width: 1920, height: 1200, availWidth: 1920, availHeight: 1152, dpr: 1, colorDepth: 24
    },
    {
      label: "3840 x 2160 (4K UHD Studio Display, DPR 2)",
      width: 3840, height: 2160, availWidth: 3840, availHeight: 2120, dpr: 2, colorDepth: 30
    },
    {
      label: "1920 x 1080 (Full HD 1080p Desktop / Laptop)",
      width: 1920, height: 1080, availWidth: 1920, availHeight: 1040, dpr: 1, colorDepth: 24
    },
    {
      label: "412 x 915 (Samsung Galaxy S25 Ultra / S24 Ultra, DPR 3.5)",
      width: 412, height: 915, availWidth: 412, availHeight: 867, dpr: 3.5, colorDepth: 24
    },
    {
      label: "384 x 832 (Samsung Galaxy S25+ / S24+, DPR 3.75)",
      width: 384, height: 832, availWidth: 384, availHeight: 784, dpr: 3.75, colorDepth: 24
    },
    {
      label: "360 x 780 (Samsung Galaxy S25 / S24, DPR 3)",
      width: 360, height: 780, availWidth: 360, availHeight: 732, dpr: 3, colorDepth: 24
    },
    {
      label: "690 x 828 (Samsung Galaxy Z Fold6 Main Display, DPR 2.625)",
      width: 690, height: 828, availWidth: 690, availHeight: 780, dpr: 2.625, colorDepth: 24
    },
    {
      label: "448 x 998 (Google Pixel 10 Pro XL / 9 Pro XL, DPR 3)",
      width: 448, height: 998, availWidth: 448, availHeight: 950, dpr: 3, colorDepth: 24
    },
    {
      label: "427 x 952 (Google Pixel 10 Pro / 9 Pro, DPR 3)",
      width: 427, height: 952, availWidth: 427, availHeight: 904, dpr: 3, colorDepth: 24
    },
    {
      label: "412 x 923 (Google Pixel 10 / Pixel 9, DPR 2.625)",
      width: 412, height: 923, availWidth: 412, availHeight: 875, dpr: 2.625, colorDepth: 24
    },
    {
      label: "440 x 956 (iPhone 17 Pro Max / 16 Pro Max, DPR 3)",
      width: 440, height: 956, availWidth: 440, availHeight: 956, dpr: 3, colorDepth: 32
    },
    {
      label: "402 x 874 (iPhone 17 Pro / 16 Pro, DPR 3)",
      width: 402, height: 874, availWidth: 402, availHeight: 874, dpr: 3, colorDepth: 32
    },
    {
      label: "393 x 852 (iPhone 16 / iPhone 15 Pro, DPR 3)",
      width: 393, height: 852, availWidth: 393, availHeight: 852, dpr: 3, colorDepth: 32
    },
    {
      label: "1032 x 1376 (iPad Pro 13\" M4 Tandem OLED, DPR 2)",
      width: 1032, height: 1376, availWidth: 1032, availHeight: 1376, dpr: 2, colorDepth: 32
    }
  ];

  // 4. WEBGL GPU VENDOR & RENDERER PRESETS (Desktop, Samsung, Pixel, Apple iOS/macOS)
  const GPU_PRESETS = [
    {
      label: "NVIDIA GeForce RTX 4080 (Direct3D11 - Windows)",
      os: "Windows",
      vendor: "Google Inc. (NVIDIA)",
      renderer: "ANGLE (NVIDIA, NVIDIA GeForce RTX 4080 Direct3D11 vs_5_0 ps_5_0, D3D11)"
    },
    {
      label: "NVIDIA GeForce RTX 4090 (Direct3D11 - Windows)",
      os: "Windows",
      vendor: "Google Inc. (NVIDIA)",
      renderer: "ANGLE (NVIDIA, NVIDIA GeForce RTX 4090 Direct3D11 vs_5_0 ps_5_0, D3D11)"
    },
    {
      label: "Apple M3 Max (Metal - macOS Sonoma)",
      os: "MacIntel",
      vendor: "Apple Inc.",
      renderer: "ANGLE (Apple, ANGLE Metal Renderer: Apple M3 Max, Version 14.5 (Build 23F79))"
    },
    {
      label: "Apple M4 Max (Metal - macOS Sequoia)",
      os: "MacIntel",
      vendor: "Apple Inc.",
      renderer: "ANGLE (Apple, ANGLE Metal Renderer: Apple M4 Max, Version 15.4 (Build 24E248))"
    },
    {
      label: "AMD Radeon RX 6700 XT (Mesa / Linux)",
      os: "Linux x86_64",
      vendor: "Mesa/X.org",
      renderer: "AMD Radeon RX 6700 XT (radeonsi, navi22, LLVM 17.0.6, DRM 3.57)"
    },
    {
      label: "Qualcomm Adreno (TM) 830 (Samsung Galaxy S25 Series)",
      os: "Android",
      vendor: "Qualcomm",
      renderer: "Adreno (TM) 830"
    },
    {
      label: "Qualcomm Adreno (TM) 750 (Samsung Galaxy S24 / Z Fold6)",
      os: "Android",
      vendor: "Qualcomm",
      renderer: "Adreno (TM) 750"
    },
    {
      label: "Imagination PowerVR DXT-48-1536 (Google Pixel 10 Tensor G5)",
      os: "Android",
      vendor: "Imagination Technologies",
      renderer: "PowerVR DXT-48-1536"
    },
    {
      label: "ARM Mali-G715 (Google Pixel 9 Tensor G4)",
      os: "Android",
      vendor: "ARM",
      renderer: "Mali-G715"
    },
    {
      label: "Apple GPU (iPhone / iPad - iOS & iPadOS)",
      os: "iOS",
      vendor: "Apple Inc.",
      renderer: "Apple GPU"
    }
  ];

  // 5. HARDWARE CONCURRENCY & MEMORY PRESETS
  const CPU_PRESETS = [2, 4, 6, 8, 10, 12, 14, 16, 24, 32];
  const MEMORY_PRESETS = [2, 4, 6, 8];

  // 6. DEVICE HARDWARE & OS PRESETS (Samsung, Google Pixel, Apple iOS/iPadOS, Desktop)
  const DEVICE_PRESETS = [
    {
      id: "samsung-s25-ultra",
      label: "Samsung Galaxy S25 Ultra (SM-S938B · Android 15)",
      category: "Samsung",
      deviceName: "Samsung Galaxy S25 Ultra",
      os: "Android",
      platform: "Linux armv81",
      chPlatform: "Android",
      chPlatformVersion: "15.0.0",
      architecture: "arm",
      bitness: "64",
      model: "SM-S938B",
      mobile: true,
      maxTouchPoints: 5,
      cores: 8,
      memory: 8,
      screenWidth: 412,
      screenHeight: 915,
      availWidth: 412,
      availHeight: 867,
      dpr: 3.5,
      colorDepth: 24,
      gpuVendor: "Qualcomm",
      gpuRenderer: "Adreno (TM) 830",
      defaultBrowser: "Chrome Mobile",
      defaultBrowserVersion: "136.0.0.0"
    },
    {
      id: "samsung-s25-plus",
      label: "Samsung Galaxy S25+ (SM-S936B · Android 15)",
      category: "Samsung",
      deviceName: "Samsung Galaxy S25+",
      os: "Android",
      platform: "Linux armv81",
      chPlatform: "Android",
      chPlatformVersion: "15.0.0",
      architecture: "arm",
      bitness: "64",
      model: "SM-S936B",
      mobile: true,
      maxTouchPoints: 5,
      cores: 8,
      memory: 8,
      screenWidth: 384,
      screenHeight: 832,
      availWidth: 384,
      availHeight: 784,
      dpr: 3.75,
      colorDepth: 24,
      gpuVendor: "Qualcomm",
      gpuRenderer: "Adreno (TM) 830",
      defaultBrowser: "Samsung Internet",
      defaultBrowserVersion: "28.0"
    },
    {
      id: "samsung-s24-ultra",
      label: "Samsung Galaxy S24 Ultra (SM-S928B · Android 15)",
      category: "Samsung",
      deviceName: "Samsung Galaxy S24 Ultra",
      os: "Android",
      platform: "Linux armv81",
      chPlatform: "Android",
      chPlatformVersion: "15.0.0",
      architecture: "arm",
      bitness: "64",
      model: "SM-S928B",
      mobile: true,
      maxTouchPoints: 5,
      cores: 8,
      memory: 8,
      screenWidth: 412,
      screenHeight: 915,
      availWidth: 412,
      availHeight: 867,
      dpr: 3.5,
      colorDepth: 24,
      gpuVendor: "Qualcomm",
      gpuRenderer: "Adreno (TM) 750",
      defaultBrowser: "Chrome Mobile",
      defaultBrowserVersion: "136.0.0.0"
    },
    {
      id: "samsung-z-fold6",
      label: "Samsung Galaxy Z Fold6 (SM-F956B · Android 15)",
      category: "Samsung",
      deviceName: "Samsung Galaxy Z Fold6",
      os: "Android",
      platform: "Linux armv81",
      chPlatform: "Android",
      chPlatformVersion: "15.0.0",
      architecture: "arm",
      bitness: "64",
      model: "SM-F956B",
      mobile: true,
      maxTouchPoints: 5,
      cores: 8,
      memory: 8,
      screenWidth: 690,
      screenHeight: 828,
      availWidth: 690,
      availHeight: 780,
      dpr: 2.625,
      colorDepth: 24,
      gpuVendor: "Qualcomm",
      gpuRenderer: "Adreno (TM) 750",
      defaultBrowser: "Chrome Mobile",
      defaultBrowserVersion: "136.0.0.0"
    },
    {
      id: "pixel-10-pro-xl",
      label: "Google Pixel 10 Pro XL (Android 16)",
      category: "Google Pixel",
      deviceName: "Google Pixel 10 Pro XL",
      os: "Android",
      platform: "Linux armv81",
      chPlatform: "Android",
      chPlatformVersion: "16.0.0",
      architecture: "arm",
      bitness: "64",
      model: "Pixel 10 Pro XL",
      mobile: true,
      maxTouchPoints: 5,
      cores: 8,
      memory: 8,
      screenWidth: 448,
      screenHeight: 998,
      availWidth: 448,
      availHeight: 950,
      dpr: 3,
      colorDepth: 24,
      gpuVendor: "Imagination Technologies",
      gpuRenderer: "PowerVR DXT-48-1536",
      defaultBrowser: "Chrome Mobile",
      defaultBrowserVersion: "136.0.0.0"
    },
    {
      id: "pixel-9-pro-xl",
      label: "Google Pixel 9 Pro XL (Android 15)",
      category: "Google Pixel",
      deviceName: "Google Pixel 9 Pro XL",
      os: "Android",
      platform: "Linux armv81",
      chPlatform: "Android",
      chPlatformVersion: "15.0.0",
      architecture: "arm",
      bitness: "64",
      model: "Pixel 9 Pro XL",
      mobile: true,
      maxTouchPoints: 5,
      cores: 8,
      memory: 8,
      screenWidth: 448,
      screenHeight: 998,
      availWidth: 448,
      availHeight: 950,
      dpr: 3,
      colorDepth: 24,
      gpuVendor: "ARM",
      gpuRenderer: "Mali-G715",
      defaultBrowser: "Chrome Mobile",
      defaultBrowserVersion: "136.0.0.0"
    },
    {
      id: "pixel-9-pro",
      label: "Google Pixel 9 Pro (Android 15)",
      category: "Google Pixel",
      deviceName: "Google Pixel 9 Pro",
      os: "Android",
      platform: "Linux armv81",
      chPlatform: "Android",
      chPlatformVersion: "15.0.0",
      architecture: "arm",
      bitness: "64",
      model: "Pixel 9 Pro",
      mobile: true,
      maxTouchPoints: 5,
      cores: 8,
      memory: 8,
      screenWidth: 427,
      screenHeight: 952,
      availWidth: 427,
      availHeight: 904,
      dpr: 3,
      colorDepth: 24,
      gpuVendor: "ARM",
      gpuRenderer: "Mali-G715",
      defaultBrowser: "Chrome Mobile",
      defaultBrowserVersion: "136.0.0.0"
    },
    {
      id: "pixel-9",
      label: "Google Pixel 9 (Android 15)",
      category: "Google Pixel",
      deviceName: "Google Pixel 9",
      os: "Android",
      platform: "Linux armv81",
      chPlatform: "Android",
      chPlatformVersion: "15.0.0",
      architecture: "arm",
      bitness: "64",
      model: "Pixel 9",
      mobile: true,
      maxTouchPoints: 5,
      cores: 8,
      memory: 8,
      screenWidth: 412,
      screenHeight: 923,
      availWidth: 412,
      availHeight: 875,
      dpr: 2.625,
      colorDepth: 24,
      gpuVendor: "ARM",
      gpuRenderer: "Mali-G715",
      defaultBrowser: "Chrome Mobile",
      defaultBrowserVersion: "136.0.0.0"
    },
    {
      id: "iphone-17-pro-max",
      label: "iPhone 17 Pro Max (iOS 19.0)",
      category: "Apple iOS",
      deviceName: "iPhone 17 Pro Max",
      os: "iOS",
      platform: "iPhone",
      chPlatform: "iOS",
      chPlatformVersion: "19.0.0",
      architecture: "arm",
      bitness: "64",
      model: "iPhone",
      mobile: true,
      maxTouchPoints: 5,
      cores: 6,
      memory: 8,
      screenWidth: 440,
      screenHeight: 956,
      availWidth: 440,
      availHeight: 956,
      dpr: 3,
      colorDepth: 32,
      gpuVendor: "Apple Inc.",
      gpuRenderer: "Apple GPU",
      defaultBrowser: "Safari Mobile",
      defaultBrowserVersion: "19.0"
    },
    {
      id: "iphone-16-pro-max",
      label: "iPhone 16 Pro Max (iOS 18.4)",
      category: "Apple iOS",
      deviceName: "iPhone 16 Pro Max",
      os: "iOS",
      platform: "iPhone",
      chPlatform: "iOS",
      chPlatformVersion: "18.4.0",
      architecture: "arm",
      bitness: "64",
      model: "iPhone",
      mobile: true,
      maxTouchPoints: 5,
      cores: 6,
      memory: 8,
      screenWidth: 440,
      screenHeight: 956,
      availWidth: 440,
      availHeight: 956,
      dpr: 3,
      colorDepth: 32,
      gpuVendor: "Apple Inc.",
      gpuRenderer: "Apple GPU",
      defaultBrowser: "Safari Mobile",
      defaultBrowserVersion: "18.4"
    },
    {
      id: "iphone-16-pro",
      label: "iPhone 16 Pro (iOS 18.4)",
      category: "Apple iOS",
      deviceName: "iPhone 16 Pro",
      os: "iOS",
      platform: "iPhone",
      chPlatform: "iOS",
      chPlatformVersion: "18.4.0",
      architecture: "arm",
      bitness: "64",
      model: "iPhone",
      mobile: true,
      maxTouchPoints: 5,
      cores: 6,
      memory: 8,
      screenWidth: 402,
      screenHeight: 874,
      availWidth: 402,
      availHeight: 874,
      dpr: 3,
      colorDepth: 32,
      gpuVendor: "Apple Inc.",
      gpuRenderer: "Apple GPU",
      defaultBrowser: "Safari Mobile",
      defaultBrowserVersion: "18.4"
    },
    {
      id: "ipad-pro-m4",
      label: "iPad Pro 13\" M4 (iPadOS 18.4)",
      category: "Apple iPadOS",
      deviceName: "iPad Pro 13\" M4",
      os: "iPadOS",
      platform: "iPad",
      chPlatform: "iOS",
      chPlatformVersion: "18.4.0",
      architecture: "arm",
      bitness: "64",
      model: "iPad",
      mobile: false,
      maxTouchPoints: 5,
      cores: 8,
      memory: 8,
      screenWidth: 1032,
      screenHeight: 1376,
      availWidth: 1032,
      availHeight: 1376,
      dpr: 2,
      colorDepth: 32,
      gpuVendor: "Apple Inc.",
      gpuRenderer: "Apple GPU",
      defaultBrowser: "Safari Mobile",
      defaultBrowserVersion: "18.4"
    },
    {
      id: "win11-desktop-rtx4080",
      label: "Windows 11 Workstation (RTX 4080 · 1440p)",
      category: "Desktop",
      deviceName: "Windows 11 Workstation",
      os: "Windows",
      platform: "Win32",
      chPlatform: "Windows",
      chPlatformVersion: "15.0.0",
      architecture: "x86",
      bitness: "64",
      model: "",
      mobile: false,
      maxTouchPoints: 0,
      cores: 16,
      memory: 8,
      screenWidth: 2560,
      screenHeight: 1440,
      availWidth: 2560,
      availHeight: 1400,
      dpr: 1,
      colorDepth: 24,
      gpuVendor: "Google Inc. (NVIDIA)",
      gpuRenderer: "ANGLE (NVIDIA, NVIDIA GeForce RTX 4080 Direct3D11 vs_5_0 ps_5_0, D3D11)",
      defaultBrowser: "Chrome",
      defaultBrowserVersion: "136.0.0.0"
    },
    {
      id: "macbook-pro-m4max",
      label: "MacBook Pro 16\" Apple M4 Max (macOS Sequoia 15.4)",
      category: "Desktop",
      deviceName: "MacBook Pro 16\" M4 Max",
      os: "macOS",
      platform: "MacIntel",
      chPlatform: "macOS",
      chPlatformVersion: "15.4.0",
      architecture: "arm",
      bitness: "64",
      model: "",
      mobile: false,
      maxTouchPoints: 0,
      cores: 16,
      memory: 8,
      screenWidth: 1728,
      screenHeight: 1117,
      availWidth: 1728,
      availHeight: 1092,
      dpr: 2,
      colorDepth: 30,
      gpuVendor: "Apple Inc.",
      gpuRenderer: "ANGLE (Apple, ANGLE Metal Renderer: Apple M4 Max, Version 15.4 (Build 24E248))",
      defaultBrowser: "Chrome",
      defaultBrowserVersion: "136.0.0.0"
    },
    {
      id: "linux-thinkpad-x1",
      label: "ThinkPad X1 Carbon (Ubuntu Linux · x86_64)",
      category: "Desktop",
      deviceName: "ThinkPad X1 Carbon",
      os: "Linux",
      platform: "Linux x86_64",
      chPlatform: "Linux",
      chPlatformVersion: "6.8.0",
      architecture: "x86",
      bitness: "64",
      model: "",
      mobile: false,
      maxTouchPoints: 0,
      cores: 8,
      memory: 8,
      screenWidth: 1920,
      screenHeight: 1200,
      availWidth: 1920,
      availHeight: 1152,
      dpr: 1,
      colorDepth: 24,
      gpuVendor: "Mesa/X.org",
      gpuRenderer: "AMD Radeon RX 6700 XT (radeonsi, navi22, LLVM 17.0.6, DRM 3.57)",
      defaultBrowser: "Chrome",
      defaultBrowserVersion: "136.0.0.0"
    }
  ];

  // 7. USER AGENT & BROWSER PRESETS (Desktop, Samsung, Pixel, iOS/iPadOS)
  const USER_AGENT_PRESETS = [
    {
      label: "Chrome 126 on Windows 11 (64-bit)",
      ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
      browser: "Chrome",
      browserVersion: "126.0.0.0",
      vendor: "Google Inc.",
      os: "Windows",
      osVersion: "15.0.0",
      platform: "Win32",
      chPlatform: "Windows",
      mobile: false,
      model: "",
      brands: [
        { brand: "Not/A)Brand", version: "8" },
        { brand: "Chromium", version: "126" },
        { brand: "Google Chrome", version: "126" }
      ]
    },
    {
      label: "Chrome 126 on macOS Sonoma (Apple Silicon)",
      ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
      browser: "Chrome",
      browserVersion: "126.0.0.0",
      vendor: "Google Inc.",
      os: "macOS",
      osVersion: "14.5.0",
      platform: "MacIntel",
      chPlatform: "macOS",
      mobile: false,
      model: "",
      brands: [
        { brand: "Not/A)Brand", version: "8" },
        { brand: "Chromium", version: "126" },
        { brand: "Google Chrome", version: "126" }
      ]
    },
    {
      label: "Chrome 126 on Ubuntu Linux (x86_64)",
      ua: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
      browser: "Chrome",
      browserVersion: "126.0.0.0",
      vendor: "Google Inc.",
      os: "Linux",
      osVersion: "6.8.0",
      platform: "Linux x86_64",
      chPlatform: "Linux",
      mobile: false,
      model: "",
      brands: [
        { brand: "Not/A)Brand", version: "8" },
        { brand: "Chromium", version: "126" },
        { brand: "Google Chrome", version: "126" }
      ]
    },
    {
      label: "Chrome 136 on Windows 11 (64-bit)",
      ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
      browser: "Chrome",
      browserVersion: "136.0.0.0",
      vendor: "Google Inc.",
      os: "Windows",
      osVersion: "15.0.0",
      platform: "Win32",
      chPlatform: "Windows",
      mobile: false,
      model: "",
      brands: [
        { brand: "Not/A)Brand", version: "8" },
        { brand: "Chromium", version: "136" },
        { brand: "Google Chrome", version: "136" }
      ]
    },
    {
      label: "Microsoft Edge 136 on Windows 11 (64-bit)",
      ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36 Edg/136.0.0.0",
      browser: "Edge",
      browserVersion: "136.0.0.0",
      vendor: "Google Inc.",
      os: "Windows",
      osVersion: "15.0.0",
      platform: "Win32",
      chPlatform: "Windows",
      mobile: false,
      model: "",
      brands: [
        { brand: "Not/A)Brand", version: "8" },
        { brand: "Chromium", version: "136" },
        { brand: "Microsoft Edge", version: "136" }
      ]
    },
    {
      label: "Firefox 137 on Windows 11 (64-bit)",
      ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0",
      browser: "Firefox",
      browserVersion: "137.0",
      vendor: "",
      os: "Windows",
      osVersion: "15.0.0",
      platform: "Win32",
      chPlatform: "Windows",
      mobile: false,
      model: "",
      brands: [
        { brand: "Not/A)Brand", version: "8" },
        { brand: "Firefox", version: "137" }
      ]
    },
    {
      label: "Chrome 136 on macOS Sequoia (Apple Silicon)",
      ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
      browser: "Chrome",
      browserVersion: "136.0.0.0",
      vendor: "Google Inc.",
      os: "macOS",
      osVersion: "15.4.0",
      platform: "MacIntel",
      chPlatform: "macOS",
      mobile: false,
      model: "",
      brands: [
        { brand: "Not/A)Brand", version: "8" },
        { brand: "Chromium", version: "136" },
        { brand: "Google Chrome", version: "136" }
      ]
    },
    {
      label: "Safari 18.4 on macOS Sequoia (Apple Silicon)",
      ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Safari/605.1.15",
      browser: "Safari",
      browserVersion: "18.4",
      vendor: "Apple Computer, Inc.",
      os: "macOS",
      osVersion: "15.4.0",
      platform: "MacIntel",
      chPlatform: "macOS",
      mobile: false,
      model: "",
      brands: [
        { brand: "Not/A)Brand", version: "8" },
        { brand: "Apple Safari", version: "18" }
      ]
    },
    {
      label: "Chrome 136 Mobile on Samsung Galaxy S25 Ultra (Android 15)",
      ua: "Mozilla/5.0 (Linux; Android 15; SM-S938B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Mobile Safari/537.36",
      browser: "Chrome Mobile",
      browserVersion: "136.0.0.0",
      vendor: "Google Inc.",
      os: "Android",
      osVersion: "15.0.0",
      platform: "Linux armv81",
      chPlatform: "Android",
      mobile: true,
      model: "SM-S938B",
      brands: [
        { brand: "Not/A)Brand", version: "8" },
        { brand: "Chromium", version: "136" },
        { brand: "Google Chrome", version: "136" }
      ]
    },
    {
      label: "Samsung Internet 28.0 on Samsung Galaxy S25 Ultra (Android 15)",
      ua: "Mozilla/5.0 (Linux; Android 15; SM-S938B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/28.0 Chrome/130.0.0.0 Mobile Safari/537.36",
      browser: "Samsung Internet",
      browserVersion: "28.0",
      vendor: "Google Inc.",
      os: "Android",
      osVersion: "15.0.0",
      platform: "Linux armv81",
      chPlatform: "Android",
      mobile: true,
      model: "SM-S938B",
      brands: [
        { brand: "Not/A)Brand", version: "8" },
        { brand: "Chromium", version: "130" },
        { brand: "Samsung Internet", version: "28" }
      ]
    },
    {
      label: "Chrome 136 Mobile on Samsung Galaxy S24 Ultra (Android 15)",
      ua: "Mozilla/5.0 (Linux; Android 15; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Mobile Safari/537.36",
      browser: "Chrome Mobile",
      browserVersion: "136.0.0.0",
      vendor: "Google Inc.",
      os: "Android",
      osVersion: "15.0.0",
      platform: "Linux armv81",
      chPlatform: "Android",
      mobile: true,
      model: "SM-S928B",
      brands: [
        { brand: "Not/A)Brand", version: "8" },
        { brand: "Chromium", version: "136" },
        { brand: "Google Chrome", version: "136" }
      ]
    },
    {
      label: "Chrome 136 Mobile on Google Pixel 10 Pro XL (Android 16)",
      ua: "Mozilla/5.0 (Linux; Android 16; Pixel 10 Pro XL) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Mobile Safari/537.36",
      browser: "Chrome Mobile",
      browserVersion: "136.0.0.0",
      vendor: "Google Inc.",
      os: "Android",
      osVersion: "16.0.0",
      platform: "Linux armv81",
      chPlatform: "Android",
      mobile: true,
      model: "Pixel 10 Pro XL",
      brands: [
        { brand: "Not/A)Brand", version: "8" },
        { brand: "Chromium", version: "136" },
        { brand: "Google Chrome", version: "136" }
      ]
    },
    {
      label: "Chrome 136 Mobile on Google Pixel 9 Pro XL (Android 15)",
      ua: "Mozilla/5.0 (Linux; Android 15; Pixel 9 Pro XL) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Mobile Safari/537.36",
      browser: "Chrome Mobile",
      browserVersion: "136.0.0.0",
      vendor: "Google Inc.",
      os: "Android",
      osVersion: "15.0.0",
      platform: "Linux armv81",
      chPlatform: "Android",
      mobile: true,
      model: "Pixel 9 Pro XL",
      brands: [
        { brand: "Not/A)Brand", version: "8" },
        { brand: "Chromium", version: "136" },
        { brand: "Google Chrome", version: "136" }
      ]
    },
    {
      label: "Safari 19.0 Mobile on iPhone 17 Pro Max (iOS 19.0)",
      ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 19_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/19.0 Mobile/15E148 Safari/604.1",
      browser: "Safari Mobile",
      browserVersion: "19.0",
      vendor: "Apple Computer, Inc.",
      os: "iOS",
      osVersion: "19.0.0",
      platform: "iPhone",
      chPlatform: "iOS",
      mobile: true,
      model: "iPhone",
      brands: [
        { brand: "Not/A)Brand", version: "8" },
        { brand: "Apple Safari", version: "19" }
      ]
    },
    {
      label: "Safari 18.4 Mobile on iPhone 16 Pro Max (iOS 18.4)",
      ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Mobile/15E148 Safari/604.1",
      browser: "Safari Mobile",
      browserVersion: "18.4",
      vendor: "Apple Computer, Inc.",
      os: "iOS",
      osVersion: "18.4.0",
      platform: "iPhone",
      chPlatform: "iOS",
      mobile: true,
      model: "iPhone",
      brands: [
        { brand: "Not/A)Brand", version: "8" },
        { brand: "Apple Safari", version: "18" }
      ]
    },
    {
      label: "Chrome 136 (CriOS) on iPhone 16 Pro (iOS 18.4)",
      ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/136.0.7103.56 Mobile/15E148 Safari/604.1",
      browser: "Chrome iOS",
      browserVersion: "136.0.7103.56",
      vendor: "Apple Computer, Inc.",
      os: "iOS",
      osVersion: "18.4.0",
      platform: "iPhone",
      chPlatform: "iOS",
      mobile: true,
      model: "iPhone",
      brands: [
        { brand: "Not/A)Brand", version: "8" },
        { brand: "Chromium", version: "136" },
        { brand: "Google Chrome", version: "136" }
      ]
    },
    {
      label: "Safari 18.4 on iPad Pro 13\" M4 (iPadOS 18.4)",
      ua: "Mozilla/5.0 (iPad; CPU OS 18_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Mobile/15E148 Safari/604.1",
      browser: "Safari Mobile",
      browserVersion: "18.4",
      vendor: "Apple Computer, Inc.",
      os: "iPadOS",
      osVersion: "18.4.0",
      platform: "iPad",
      chPlatform: "iOS",
      mobile: false,
      model: "iPad",
      brands: [
        { brand: "Not/A)Brand", version: "8" },
        { brand: "Apple Safari", version: "18" }
      ]
    }
  ];

  // 8. FULL COHERENT IDENTITY PERSONAS (Desktop, Samsung Galaxy, Google Pixel, Apple iOS/iPadOS)
  const IDENTITY_PRESETS = [
    {
      id: "win11-chrome-rtx4080-ny",
      name: "Windows sample · America/New_York",
      deviceName: "Windows 11 Workstation",
      os: "Windows",
      platform: "Win32",
      chPlatform: "Windows",
      chPlatformVersion: "15.0.0",
      architecture: "x86",
      bitness: "64",
      model: "",
      mobile: false,
      maxTouchPoints: 0,
      browserName: "Chrome",
      browserVersion: "126.0.0.0",
      vendor: "Google Inc.",
      ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
      brands: [
        { brand: "Not/A)Brand", version: "8" },
        { brand: "Chromium", version: "126" },
        { brand: "Google Chrome", version: "126" }
      ],
      gpuVendor: "Google Inc. (NVIDIA)",
      gpuRenderer: "ANGLE (NVIDIA, NVIDIA GeForce RTX 4080 Direct3D11 vs_5_0 ps_5_0, D3D11)",
      cores: 16,
      memory: 8,
      screenWidth: 2560,
      screenHeight: 1440,
      availWidth: 2560,
      availHeight: 1400,
      dpr: 1,
      colorDepth: 24,
      timezone: "America/New_York",
      locale: "en-US",
      languages: ["en-US", "en"],
      acceptLanguage: "en-US,en;q=0.9",
      lat: 40.7128,
      lon: -74.006
    },
    {
      id: "mac-m3max-chrome-tokyo",
      name: "macOS sample · Asia/Tokyo",
      deviceName: "MacBook Pro 16\" M3 Max",
      os: "macOS",
      platform: "MacIntel",
      chPlatform: "macOS",
      chPlatformVersion: "14.5.0",
      architecture: "arm",
      bitness: "64",
      model: "",
      mobile: false,
      maxTouchPoints: 0,
      browserName: "Chrome",
      browserVersion: "126.0.0.0",
      vendor: "Google Inc.",
      ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
      brands: [
        { brand: "Not/A)Brand", version: "8" },
        { brand: "Chromium", version: "126" },
        { brand: "Google Chrome", version: "126" }
      ],
      gpuVendor: "Apple Inc.",
      gpuRenderer: "ANGLE (Apple, ANGLE Metal Renderer: Apple M3 Max, Version 14.5 (Build 23F79))",
      cores: 16,
      memory: 8,
      screenWidth: 1728,
      screenHeight: 1117,
      availWidth: 1728,
      availHeight: 1092,
      dpr: 2,
      colorDepth: 30,
      timezone: "Asia/Tokyo",
      locale: "ja-JP",
      languages: ["ja-JP", "ja", "en-US", "en"],
      acceptLanguage: "ja,ja-JP;q=0.9,en-US;q=0.8,en;q=0.7",
      lat: 35.6762,
      lon: 139.6503
    },
    {
      id: "linux-thinkpad-chrome-frankfurt",
      name: "Linux sample · Europe/Berlin",
      deviceName: "ThinkPad X1 Carbon",
      os: "Linux",
      platform: "Linux x86_64",
      chPlatform: "Linux",
      chPlatformVersion: "6.8.0",
      architecture: "x86",
      bitness: "64",
      model: "",
      mobile: false,
      maxTouchPoints: 0,
      browserName: "Chrome",
      browserVersion: "126.0.0.0",
      vendor: "Google Inc.",
      ua: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
      brands: [
        { brand: "Not/A)Brand", version: "8" },
        { brand: "Chromium", version: "126" },
        { brand: "Google Chrome", version: "126" }
      ],
      gpuVendor: "Mesa/X.org",
      gpuRenderer: "AMD Radeon RX 6700 XT (radeonsi, navi22, LLVM 17.0.6, DRM 3.57)",
      cores: 8,
      memory: 8,
      screenWidth: 1920,
      screenHeight: 1200,
      availWidth: 1920,
      availHeight: 1152,
      dpr: 1,
      colorDepth: 24,
      timezone: "Europe/Berlin",
      locale: "de-DE",
      languages: ["de-DE", "de", "en-US", "en"],
      acceptLanguage: "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7",
      lat: 50.1109,
      lon: 8.6821
    },
    {
      id: "samsung-s25ultra-chrome-ny",
      name: "Samsung Galaxy S25 Ultra · Chrome 136 · New York",
      deviceName: "Samsung Galaxy S25 Ultra",
      os: "Android",
      platform: "Linux armv81",
      chPlatform: "Android",
      chPlatformVersion: "15.0.0",
      architecture: "arm",
      bitness: "64",
      model: "SM-S938B",
      mobile: true,
      maxTouchPoints: 5,
      browserName: "Chrome Mobile",
      browserVersion: "136.0.0.0",
      vendor: "Google Inc.",
      ua: "Mozilla/5.0 (Linux; Android 15; SM-S938B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Mobile Safari/537.36",
      brands: [
        { brand: "Not/A)Brand", version: "8" },
        { brand: "Chromium", version: "136" },
        { brand: "Google Chrome", version: "136" }
      ],
      gpuVendor: "Qualcomm",
      gpuRenderer: "Adreno (TM) 830",
      cores: 8,
      memory: 8,
      screenWidth: 412,
      screenHeight: 915,
      availWidth: 412,
      availHeight: 867,
      dpr: 3.5,
      colorDepth: 24,
      timezone: "America/New_York",
      locale: "en-US",
      languages: ["en-US", "en"],
      acceptLanguage: "en-US,en;q=0.9",
      lat: 40.7128,
      lon: -74.006
    },
    {
      id: "samsung-s25ultra-sbrowser-seoul",
      name: "Samsung Galaxy S25 Ultra · Samsung Internet 28 · Seoul",
      deviceName: "Samsung Galaxy S25 Ultra",
      os: "Android",
      platform: "Linux armv81",
      chPlatform: "Android",
      chPlatformVersion: "15.0.0",
      architecture: "arm",
      bitness: "64",
      model: "SM-S938B",
      mobile: true,
      maxTouchPoints: 5,
      browserName: "Samsung Internet",
      browserVersion: "28.0",
      vendor: "Google Inc.",
      ua: "Mozilla/5.0 (Linux; Android 15; SM-S938B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/28.0 Chrome/130.0.0.0 Mobile Safari/537.36",
      brands: [
        { brand: "Not/A)Brand", version: "8" },
        { brand: "Chromium", version: "130" },
        { brand: "Samsung Internet", version: "28" }
      ],
      gpuVendor: "Qualcomm",
      gpuRenderer: "Adreno (TM) 830",
      cores: 8,
      memory: 8,
      screenWidth: 412,
      screenHeight: 915,
      availWidth: 412,
      availHeight: 867,
      dpr: 3.5,
      colorDepth: 24,
      timezone: "Asia/Seoul",
      locale: "ko-KR",
      languages: ["ko-KR", "ko", "en-US", "en"],
      acceptLanguage: "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
      lat: 37.5665,
      lon: 126.978
    },
    {
      id: "samsung-s24ultra-chrome-london",
      name: "Samsung Galaxy S24 Ultra · Chrome 136 · London",
      deviceName: "Samsung Galaxy S24 Ultra",
      os: "Android",
      platform: "Linux armv81",
      chPlatform: "Android",
      chPlatformVersion: "15.0.0",
      architecture: "arm",
      bitness: "64",
      model: "SM-S928B",
      mobile: true,
      maxTouchPoints: 5,
      browserName: "Chrome Mobile",
      browserVersion: "136.0.0.0",
      vendor: "Google Inc.",
      ua: "Mozilla/5.0 (Linux; Android 15; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Mobile Safari/537.36",
      brands: [
        { brand: "Not/A)Brand", version: "8" },
        { brand: "Chromium", version: "136" },
        { brand: "Google Chrome", version: "136" }
      ],
      gpuVendor: "Qualcomm",
      gpuRenderer: "Adreno (TM) 750",
      cores: 8,
      memory: 8,
      screenWidth: 412,
      screenHeight: 915,
      availWidth: 412,
      availHeight: 867,
      dpr: 3.5,
      colorDepth: 24,
      timezone: "Europe/London",
      locale: "en-GB",
      languages: ["en-GB", "en", "en-US"],
      acceptLanguage: "en-GB,en;q=0.9,en-US;q=0.8",
      lat: 51.5074,
      lon: -0.1278
    },
    {
      id: "pixel-10proxl-chrome-ny",
      name: "Google Pixel 10 Pro XL · Chrome 136 · New York",
      deviceName: "Google Pixel 10 Pro XL",
      os: "Android",
      platform: "Linux armv81",
      chPlatform: "Android",
      chPlatformVersion: "16.0.0",
      architecture: "arm",
      bitness: "64",
      model: "Pixel 10 Pro XL",
      mobile: true,
      maxTouchPoints: 5,
      browserName: "Chrome Mobile",
      browserVersion: "136.0.0.0",
      vendor: "Google Inc.",
      ua: "Mozilla/5.0 (Linux; Android 16; Pixel 10 Pro XL) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Mobile Safari/537.36",
      brands: [
        { brand: "Not/A)Brand", version: "8" },
        { brand: "Chromium", version: "136" },
        { brand: "Google Chrome", version: "136" }
      ],
      gpuVendor: "Imagination Technologies",
      gpuRenderer: "PowerVR DXT-48-1536",
      cores: 8,
      memory: 8,
      screenWidth: 448,
      screenHeight: 998,
      availWidth: 448,
      availHeight: 950,
      dpr: 3,
      colorDepth: 24,
      timezone: "America/New_York",
      locale: "en-US",
      languages: ["en-US", "en"],
      acceptLanguage: "en-US,en;q=0.9",
      lat: 40.7128,
      lon: -74.006
    },
    {
      id: "pixel-9proxl-chrome-la",
      name: "Google Pixel 9 Pro XL · Chrome 136 · Los Angeles",
      deviceName: "Google Pixel 9 Pro XL",
      os: "Android",
      platform: "Linux armv81",
      chPlatform: "Android",
      chPlatformVersion: "15.0.0",
      architecture: "arm",
      bitness: "64",
      model: "Pixel 9 Pro XL",
      mobile: true,
      maxTouchPoints: 5,
      browserName: "Chrome Mobile",
      browserVersion: "136.0.0.0",
      vendor: "Google Inc.",
      ua: "Mozilla/5.0 (Linux; Android 15; Pixel 9 Pro XL) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Mobile Safari/537.36",
      brands: [
        { brand: "Not/A)Brand", version: "8" },
        { brand: "Chromium", version: "136" },
        { brand: "Google Chrome", version: "136" }
      ],
      gpuVendor: "ARM",
      gpuRenderer: "Mali-G715",
      cores: 8,
      memory: 8,
      screenWidth: 448,
      screenHeight: 998,
      availWidth: 448,
      availHeight: 950,
      dpr: 3,
      colorDepth: 24,
      timezone: "America/Los_Angeles",
      locale: "en-US",
      languages: ["en-US", "en"],
      acceptLanguage: "en-US,en;q=0.9",
      lat: 34.0522,
      lon: -118.2437
    },
    {
      id: "iphone-17promax-safari-ny",
      name: "iPhone 17 Pro Max · Safari 19.0 · New York",
      deviceName: "iPhone 17 Pro Max",
      os: "iOS",
      platform: "iPhone",
      chPlatform: "iOS",
      chPlatformVersion: "19.0.0",
      architecture: "arm",
      bitness: "64",
      model: "iPhone",
      mobile: true,
      maxTouchPoints: 5,
      browserName: "Safari Mobile",
      browserVersion: "19.0",
      vendor: "Apple Computer, Inc.",
      ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 19_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/19.0 Mobile/15E148 Safari/604.1",
      brands: [
        { brand: "Not/A)Brand", version: "8" },
        { brand: "Apple Safari", version: "19" }
      ],
      gpuVendor: "Apple Inc.",
      gpuRenderer: "Apple GPU",
      cores: 6,
      memory: 8,
      screenWidth: 440,
      screenHeight: 956,
      availWidth: 440,
      availHeight: 956,
      dpr: 3,
      colorDepth: 32,
      timezone: "America/New_York",
      locale: "en-US",
      languages: ["en-US", "en"],
      acceptLanguage: "en-US,en;q=0.9",
      lat: 40.7128,
      lon: -74.006
    },
    {
      id: "iphone-16promax-safari-london",
      name: "iPhone 16 Pro Max · Safari 18.4 · London",
      deviceName: "iPhone 16 Pro Max",
      os: "iOS",
      platform: "iPhone",
      chPlatform: "iOS",
      chPlatformVersion: "18.4.0",
      architecture: "arm",
      bitness: "64",
      model: "iPhone",
      mobile: true,
      maxTouchPoints: 5,
      browserName: "Safari Mobile",
      browserVersion: "18.4",
      vendor: "Apple Computer, Inc.",
      ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Mobile/15E148 Safari/604.1",
      brands: [
        { brand: "Not/A)Brand", version: "8" },
        { brand: "Apple Safari", version: "18" }
      ],
      gpuVendor: "Apple Inc.",
      gpuRenderer: "Apple GPU",
      cores: 6,
      memory: 8,
      screenWidth: 440,
      screenHeight: 956,
      availWidth: 440,
      availHeight: 956,
      dpr: 3,
      colorDepth: 32,
      timezone: "Europe/London",
      locale: "en-GB",
      languages: ["en-GB", "en", "en-US"],
      acceptLanguage: "en-GB,en;q=0.9,en-US;q=0.8",
      lat: 51.5074,
      lon: -0.1278
    },
    {
      id: "ipad-prom4-safari-ny",
      name: "iPad Pro 13\" M4 · Safari 18.4 · New York",
      deviceName: "iPad Pro 13\" M4",
      os: "iPadOS",
      platform: "iPad",
      chPlatform: "iOS",
      chPlatformVersion: "18.4.0",
      architecture: "arm",
      bitness: "64",
      model: "iPad",
      mobile: false,
      maxTouchPoints: 5,
      browserName: "Safari Mobile",
      browserVersion: "18.4",
      vendor: "Apple Computer, Inc.",
      ua: "Mozilla/5.0 (iPad; CPU OS 18_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Mobile/15E148 Safari/604.1",
      brands: [
        { brand: "Not/A)Brand", version: "8" },
        { brand: "Apple Safari", version: "18" }
      ],
      gpuVendor: "Apple Inc.",
      gpuRenderer: "Apple GPU",
      cores: 8,
      memory: 8,
      screenWidth: 1032,
      screenHeight: 1376,
      availWidth: 1032,
      availHeight: 1376,
      dpr: 2,
      colorDepth: 32,
      timezone: "America/New_York",
      locale: "en-US",
      languages: ["en-US", "en"],
      acceptLanguage: "en-US,en;q=0.9",
      lat: 40.7128,
      lon: -74.006
    }
  ];

  /**
   * Build a coherent User-Agent string, navigator.vendor, and Client Hints brands
   * from user-typed or preset device/OS/browser fields.
   */
  function buildBrowserIdentity(options = {}) {
    const browser = String(options.browserName || options.browser || 'Chrome').trim();
    const rawVer = String(options.browserVersion || '136.0.0.0').trim();
    const majorMatch = rawVer.match(/^(\d{1,4})/);
    const major = majorMatch ? majorMatch[1] : '136';
    const fullVer = /^\d+$/.test(rawVer) ? `${rawVer}.0.0.0` : rawVer;
    const os = String(options.os || 'Windows').trim();
    const osVer = String(options.chPlatformVersion || options.osVersion || '15.0.0').trim();
    const osMajor = (osVer.match(/^(\d+)/) || [0, '15'])[1];
    const iosToken = osVer.replace(/\.0$/, '').replace(/\./g, '_') || '18_4';
    const model = String(options.model || '').trim();
    const mobile = Boolean(options.mobile);

    if (/iOS|iPadOS/i.test(os) || options.platform === 'iPhone' || options.platform === 'iPad') {
      const devToken = options.platform === 'iPad' || /iPad/i.test(os) || /iPad/i.test(model)
        ? `iPad; CPU OS ${iosToken} like Mac OS X`
        : `iPhone; CPU iPhone OS ${iosToken} like Mac OS X`;
      if (/Chrome|CriOS/i.test(browser)) {
        return {
          ua: `Mozilla/5.0 (${devToken}) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/${fullVer} Mobile/15E148 Safari/604.1`,
          vendor: 'Apple Computer, Inc.',
          brands: [
            { brand: 'Not/A)Brand', version: '8' },
            { brand: 'Chromium', version: major },
            { brand: 'Google Chrome', version: major }
          ]
        };
      }
      const safariVer = /^\d+(\.\d+)?$/.test(rawVer) ? rawVer : `${osMajor}.0`;
      return {
        ua: `Mozilla/5.0 (${devToken}) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/${safariVer} Mobile/15E148 Safari/604.1`,
        vendor: 'Apple Computer, Inc.',
        brands: [
          { brand: 'Not/A)Brand', version: '8' },
          { brand: 'Apple Safari', version: (safariVer.match(/^(\d+)/) || [0, '18'])[1] }
        ]
      };
    }

    if (/Android/i.test(os) || (options.platform && options.platform.includes('armv8'))) {
      const modelToken = model || 'K';
      const mobileSuffix = mobile !== false ? 'Mobile ' : '';
      if (/Samsung/i.test(browser)) {
        const sbVer = /^\d+(\.\d+)?$/.test(rawVer) ? rawVer : '28.0';
        return {
          ua: `Mozilla/5.0 (Linux; Android ${osMajor}; ${modelToken}) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/${sbVer} Chrome/130.0.0.0 ${mobileSuffix}Safari/537.36`,
          vendor: 'Google Inc.',
          brands: [
            { brand: 'Not/A)Brand', version: '8' },
            { brand: 'Chromium', version: '130' },
            { brand: 'Samsung Internet', version: (sbVer.match(/^(\d+)/) || [0, '28'])[1] }
          ]
        };
      }
      if (/Firefox/i.test(browser)) {
        const ffVer = /^\d+(\.\d+)?$/.test(rawVer) ? rawVer : `${major}.0`;
        return {
          ua: `Mozilla/5.0 (Android ${osMajor}; ${mobile !== false ? 'Mobile' : 'Tablet'}; rv:${ffVer}) Gecko/${ffVer} Firefox/${ffVer}`,
          vendor: '',
          brands: [
            { brand: 'Not/A)Brand', version: '8' },
            { brand: 'Firefox', version: major }
          ]
        };
      }
      return {
        ua: `Mozilla/5.0 (Linux; Android ${osMajor}; ${modelToken}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${fullVer} ${mobileSuffix}Safari/537.36`,
        vendor: 'Google Inc.',
        brands: [
          { brand: 'Not/A)Brand', version: '8' },
          { brand: 'Chromium', version: major },
          { brand: 'Google Chrome', version: major }
        ]
      };
    }

    const sysToken = /macOS|Mac/i.test(os)
      ? 'Macintosh; Intel Mac OS X 10_15_7'
      : /Linux/i.test(os)
      ? 'X11; Linux x86_64'
      : 'Windows NT 10.0; Win64; x64';

    if (/Safari/i.test(browser) && !/Chrome|Chromium|Edg/i.test(browser)) {
      const safVer = /^\d+(\.\d+)?$/.test(rawVer) ? rawVer : '18.4';
      return {
        ua: `Mozilla/5.0 (${sysToken}) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/${safVer} Safari/605.1.15`,
        vendor: 'Apple Computer, Inc.',
        brands: [
          { brand: 'Not/A)Brand', version: '8' },
          { brand: 'Apple Safari', version: (safVer.match(/^(\d+)/) || [0, '18'])[1] }
        ]
      };
    }
    if (/Firefox/i.test(browser)) {
      const ffVer = /^\d+(\.\d+)?$/.test(rawVer) ? rawVer : `${major}.0`;
      return {
        ua: `Mozilla/5.0 (${sysToken}; rv:${ffVer}) Gecko/20100101 Firefox/${ffVer}`,
        vendor: '',
        brands: [
          { brand: 'Not/A)Brand', version: '8' },
          { brand: 'Firefox', version: major }
        ]
      };
    }
    if (/Edge|Edg/i.test(browser)) {
      return {
        ua: `Mozilla/5.0 (${sysToken}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${fullVer} Safari/537.36 Edg/${fullVer}`,
        vendor: 'Google Inc.',
        brands: [
          { brand: 'Not/A)Brand', version: '8' },
          { brand: 'Chromium', version: major },
          { brand: 'Microsoft Edge', version: major }
        ]
      };
    }
    if (/Brave/i.test(browser)) {
      return {
        ua: `Mozilla/5.0 (${sysToken}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${fullVer} Safari/537.36`,
        vendor: 'Google Inc.',
        brands: [
          { brand: 'Not/A)Brand', version: '8' },
          { brand: 'Chromium', version: major },
          { brand: 'Brave', version: major }
        ]
      };
    }
    return {
      ua: `Mozilla/5.0 (${sysToken}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${fullVer} Safari/537.36`,
      vendor: 'Google Inc.',
      brands: [
        { brand: 'Not/A)Brand', version: '8' },
        { brand: 'Chromium', version: major },
        { brand: 'Google Chrome', version: major }
      ]
    };
  }

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
    DEVICE_PRESETS,
    USER_AGENT_PRESETS,
    IDENTITY_PRESETS,
    DEFAULT_PROFILE: IDENTITY_PRESETS[0],
    buildBrowserIdentity,
    calculateExactTimezoneOffset,
    getTimezoneAbbr
  };

  root.CLOAK_PRESETS = CLOAK_PRESETS;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = CLOAK_PRESETS;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
