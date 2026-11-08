# Changelog

All notable changes to the UmbraShark project are documented here.

## [Unreleased]
### Added
- IP-based regional alignment in the dashboard: detect an approximate location, review it, then apply the timezone, offset, and approximate coordinates to the profile, with undo during the dashboard session.
- Reversible frame-aware site exceptions, strict and compatibility WebRTC modes, and page-level diagnostics.
- Realistic device and browser presets with a custom identity builder: three full identity samples for Windows, macOS, and Linux, plus 37 city/timezone and 25 language sample lists, with mix-and-match samples or per-field overrides in the dashboard.
- README clarification of the preset and custom profile options (2026-11-04).

### Fixed
- Stale page initialization recovery: explicit saved-profile application, confirmed engine installation diagnostics, and safe reload recovery instead of stacking stale hooks.
- Unified extension icons: a shared teal-and-white SVG mark, antialiased toolbar/app PNGs, and a multi-size ICO favicon, with top-level manifest icons and dashboard favicon links.

## [1.0.0] - 2026-10-20
### Added
- Manifest V3 stealth matrix engine with service worker integration.
- Dynamic declarativeNetRequest rule evaluation.
- MAIN world prototype-level canvas, audio, and navigator evasion.
- Control center UI telemetry dashboard.
