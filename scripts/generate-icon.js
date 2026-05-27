// Generate a minimal 256x256 PNG icon programmatically
// A simple blue/green/purple "WT" icon for WANGTranslate

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function createPNG(width, height, pixelCallback) {
  // Minimal PNG encoder
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // color type: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  // IDAT
  const rawData = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    const rowOffset = y * (1 + width * 4);
    rawData[rowOffset] = 0; // filter: none
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = pixelCallback(x, y, width, height);
      const pixelOffset = rowOffset + 1 + x * 4;
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);

  // Assemble
  const chunks = [signature];

  function addChunk(type, data) {
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length, 0);
    const typeBuffer = Buffer.from(type);
    const crcInput = Buffer.concat([typeBuffer, data]);
    const crc = crc32(crcInput);
    const crcBuffer = Buffer.alloc(4);
    crcBuffer.writeUInt32BE(crc, 0);
    chunks.push(length, typeBuffer, data, crcBuffer);
  }

  addChunk('IHDR', ihdr);
  addChunk('IDAT', compressed);
  addChunk('IEND', Buffer.alloc(0));

  return Buffer.concat(chunks);
}

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      if (crc & 1) {
        crc = (crc >>> 1) ^ 0xEDB88320;
      } else {
        crc = crc >>> 1;
      }
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

// Colors
const BG = [30, 30, 46];     // #1E1E2E
const BLUE = [137, 180, 250]; // #89B4FA
const GREEN = [166, 227, 161]; // #A6E3A1
const PURPLE = [203, 166, 247]; // #CBA6F7

function drawChar(pixels, char, cx, cy, fontSize, color) {
  // Simple pixel font rendering for "W" and "T"
  // Using approximate pixel positions for large chars
  const scale = fontSize / 72;
  const patterns = {
    'W': [
      // W shape - diagonal strokes
      [0,0,1,0], [0.15,1,0.25,0], [0.3,0,0.4,1], [0.45,1,0.55,0], [0.6,0,0.7,1], [0.85,1,1,0]
    ],
    'T': [
      // T shape - top bar + vertical
      [0,0,1,0.15], [0.4,0.15,0.6,1]
    ]
  };

  const pattern = patterns[char] || [];
  for (const [x1, y1, x2, y2] of pattern) {
    const px1 = Math.round(cx - fontSize * 0.35 + x1 * fontSize * 0.7);
    const py1 = Math.round(cy - fontSize * 0.35 + y1 * fontSize * 0.7);
    const px2 = Math.round(cx - fontSize * 0.35 + x2 * fontSize * 0.7);
    const py2 = Math.round(cy - fontSize * 0.35 + y2 * fontSize * 0.7);

    for (let dy = Math.min(py1, py2); dy <= Math.max(py1, py2); dy++) {
      for (let dx = Math.min(px1, px2); dx <= Math.max(px1, px2); dx++) {
        const idx = dy * 256 + dx;
        if (idx >= 0 && idx < 65536) {
          pixels[idx * 4] = color[0];
          pixels[idx * 4 + 1] = color[1];
          pixels[idx * 4 + 2] = color[2];
          pixels[idx * 4 + 3] = 255;
        }
      }
    }
  }
}

// Generate 256x256 icon
const SIZE = 256;
const pixels = new Uint8Array(SIZE * SIZE * 4);

// Fill background with rounded rectangle
const radius = 48;
for (let y = 0; y < SIZE; y++) {
  for (let x = 0; x < SIZE; x++) {
    let inRect = true;
    // Check rounded corners
    for (const [cx, cy] of [[radius, radius], [SIZE-radius, radius], [radius, SIZE-radius], [SIZE-radius, SIZE-radius]]) {
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy > radius * radius) {
        if ((cx === radius && x < cx) || (cx === SIZE-radius && x > cx) ||
            (cy === radius && y < cy) || (cy === SIZE-radius && y > cy)) {
          inRect = false;
        }
      }
    }
    const idx = (y * SIZE + x) * 4;
    if (inRect) {
      pixels[idx] = BG[0];
      pixels[idx + 1] = BG[1];
      pixels[idx + 2] = BG[2];
      pixels[idx + 3] = 255;
    }
  }
}

// Draw W T text using simple shapes
// Top "W" in blue - center at ~128, 85
const wY = 90;
const wW = 100;
const wH = 60;
// Simple W: two V shapes
for (let dx = -wW/2; dx <= wW/2; dx++) {
  for (let dy = -wH/2; dy <= wH/2; dy++) {
    const x = Math.round(128 + dx);
    const y = Math.round(wY + dy);
    if (x < 0 || x >= SIZE || y < 0 || y >= SIZE) continue;

    // W shape detection (approximate pixel rendering)
    const wx = dx / (wW / 2);
    const wy = dy / (wH / 2);
    const wy_abs = Math.abs(wy);

    // Diagonal strokes of W with thickness
    const thickness = 8 / wW * 2;
    let inStroke = false;
    // Left down stroke
    if (wx >= -1 && wx <= -0.1 && Math.abs(wx + 1 + wy) < thickness*1.5) inStroke = true;
    // Right down stroke
    if (wx >= 0.1 && wx <= 1 && Math.abs(wx - 1 + wy) < thickness*1.5) inStroke = true;
    // Left up stroke
    if (wx >= -1 && wx <= -0.1 && Math.abs(wx + 1 - wy) < thickness*1.5) inStroke = true;
    // Right up stroke
    if (wx >= 0.1 && wx <= 1 && Math.abs(wx - 1 - wy) < thickness*1.5) inStroke = true;

    if (inStroke) {
      const idx = (y * SIZE + x) * 4;
      if (pixels[idx + 3] > 0) {
        pixels[idx] = BLUE[0];
        pixels[idx + 1] = BLUE[1];
        pixels[idx + 2] = BLUE[2];
      }
    }
  }
}

// Bottom "T" in green - center at ~128, 155
const tY = 155;
const tW = 80;
const tH = 50;
for (let dx = -tW/2; dx <= tW/2; dx++) {
  for (let dy = -tH/2; dy <= tH/2; dy++) {
    const x = Math.round(128 + dx);
    const y = Math.round(tY + dy);
    if (x < 0 || x >= SIZE || y < 0 || y >= SIZE) continue;

    const tx = dx / (tW / 2);
    const ty = dy / (tH / 2);

    let inStroke = false;
    // Top bar
    if (ty >= -1 && ty <= -0.85) inStroke = true;
    // Vertical stem
    if (Math.abs(tx) < 0.12 && ty > -0.8) inStroke = true;

    if (inStroke) {
      const idx = (y * SIZE + x) * 4;
      if (pixels[idx + 3] > 0) {
        pixels[idx] = GREEN[0];
        pixels[idx + 1] = GREEN[1];
        pixels[idx + 2] = GREEN[2];
      }
    }
  }
}

// Accent line at bottom
const lineY = 190;
for (let x = 100; x < 156; x++) {
  for (let y = lineY; y < lineY + 4; y++) {
    const idx = (y * SIZE + x) * 4;
    if (pixels[idx + 3] > 0) {
      pixels[idx] = PURPLE[0];
      pixels[idx + 1] = PURPLE[1];
      pixels[idx + 2] = PURPLE[2];
    }
  }
}

const png = createPNG(SIZE, SIZE, (x, y, w, h) => {
  const idx = (y * SIZE + x) * 4;
  return [pixels[idx], pixels[idx + 1], pixels[idx + 2], pixels[idx + 3]];
});

fs.writeFileSync(path.join(__dirname, '..', 'assets', 'icon.png'), png);
console.log('Icon generated: assets/icon.png');
