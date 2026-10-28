# UmbraShark — Privacy Controls for Brave and Chromium

UmbraShark is a Manifest V3 browser extension targeting Brave and Chromium-based browsers, with prototype-level fingerprinting hooks, dynamic HTTP header rules, and a full-page control dashboard.

The manifest declares version **1.0.0**. The [changelog](CHANGELOG.md) records the initial release; the [architecture overview](ARCHITECTURE.md) and validation notes below describe the current implementation. Tested behavior and remaining browser limits are stated separately. Undetectability, bot-detection bypass, and full cross-vector consistency are not established.

## Using the Dashboard

1. **Overview**: Review the configured profile. Choose **Detect IP location**, review the approximate location and optional language suggestion, then **Apply to profile**. **Undo alignment** restores the previous profile during that dashboard session.
2. **Profile settings**: Adjust browser, location, language, graphics, and hardware fields, then choose **Save profile**. WebRTC defaults to strict mode; select compatibility mode if strict routing interferes with calls.
3. **Site exceptions**: Add a hostname to bypass supported overrides on that site and its descendant frames. Reload the affected webpages after changing exceptions.
4. **Diagnostics**: Select an open HTTP/HTTPS webpage and choose **Run checks** to inspect that page and its injectable frames. Assertions and informational observations are listed separately.

IP detection contacts a third-party provider only when requested. It does not change your public IP or determine your hardware. See the regional alignment and testing sections for disclosure details.

---

## Key Features & Architecture

### 1. Prototype-Level Hooks

- **Navigator overrides**: `content/stealth_injected.js` defines getters on `Navigator.prototype` for properties including `userAgent`, `platform`, `languages`, `hardwareConcurrency`, and `deviceMemory`.
- **Function representation**: A `Function.prototype.toString` wrapper supplies native-looking strings for registered hooks. This does not establish that the hooks are indistinguishable from native functions.
- **Receiver checks**: Wrapped getters delegate receiver validation to the original native getters. Invalid date receivers and missing audio arguments are covered by browser regression checks; universal native fidelity is not claimed.
- **Content-script integration**: An ISOLATED script requests initialization at `document_start` in each frame. The service worker reads and validates settings, then uses `chrome.scripting` to install the MAIN-world engine into that exact document. Updates use a document-specific authenticated function, not DOM events or page storage. Disabled and whitelisted frames start with native APIs; disabling installed overrides restores original descriptors. Injection is asynchronous: a page's earliest scripts may read native values before initialization. Synchronous first-script alignment is not guaranteed.

### 2. Network Headers, Canvas & Audio

- **Dynamic HTTP header rules**: `background/service_worker.js` atomically replaces `declarativeNetRequest` rules for `User-Agent`, `Sec-CH-UA`, `Sec-CH-UA-Mobile`, `Sec-CH-UA-Platform`, and `Accept-Language`. Whitelisted destinations and initiators are excluded, with frame-tree allow rules and exceptions for already-open whitelisted tabs. Browser tests check actual HTTP headers; arbitrary navigation timing and server behavior are not certified.
- **Canvas and audio hooks**: Canvas 2D `toDataURL()` and `toBlob()` export a modified copy without changing source pixels. Audio noise is applied once per unchanged first sample, reusing the native live view to avoid repeatedly invoking Brave's audio farbling; disabling removes the extension's unchanged modifications without re-entering that native getter. Native browser protection can still affect values. Repeated reads, source preservation, blob stability, and restoration are regression-tested. The seed derives from the origin; this is not per-session randomization or coverage of every fingerprinting API.

### 3. Preset Data

`data/profiles.js` exposes three identity samples for Windows, macOS, and Linux, with corresponding browser, GPU, and display samples plus regional and language options. Their schema, selected page values, Client Hints, and HTTP user-agent headers are regression-tested in Edge. They are historical configuration samples, not certified hardware identities, current browser versions, or proof of compatibility on those operating systems. Existing saved profiles are retained. Language presets do not spoof keyboard layouts.

