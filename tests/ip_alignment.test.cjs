const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const alignment = require('../data/ip_alignment.js');
const presets = require('../data/profiles.js');

const fixture = () => ({
  success: true, ip: '203.0.113.8', country: 'Iran', country_code: 'IR', city: 'Tehran',
  latitude: 35.6892, longitude: 51.389, timezone: { id: 'Asia/Tehran' }
});

test('normalizes provider data and suggests a locale for countries outside the presets', () => {
  const location = alignment.normalizeLookup(fixture());
  assert.equal(location.suggestedLocale, 'fa-IR');
  assert.equal(location.timezone, 'Asia/Tehran');
  assert.ok(location.detectedAt <= Date.now());
  assert.equal(alignment.normalizeLookup({ ...fixture(), country_code: 'JP' }).suggestedLocale, 'ja-JP');
});

test('all sample profiles include resolved timezone offsets', () => {
  for (const profile of presets.IDENTITY_PRESETS) {
    assert.ok(Number.isFinite(profile.offset), profile.id);
    assert.equal(typeof profile.timezoneAbbr, 'string');
  }
});

test('rejects failed, incomplete and invalid provider results', () => {
  for (const patch of [
    { success: false }, { country_code: 'INVALID' }, { country: null }, { ip: '<script>' },
    { latitude: '35' }, { latitude: NaN }, { latitude: 91 }, { longitude: -181 },
    { timezone: {} }, { timezone: { id: 'Invalid/Timezone' } }
  ]) assert.throws(() => alignment.normalizeLookup({ ...fixture(), ...patch }));
});

test('accepts IPv6, zero coordinates and missing city without losing valid values', () => {
  const value = alignment.normalizeLookup({ ...fixture(), ip: '2001:db8::1', latitude: 0, longitude: 0, city: undefined });
  assert.equal(value.lat, 0);
  assert.equal(value.lon, 0);
  assert.equal(value.city, '');
});

test('calculates fractional offsets, midnight and DST independent of the host timezone', () => {
  for (const [zone, date, offset] of [
    ['Asia/Tehran', '2026-10-28T00:30:00Z', -210],
    ['Asia/Kathmandu', '2026-10-28T18:15:00Z', -345],
    ['America/New_York', '2026-01-20T00:00:00Z', 300],
    ['America/New_York', '2026-07-20T00:00:00Z', 240],
    ['America/New_York', '2026-03-08T06:59:00Z', 300],
    ['America/New_York', '2026-03-08T07:00:00Z', 240],
    ['Pacific/Auckland', '2026-01-20T12:00:00Z', -780],
    ['UTC', '2026-01-20T00:00:00Z', 0],
    ['UTC', '0050-01-20T00:00:00Z', 0],
    ['UTC', '-000001-01-20T00:00:00Z', 0],
    ['America/New_York', '1800-01-20T00:00:00Z', 17762000 / 60000]
  ]) {
    assert.equal(alignment.timezoneDetails(zone, new Date(date)).offset, offset, zone + ' ' + date);
    assert.equal(presets.calculateExactTimezoneOffset(zone, new Date(date)), offset);
  }
});

test('aligns regional values and language without modifying the input or hardware', () => {
  const source = structuredClone(presets.DEFAULT_PROFILE);
  const before = structuredClone(source);
  const result = alignment.alignProfile(source, alignment.normalizeLookup(fixture()), true, new Date('2026-10-28T00:00:00Z'));
  assert.deepEqual(source, before);
  assert.equal(result.offset, -210);
  assert.equal(result.locale, 'fa-IR');
  assert.deepEqual(result.languages, ['fa-IR', 'fa']);
  assert.equal(result.acceptLanguage, 'fa-IR,fa;q=0.9');
  for (const key of ['ua', 'platform', 'brands', 'gpuRenderer', 'screenWidth', 'cores', 'memory']) assert.deepEqual(result[key], source[key]);
  const keepLanguage = alignment.alignProfile(source, alignment.normalizeLookup(fixture()), false);
  for (const key of ['locale', 'languages', 'acceptLanguage']) assert.deepEqual(keepLanguage[key], source[key]);
});

