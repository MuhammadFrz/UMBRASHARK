const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

/**
 * Generates sleek symbol icons for UmbraShark:
 * Minimalist geometric shark fin silhouette with apex stealth lines.
 */
function createSharkSymbolPng(size) {
  const width = size;
  const height = size;

  const rawData = Buffer.alloc((width * 4 + 1) * height);
  const cx = width / 2;
  const cy = height / 2;

  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter byte: None

    for (let x = 0; x < width; x++) {
      // Normalized coordinates from -1 to 1
      const nx = (x - cx) / (width / 2);
      const ny = (y - cy) / (height / 2);
      const dist = Math.sqrt(nx * nx + ny * ny);

      // Background: Deep obsidian rounded shield
      let r = 11, g = 11, b = 15, a = 255;

      // Outer circular frame
      if (dist <= 0.92) {
        r = 18; g = 18; b = 24;
      }
      if (dist > 0.88 && dist <= 0.92) {
        // Subtle titanium border
        r = 55; g = 55; b = 70;
      }

      // Shark Fin Geometry:
      // Apex at top center-right (nx: 0.15, ny: -0.55)
      // Front curved edge from bottom-left (-0.45, 0.45) up to apex (0.15, -0.55)
      // Back trailing edge curving down to notch (0.05, 0.25)
      // Base flat line from (-0.45, 0.45) to (0.25, 0.45)
      const inBaseY = ny >= -0.55 && ny <= 0.45;
      
      // Parametric fin shape test:
      // Front edge curve: nx >= -0.45 + (ny + 0.55) * 0.25 ...
      // Let's model the shark fin:
      // 1. Left leading edge curve from bottom (-0.4) to top (0.15)
      const t = (ny + 0.55) / 1.0; // 0 at top (-0.55), 1 at bottom (0.45)
      const leadingEdge = -0.5 + Math.pow(t, 0.85) * 0.65;
      const trailingEdge = 0.15 - Math.pow(t, 1.8) * 0.25;

      // Inverted apex leading edge:
      const finLeft = leadingEdge;
      const finRight = 0.18 - (1 - t) * 0.05 - (t > 0.7 ? (t - 0.7) * 0.4 : 0);

      // Clear flat shark fin polygon:
      // Top vertex: (0.10, -0.52)
      // Bottom left: (-0.42, 0.42)
      // Bottom notch: (0.18, 0.42)
      // Inner carve notch: (0.02, 0.18)
      const isInsideFin = isPointInFin(nx, ny);

      if (isInsideFin) {
        // Emerald stealth gradient / solid glow
        r = 16; g = 185; b = 129; // Vivid Emerald #10b981
        if (nx > 0.02) {
          // Subtle high-contrast bevel
          r = 52; g = 211; b = 153;
        }
      }

      // Stealth sensor dot / eye near apex
      const eyeDx = nx - (-0.05);
      const eyeDy = ny - (-0.15);
      const eyeDist = Math.sqrt(eyeDx * eyeDx + eyeDy * eyeDy);
      if (eyeDist <= 0.075) {
        r = 11; g = 11; b = 15; // Dark stealth cutout eye
      }

      rawData[offset++] = r;
      rawData[offset++] = g;
      rawData[offset++] = b;
      rawData[offset++] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData);
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    signature,
    createChunk('IHDR', ihdr),
    createChunk('IDAT', deflated),
    createChunk('IEND', Buffer.alloc(0))
  ]);
}

// Point-in-polygon test for shark fin symbol
function isPointInFin(x, y) {
  // Fin vertices (normalized coords):
  // 1. Apex tip
  // 2. Trailing edge notch
  // 3. Lower base tip
  // 4. Base bottom-left
  // 5. Front curved spine
  if (y < -0.52 || y > 0.42) return false;

  const t = (y + 0.52) / 0.94; // 0 at top, 1 at bottom
  // Leading edge curves smoothly backward
  const minX = -0.42 + Math.pow(t, 1.3) * 0.52;
  // Trailing edge
  let maxX;
  if (t < 0.65) {
    maxX = 0.10 + t * 0.12;
  } else {
    // Notch curve inward
    const subT = (t - 0.65) / 0.35;
    maxX = 0.18 - subT * 0.14;
  }

  return x >= minX && x <= maxX;
}

function createChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(len + 12);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  const crc = crc32(buf.subarray(4, len + 8));
  buf.writeUInt32BE(crc, len + 8);
  return buf;
}

const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

[16, 32, 48, 128].forEach(size => {
  const pngBuf = createSharkSymbolPng(size);
  fs.writeFileSync(path.join(iconsDir, `icon${size}.png`), pngBuf);
  console.log(`Generated UmbraShark symbol icon${size}.png (${pngBuf.length} bytes)`);
});
