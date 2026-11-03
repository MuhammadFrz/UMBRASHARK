const { test } = require('node:test');
const assert = require('node:assert/strict');
const settings = require('../data/settings.js');
const presets = require('../data/profiles.js');

test('all sample profiles pass the schema and browser/platform consistency checks', () => {
  assert.ok(presets.IDENTITY_PRESETS.length >= 11);
  for (const sample of presets.IDENTITY_PRESETS) {
    const profile = settings.profile(sample);
    assert.equal(profile.languages[0], profile.locale);
    const expectedUaToken = profile.platform === 'Win32'
      ? 'Windows'
      : profile.platform === 'MacIntel'
      ? 'Macintosh'
      : profile.platform === 'iPhone'
      ? 'iPhone'
      : profile.platform === 'iPad'
      ? 'iPad'
      : 'Linux';
    assert.ok(profile.ua.includes(expectedUaToken), `${profile.id} UA should include ${expectedUaToken}`);
    assert.ok(presets.GPU_PRESETS.some(g => g.renderer === profile.gpuRenderer), `${profile.id} GPU renderer should exist in GPU_PRESETS`);
    assert.ok(profile.memory <= 8);
    assert.equal(typeof profile.mobile, 'boolean');
    assert.ok(Number.isInteger(profile.maxTouchPoints) && profile.maxTouchPoints >= 0);
  }
});

test('device presets and dynamic browser builder produce valid coherent profiles', () => {
  assert.ok(Array.isArray(presets.DEVICE_PRESETS) && presets.DEVICE_PRESETS.length >= 12);
  for (const dev of presets.DEVICE_PRESETS) {
    const built = presets.buildBrowserIdentity({
      browserName: dev.defaultBrowser,
      browserVersion: dev.defaultBrowserVersion,
      os: dev.os,
      chPlatformVersion: dev.chPlatformVersion,
      model: dev.model,
      mobile: dev.mobile,
      platform: dev.platform
    });
    const combined = Object.assign({}, presets.DEFAULT_PROFILE, dev, built);
    const validated = settings.profile(combined);
    assert.equal(validated.os, dev.os);
    assert.equal(validated.model, dev.model);
    assert.equal(validated.mobile, dev.mobile);
    assert.equal(validated.maxTouchPoints, dev.maxTouchPoints);
  }
});

test('invalid profile fields fail closed rather than using an unrelated default identity', () => {
  for (const fields of [
    {ua:'injected\r\nheader'},
    {cores:NaN},
    {timezone:'Invalid/Zone'},
    {languages:['ja-JP']},
    {lat:91},
    {brands:[{brand:'evil"',version:'1'}]},
    {availWidth:99999},
    {mobile:'yes'},
    {maxTouchPoints:99},
    {model:'bad\nmodel'}
  ]) {
    const state = settings.state({cloakProfile:{...presets.DEFAULT_PROFILE,...fields}});
    assert.equal(state.enabled, false);
    assert.ok(state.error);
    assert.equal(state.ua, undefined);
  }
});

test('hostname normalization rejects paths, wildcard and credential tricks', () => {
  assert.equal(settings.domain('https://EXAMPLE.com/'), 'example.com');
  assert.equal(settings.domain('مثال.ایران'), 'xn--mgbh0fb.xn--mgba3a4f16a');
  for (const input of ['*.example.com', 'example.com/path', 'example.com:8443', 'https://user@example.com', 'https://example.com?x=1', 'data:text/plain,hello']) assert.throws(() => settings.domain(input));
});

test('whitelisting covers subdomains and ancestor frame hosts without suffix confusion', () => {
  assert.equal(settings.matches('sub.example.com', ['example.com']), true);
  assert.equal(settings.matches('notexample.com', ['example.com']), false);
  assert.equal(settings.matches('example.com.evil.test', ['example.com']), false);
  const data={cloakProfile:presets.DEFAULT_PROFILE,whitelist:['example.com']};
  assert.equal(settings.state(data,['third-party.test','sub.example.com']).enabled, false);
  assert.equal(settings.state(data,['notexample.com']).enabled, true);
  assert.equal(settings.state({...data,cloakEnabled:false},['any.test']).enabled, false);
});
