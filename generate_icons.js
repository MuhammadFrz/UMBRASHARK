/** Rebuild the shared SVG mark, antialiased PNG extension icons, and ICO favicon. */
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const output = path.join(__dirname, 'icons');
const curves = [
  [24, 94, 36, 61, 60, 32, 98, 26],
  [98, 26, 82, 49, 78, 69, 101, 87],
  [101, 87, 75, 99, 49, 103, 24, 94]
];
const outline = curves.flatMap(points => Array.from({ length: 33 }, (_, i) => {
  const t = i / 32, u = 1 - t;
  return [u*u*u*points[0] + 3*u*u*t*points[2] + 3*u*t*t*points[4] + t*t*t*points[6],
    u*u*u*points[1] + 3*u*u*t*points[3] + 3*u*t*t*points[5] + t*t*t*points[7]];
}));
const shape = 'M24 94 ' + curves.map(points => 'C' + points.slice(2).join(' ')).join(' ') + ' Z';
const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><rect x="4" y="4" width="120" height="120" rx="28" fill="#173b35"/><path d="' + shape + '" fill="#fff"/></svg>\n';
function insideFin(x, y) {
  let inside = false;
  for (let i = 0, j = outline.length - 1; i < outline.length; j = i++) {
    const a = outline[i], b = outline[j];
    if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) inside = !inside;
  }
  return inside;
}
const crcTable = Array.from({ length: 256 }, (_, value) => {
  let crc = value;
  for (let i = 0; i < 8; i++) crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
  return crc >>> 0;
});
function chunk(type, data) {
  const buffer = Buffer.alloc(data.length + 12);
  buffer.writeUInt32BE(data.length, 0); buffer.write(type, 4, 4, 'ascii'); data.copy(buffer, 8);
  let crc = 0xffffffff;
  for (const value of buffer.subarray(4, data.length + 8)) crc = crcTable[(crc ^ value) & 255] ^ (crc >>> 8);
  buffer.writeUInt32BE((crc ^ 0xffffffff) >>> 0, data.length + 8);
  return buffer;
}
function png(size) {
  const pixels = Buffer.alloc((size * 4 + 1) * size);
  let index = 0;
  for (let y = 0; y < size; y++) {
    pixels[index++] = 0;
    for (let x = 0; x < size; x++) {
      let red = 0, green = 0, blue = 0, coverage = 0;
      for (let sy = 0; sy < 4; sy++) for (let sx = 0; sx < 4; sx++) {
        const px = (x + (sx + .5) / 4) * 128 / size, py = (y + (sy + .5) / 4) * 128 / size;
        const dx = px - Math.max(32, Math.min(96, px)), dy = py - Math.max(32, Math.min(96, py));
        if (dx * dx + dy * dy > 28 * 28) continue;
        const fin = insideFin(px, py);
        red += fin ? 255 : 23; green += fin ? 255 : 59; blue += fin ? 255 : 53; coverage++;
      }
      pixels[index++] = coverage ? Math.round(red / coverage) : 0;
      pixels[index++] = coverage ? Math.round(green / coverage) : 0;
      pixels[index++] = coverage ? Math.round(blue / coverage) : 0;
      pixels[index++] = Math.round(coverage * 255 / 16);
    }
  }
  const header = Buffer.alloc(13); header.writeUInt32BE(size, 0); header.writeUInt32BE(size, 4); header[8] = 8; header[9] = 6;
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',zlib.deflateSync(pixels)),chunk('IEND',Buffer.alloc(0))]);
}
fs.mkdirSync(output, { recursive: true });
fs.writeFileSync(path.join(output, 'mark.svg'), svg);
const sizes = [16,32,48,128], images = sizes.map(size => png(size));
sizes.forEach((size, i) => fs.writeFileSync(path.join(output, 'icon' + size + '.png'), images[i]));
const directory = Buffer.alloc(6 + 3 * 16); directory.writeUInt16LE(1,2); directory.writeUInt16LE(3,4);
let offset = directory.length;
for (let i = 0; i < 3; i++) {
  const entry = 6 + i * 16;
  directory[entry] = sizes[i]; directory[entry + 1] = sizes[i]; directory.writeUInt16LE(1,entry + 4); directory.writeUInt16LE(32,entry + 6);
  directory.writeUInt32LE(images[i].length,entry + 8); directory.writeUInt32LE(offset,entry + 12); offset += images[i].length;
}
fs.writeFileSync(path.join(output, 'favicon.ico'), Buffer.concat([directory, ...images.slice(0,3)]));
console.log('Generated shared SVG, PNG icons (16/32/48/128), and ICO favicon.');