### 4. Full-Page Control Center

Clicking the extension icon opens or focuses `ui/dashboard.html`. The dashboard provides profile controls, site exceptions, IP alignment, and diagnostics for a selected regular webpage and its frames. **Align timezone & GPU** attempts current timezone-offset recalculation and OS-based GPU preset selection, reports save failures, and reruns the selected page's checks. It does not repair every fingerprinting vector.

## Regional Controls & Limitations

### IP-based regional alignment

In **Overview**, choose **Detect IP location** to request an approximate location from [ipwho.is](https://ipwhois.io/documentation). The provider receives your public IP; lookups happen only when requested. Review the detected country, city, timezone, and suggested locale, then choose **Apply to profile**. This saves the timezone, current offset, and approximate coordinates. Language, `navigator.languages`, and `Accept-Language` are aligned only if the language option is checked. Browser, GPU, and display settings are preserved because IP geolocation cannot infer them.

Use **Undo alignment** to restore the previous profile during the current dashboard session. Previews expire after five minutes; detect again after changing your VPN or connection. Detection alone does not save settings, and provider failures leave the saved profile unchanged. The lookup does not change your public IP or establish an authentic identity. Country-based language suggestions may not match your preferences. Verify applied values on ordinary webpages after reloading them.

The following table states each control's implemented scope, tested behavior, and remaining limits. Passing the documented checks does not certify every browser, network, or website:

| Control | Current scope and required validation |
| --- | --- |
| Timezone/date alignment | Local component constructors, timezone-free ISO/common legacy parsing, local getters/setters, offsets, and formatted date strings use the selected timezone. DST folds choose the earlier instant; gaps shift forward. Explicit offsets, ISO date-only UTC semantics, invalid values, overflow, cloning, and subclasses are regression-tested. Default formatters use the selected timezone while explicit options are preserved. Unsupported browser-specific legacy strings retain native parsing; descriptive timezone names can differ from native Date labels. This is not a claim of universal native equivalence. |
| Geolocation synchronization | City samples and IP alignment set approximate coordinates. Wrappers retain native permission/error handling and watch IDs, substituting coordinates only after a successful native position. Granted/denied permissions and watch cancellation are tested. Continuous alignment after IP changes is not implemented; location access still requires native browser permission. |
| Speech voices | Mock voice lists were removed. Native voice objects, events, and playback remain browser-controlled. No voice or font-leak prevention is claimed. |
| Media devices | Fixed mock devices were removed. Native enumeration, device objects, permissions, and capture remain browser-controlled. No hardware-tracking elimination is claimed. |
| WebRTC policy | Protection defaults to `disable_non_proxied_udp` (strict mode). A compatibility option uses `default_public_interface_only`. Strict mode can affect calls without a suitable proxy/relay; compatibility can expose addresses. Disabling clears the extension's own override. Dashboard diagnostics report the effective browser policy and local ICE observations without external STUN requests. A separate, explicitly invoked live test checks external ICE gathering. No public-IP concealment guarantee is made. |
| Diagnostics and auto-fix | Assertions run in the selected page and permitted frames, including cross-origin frames. Skipped frames and informational observations are shown separately. There is no authenticity percentage; browser/API checks cannot establish third-party detector bypass. |
| Domain whitelist | Hostname/subdomain matches include ancestor frames. Native descriptors and unedited audio samples are restored on bypass. Header exclusions also cover request initiators and whitelisted frame trees. Reload after editing exceptions. WebRTC remains browser-wide, and traffic outside extension permissions is not covered. |

---

## How to Install in Brave Browser

1. Open Brave and navigate to `brave://extensions` (or `chrome://extensions` in Chrome/Chromium).
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select the extension root directory containing `manifest.json`.
5. Confirm that **UmbraShark - Flat Stealth Matrix** appears without loading errors.
6. Click the extension icon to open the Control Center dashboard.

The manifest specifies Chromium 111 as the minimum version. This declaration is not a tested browser compatibility matrix.

**Updating an unpacked installation:** Replace the extension files, choose **Reload** for UmbraShark on the extensions page, reopen its dashboard, and refresh existing webpages. The current engine uses the `scripting` and `webNavigation` permissions; approve updated permissions if your browser requests them. Reloading is required to replace cached service-worker code.

---

## Verification & Testing

Validation completed on **October 28, 2026**, on Windows:

| Check | Result |
| --- | --- |
| Unit tests | 14 passed |
| Extension integration | Passed in isolated Brave and Edge profiles |
| Date compatibility | 868 functional comparisons passed per browser across seven timezones |
| Live IP alignment | Detection, preview, apply, and undo passed in disposable Brave |
| Live external ICE check | Strict mode produced no ICE candidates on the tested ordinary webpage/network |

These are recorded test results, not ongoing availability or privacy guarantees. The live tests were explicitly authorized; regular dashboard diagnostics do not send requests to external STUN servers.

Open **Diagnostics**, select a regular HTTP/HTTPS webpage, and click **Run checks**. Results cover the selected page and injectable frames, with skipped/informational results reported separately. The dashboard itself is not spoofed or used as the test subject. Page code can still modify its own APIs; these results are not an independent release certification.

Run `node --test tests/*.test.cjs` for unit tests. `tests/browser_correctness.cjs` is an optional integration suite requiring Playwright and an extension-capable Chromium/Edge executable. Set `PLAYWRIGHT_MODULE` to a Playwright module path if it is not locally installed, and `BROWSER_EXECUTABLE` to the browser executable, then run `node tests/browser_correctness.cjs`. It creates an isolated test profile and local cross-origin pages; it does not use your normal browser profile or external IP/STUN services.

The suite covers authenticated state updates and forged event/cache rejection, cross-origin ancestor exceptions, actual HTTP headers, repeated canvas/audio reads and restoration, date-specific DST/history/options/invalid dates, native voice/media objects, geolocation permissions/watch cancellation, WebRTC mode selection/release, all three samples, and the diagnostics UI. These checks passed in both Brave and Edge on Windows.

With the same Playwright/browser environment configured, `node tests/date_correctness.cjs` runs 868 functional comparisons against native browser timezone emulation across seven zones, including half-hour DST, overlaps/gaps, Samoa's skipped day, historical offsets, constructors, parsing, setters, invalid values, and subclasses. Timezone display-name wording is implementation-defined and excluded from equality checks. The suite passed in Brave and Edge.

`node tests/live_network.cjs` is a separate optional smoke test that contacts **ipwho.is** and **Google's public STUN service**, disclosing your public IP to them. It uses a disposable profile, tests IP detection/preview/apply/undo, and gathers external ICE candidates from an ordinary local webpage; it does not print IP addresses. In the tested Brave environment, live lookup/apply/undo passed and strict mode produced no ICE candidates. This is one environment's observation, not a guarantee about every network, VPN, proxy, relay, or geolocation database. Physical location accuracy and universal browser-native equivalence remain unverified.

When reporting a regression, include the browser/OS, profile and mode, affected URL or local reproduction, expected and observed behavior, and diagnostic output with personal data removed. Re-run the relevant checks after changing network, VPN, proxy, or browser settings; past results do not establish behavior in a different environment.

The following links are optional manual inspection tools, not evidence that UmbraShark passes their checks:

- [BrowserLeaks](https://browserleaks.com/javascript)
- [BrowserLeaks WebGL](https://browserleaks.com/webgl)
- [CreepJS](https://creepjs-fork.vercel.app/)
- [Pixelscan.net](https://pixelscan.net/)
- [Fingerprint.com Demo](https://fingerprint.com/demo/)