function worker(fetch) {
  let listener;
  const listeners = [];
  const writes = [];
  const context = {
    console, fetch, AbortSignal, importScripts() {}, IP_ALIGNMENT: alignment,
    chrome: {
      runtime: { id: 'test', getURL: p => 'chrome-extension://test/' + p,
        onMessage: { addListener(fn) { listener = fn; listeners.push(fn); } }, onInstalled: { addListener() {} }, onStartup: { addListener() {} } },
      tabs: { onUpdated: { addListener() {} }, onRemoved: { addListener() {} } },
      action: { onClicked: { addListener() {} } },
      storage: { onChanged: { addListener() {} }, local: { set(value) { writes.push(value); } } }
    }
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../background/service_worker.js'), 'utf8'), context);
  function send(sender = { id: 'test', url: 'chrome-extension://test/ui/dashboard.html' }) {
    return new Promise(resolve => listener({ type: 'DETECT_IP_LOCATION' }, sender, resolve));
  }
  return { send, writes, context, dispatch(message, sender) {
    return new Promise(resolve => { for (const fn of listeners) fn(message, sender, resolve); });
  } };
}

test('worker only allows dashboard requests and does not save during detection', async () => {
  let calls = 0;
  const harness = worker(async (url, options) => {
    calls++;
    assert.ok(url.startsWith('https://ipwho.is/'));
    assert.equal(options.credentials, 'omit');
    assert.equal(options.cache, 'no-store');
    return { ok: true, json: async () => fixture() };
  });
  assert.equal((await harness.send({ id: 'test', url: 'https://example.com' })).ok, false);
  assert.equal((await harness.send({ id: 'other', url: 'chrome-extension://test/ui/dashboard.html' })).ok, false);
  assert.equal(calls, 0);
  assert.equal((await harness.send()).location.suggestedLocale, 'fa-IR');
  assert.equal(calls, 1);
  assert.deepEqual(harness.writes, []);
});

test('worker deduplicates overlapping lookups', async () => {
  let release, calls = 0;
  const harness = worker(() => { calls++; return new Promise(resolve => { release = resolve; }); });
  const a = harness.send(), b = harness.send();
  release({ ok: true, json: async () => fixture() });
  assert.ok((await a).ok && (await b).ok);
  assert.equal(calls, 1);
});

test('provider failures, rate limits and timeouts leave storage unchanged', async () => {
  for (const fetch of [
    async () => ({ ok: false, status: 429 }),
    async () => ({ ok: false, status: 503 }),
    async () => { throw new TypeError('Failed to fetch'); },
    async () => { const e = new Error('timeout'); e.name = 'TimeoutError'; throw e; },
    async () => ({ ok: true, json: async () => ({ success: false }) })
  ]) {
    const harness = worker(fetch);
    const result = await harness.send();
    assert.equal(result.ok, false);
    assert.ok(result.error.length > 0);
    assert.deepEqual(harness.writes, []);
  }
});

test('WebRTC mode is allowlisted and disabling releases the extension override', async () => {
  const harness = worker(async () => {}), operations = [];
  harness.context.chrome.privacy = { network: { webRTCIPHandlingPolicy: {
    set(details, callback) { operations.push(['set', details.value]); callback(); },
    clear(details, callback) { operations.push(['clear']); callback(); }
  } } };
  await harness.context.applyWebRtcPolicy(true);
  await harness.context.applyWebRtcPolicy(true, 'default_public_interface_only');
  await harness.context.applyWebRtcPolicy(true, 'unrecognized-policy');
  await harness.context.applyWebRtcPolicy(false);
  assert.deepEqual(operations, [
    ['set', 'disable_non_proxied_udp'], ['set', 'default_public_interface_only'],
    ['set', 'disable_non_proxied_udp'], ['clear']
  ]);
});

test('page repair and reload requests are restricted to the dashboard', async () => {
  const harness = worker(async () => {});
  for (const type of ['APPLY_PROFILE_TO_TAB','RELOAD_PROFILE_TAB','RUN_PAGE_DIAGNOSTICS','GET_DIAGNOSTIC_TABS']) {
    const result = await harness.dispatch({type,tabId:123}, {id:'test',url:'https://example.com/'});
    assert.equal(result.ok, false);
    assert.match(result.error, /dashboard/);
  }
});
