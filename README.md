# UmbraShark — Flat Stealth Privacy Matrix for Brave Browser

A hardened, undetectable anti-fingerprinting browser extension built with Manifest V3 for Brave and Chromium-based browsers.

Unlike basic user-agent switchers or canvas blockers that trigger bot-detection flags on tools like CreepJS and Cloudflare, **UmbraShark** enforces deep prototype-level stealth and full cross-vector consistency across JavaScript DOM, Client Hints, and HTTP network headers.

---

## Key Features & Evasion Architecture

### 1. Prototype-Level Camouflage (Undetectable Spoofing)
- **Zero Instance Leaks**: Native properties (`userAgent`, `platform`, `languages`, `hardwareConcurrency`, `deviceMemory`) are defined on `Navigator.prototype` rather than the `navigator` instance. `navigator.hasOwnProperty('userAgent')` returns `false` (identical to authentic browsers).
- **Native `Function.prototype.toString` Evasion**: Intercepted getters return `function get userAgent() { [native code] }` and preserve native property descriptor attributes (`configurable: true, enumerable: true, get: fn, set: undefined`).
- **`TypeError: Illegal invocation` Fidelity**: Calling property getters without context (`Navigator.prototype.__lookupGetter__('userAgent').call({})`) throws authentic V8 exceptions.

### 2. Deep Matrix Consistency
- **Synchronized HTTP Network Headers**: Dynamically updates `declarativeNetRequest` rules to synchronize `User-Agent`, `Sec-CH-UA`, `Sec-CH-UA-Mobile`, `Sec-CH-UA-Platform`, and `Accept-Language` headers with the DOM.
- **Mathematical Timezone & Date Alignment**: Synchronizes `Intl.DateTimeFormat().resolvedOptions().timeZone`, `Date.prototype.getTimezoneOffset`, and formatted date strings (`Date.prototype.toString`, `toLocaleString`).
- **Geolocation City Synchronization**: Automatically coordinates `navigator.geolocation` coordinates with the active timezone's metro area.
- **Speech Synthesis Voice Harmonization**: Intercepts `speechSynthesis.getVoices()` to prevent OS font and voice leaks (e.g. Windows Microsoft David vs. Apple Samantha).
- **Media Devices Sanitization**: Eliminates peripheral hardware tracking via `navigator.mediaDevices.enumerateDevices()`.
- **Deterministic Canvas & Audio Entropy**: Origin-salted math noise alters hashes per session without causing erratic frame-to-frame flutter.
- **WebRTC Local IP Shield**: Prevents local `192.168.x.x` leaks using `chrome.privacy.network.webRTCIPHandlingPolicy`.

### 3. Rich Presets Database
- **24+ Turnkey Identity Personas**: Curated, coherent profiles spanning Windows 11/10 (Chrome, Brave, Edge), macOS Sonoma/Ventura (Apple M1/M2/M3 Silicon), and Linux Ubuntu/Arch (AMD/Intel).
- **36+ Global Timezones**: Covering North America, Europe, Asia, Oceania, South America, and Africa.
- **25+ Language & Keyboard Combinations**: Matching `navigator.languages` arrays and `Accept-Language` headers.
- **30+ Browser Versions**: Chrome 122–126, Brave 1.65–1.67, Microsoft Edge 124–126.
- **20+ WebGL GPU Accelerators**: NVIDIA GeForce RTX 4090/4080/3070, Apple Metal M3 Max/M2, AMD Radeon RX 7900/6800, Intel Iris Xe.
- **18+ Display Resolutions**: FHD 1080p, QHD 1440p, 4K UHD, MacBook Pro 14"/16" Retina (DPR 2.0), Ultra-Wide 21:9.

### 4. Dedicated Full-Page Control Center UI
- **One-Click Tab Launch**: Clicking the extension icon in Brave automatically opens `ui/dashboard.html` in a full dedicated tab (no cramped popup).
- **Minimalist Technical Aesthetic**: High-density Swiss devtools dark interface with zero AI-slop graphics.
- **One-Click Auto-Fix Engines**:
  - **Timezone Mathematical Coherence Auto-Fix**: Automatically calculates exact minute offsets (DST-aware) via the IANA timezone database and synchronizes `Intl.DateTimeFormat` with `Date.prototype.getTimezoneOffset`.
  - **WebGL GPU Hardware Auto-Fix**: Dynamically binds authentic GPU vendor and renderer profiles matching the active operating system architecture (Apple Metal on macOS, NVIDIA/Direct3D11 on Windows, Mesa on Linux) and hooks `WEBGL_debug_renderer_info`.
  - **Auto-Fix All Issues**: One-click button in the diagnostics banner to instantly harmonize all vectors.
- **Integrated Diagnostic Test Runner**: Live in-browser verification suite checking prototype integrity, native toString, timezone coherence, canvas stability, and WebGL parameters.
- **Domain Whitelist**: Add domains (e.g., banking, corporate portals) to bypass spoofing seamlessly.

---

## How to Install in Brave Browser

1. Open Brave and navigate to:
   ```
   brave://extensions
   ```
   *(or `chrome://extensions` in Chromium / Chrome)*
2. In the top right corner, enable **Developer mode**.
3. Click the **Load unpacked** button in the top left.
4. Select this directory:
   ```
   ./UMBRASHARK
   ```
5. The extension **"UmbraShark - Flat Stealth Matrix"** is now installed.
6. Click the extension icon in the toolbar to open the full Control Center dashboard.

---

## Verification & Testing

Open the **Diagnostics & Tests** tab (Tab 04) inside the dashboard and click **Run Diagnostics** to execute automated in-browser checks.

You can also test the active profile on live fingerprint verification sites:
- [BrowserLeaks](https://browserleaks.com/javascript)
- [BrowserLeaks WebGL](https://browserleaks.com/webgl)
- [CreepJS Anti-Detect Suite](https://creepjs-fork.vercel.app/)
- [Pixelscan.net](https://pixelscan.net/)
- [Fingerprint.com Demo](https://fingerprint.com/demo/)
