const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const signature = Buffer.from([137,80,78,71,13,10,26,10]);

test('app and toolbar icons point to valid PNGs at their declared dimensions', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
  for (const size of [16,32,48,128]) {
    assert.equal(manifest.icons[size], manifest.action.default_icon[size]);
    const image = fs.readFileSync(path.join(root, manifest.icons[size]));
    assert.deepEqual(image.subarray(0,8), signature);
    assert.equal(image.readUInt32BE(16), size);
    assert.equal(image.readUInt32BE(20), size);
  }
});

test('ICO favicon contains three valid PNG frames and the dashboard links the shared mark', () => {
  const ico = fs.readFileSync(path.join(root, 'icons/favicon.ico'));
  assert.equal(ico.readUInt16LE(0), 0);
  assert.equal(ico.readUInt16LE(2), 1);
  assert.equal(ico.readUInt16LE(4), 3);
  for (const [index, size] of [16,32,48].entries()) {
    const entry = 6 + index * 16, length = ico.readUInt32LE(entry + 8), offset = ico.readUInt32LE(entry + 12);
    assert.equal(ico[entry], size);
    assert.ok(offset + length <= ico.length);
    assert.deepEqual(ico.subarray(offset, offset + 8), signature);
  }
  const html = fs.readFileSync(path.join(root, 'ui/dashboard.html'), 'utf8');
  assert.match(html, /rel="icon"[^>]*href="\.\.\/icons\/mark\.svg"/);
  assert.match(html, /<img src="\.\.\/icons\/mark\.svg"/);
});
