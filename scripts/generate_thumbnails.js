const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

// CRC32 table
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return c ^ 0xffffffff;
}

function createPng(width, height, rgbaBuffer) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  function makeChunk(type, data) {
    const len = data.length;
    const buf = Buffer.alloc(4 + 4 + len + 4);
    buf.writeUInt32BE(len, 0);
    buf.write(type, 4);
    data.copy(buf, 8);
    const crc = crc32(buf.slice(4, 8 + len));
    buf.writeInt32BE(crc, 8 + len);
    return buf;
  }

  const scanlines = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    const rowStart = y * (width * 4 + 1);
    scanlines[rowStart] = 0;
    rgbaBuffer.copy(scanlines, rowStart + 1, y * width * 4, (y + 1) * width * 4);
  }

  const idatData = zlib.deflateSync(scanlines);
  const idatChunk = makeChunk('IDAT', idatData);
  const ihdrChunk = makeChunk('IHDR', ihdr);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Minimal 5x7 bitmap font for drawing crisp text on canvas
const FONT = {
  'A': [0x1C, 0x22, 0x22, 0x3E, 0x22, 0x22, 0x22],
  'B': [0x3C, 0x22, 0x22, 0x3C, 0x22, 0x22, 0x3C],
  'C': [0x1E, 0x20, 0x20, 0x20, 0x20, 0x20, 0x1E],
  'D': [0x3C, 0x22, 0x22, 0x22, 0x22, 0x22, 0x3C],
  'E': [0x3E, 0x20, 0x20, 0x3C, 0x20, 0x20, 0x3E],
  'F': [0x3E, 0x20, 0x20, 0x3C, 0x20, 0x20, 0x20],
  'G': [0x1E, 0x20, 0x20, 0x2E, 0x22, 0x22, 0x1E],
  'H': [0x22, 0x22, 0x22, 0x3E, 0x22, 0x22, 0x22],
  'I': [0x1C, 0x08, 0x08, 0x08, 0x08, 0x08, 0x1C],
  'J': [0x0E, 0x04, 0x04, 0x04, 0x04, 0x24, 0x18],
  'K': [0x22, 0x24, 0x28, 0x30, 0x28, 0x24, 0x22],
  'L': [0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x3E],
  'M': [0x22, 0x36, 0x2A, 0x22, 0x22, 0x22, 0x22],
  'N': [0x22, 0x32, 0x2A, 0x26, 0x22, 0x22, 0x22],
  'O': [0x1C, 0x22, 0x22, 0x22, 0x22, 0x22, 0x1C],
  'P': [0x3C, 0x22, 0x22, 0x3C, 0x20, 0x20, 0x20],
  'Q': [0x1C, 0x22, 0x22, 0x22, 0x2A, 0x24, 0x1A],
  'R': [0x3C, 0x22, 0x22, 0x3C, 0x28, 0x24, 0x22],
  'S': [0x1E, 0x20, 0x20, 0x1C, 0x02, 0x02, 0x3C],
  'T': [0x3E, 0x08, 0x08, 0x08, 0x08, 0x08, 0x08],
  'U': [0x22, 0x22, 0x22, 0x22, 0x22, 0x22, 0x1C],
  'V': [0x22, 0x22, 0x22, 0x22, 0x14, 0x14, 0x08],
  'W': [0x22, 0x22, 0x22, 0x2A, 0x2A, 0x36, 0x22],
  'X': [0x22, 0x14, 0x08, 0x08, 0x14, 0x22, 0x22],
  'Y': [0x22, 0x22, 0x14, 0x08, 0x08, 0x08, 0x08],
  'Z': [0x3E, 0x02, 0x04, 0x08, 0x10, 0x20, 0x3E],
  '0': [0x1C, 0x22, 0x26, 0x2A, 0x32, 0x22, 0x1C],
  '1': [0x08, 0x18, 0x08, 0x08, 0x08, 0x08, 0x1C],
  '2': [0x1C, 0x22, 0x02, 0x0C, 0x10, 0x20, 0x3E],
  '3': [0x3C, 0x02, 0x02, 0x1C, 0x02, 0x02, 0x3C],
  '4': [0x04, 0x0C, 0x14, 0x24, 0x3E, 0x04, 0x04],
  '5': [0x3E, 0x20, 0x20, 0x3C, 0x02, 0x02, 0x3C],
  '6': [0x1C, 0x20, 0x20, 0x3C, 0x22, 0x22, 0x1C],
  '7': [0x3E, 0x02, 0x04, 0x08, 0x10, 0x10, 0x10],
  '8': [0x1C, 0x22, 0x22, 0x1C, 0x22, 0x22, 0x1C],
  '9': [0x1C, 0x22, 0x22, 0x1E, 0x02, 0x02, 0x1C],
  ' ': [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
  '-': [0x00, 0x00, 0x00, 0x3E, 0x00, 0x00, 0x00],
  '.': [0x00, 0x00, 0x00, 0x00, 0x00, 0x0C, 0x0C],
  ':': [0x00, 0x0C, 0x0C, 0x00, 0x0C, 0x0C, 0x00],
  '&': [0x18, 0x24, 0x18, 0x2A, 0x24, 0x22, 0x1D],
  '!': [0x08, 0x08, 0x08, 0x08, 0x08, 0x00, 0x08]
};

// Color palettes per category for distinct fresh look
const PALETTES = {
  'Sports': { bg1: [15, 23, 42], bg2: [14, 116, 144], accent: [249, 115, 22], badge: 'SPORTS 6X' },
  'Driving': { bg1: [15, 23, 42], bg2: [30, 64, 175], accent: [251, 191, 36], badge: 'RACING 6X' },
  'Action': { bg1: [24, 24, 27], bg2: [185, 28, 28], accent: [249, 115, 22], badge: 'ACTION 6X' },
  'Platformer': { bg1: [17, 24, 39], bg2: [109, 40, 217], accent: [56, 189, 248], badge: 'OBBY 6X' },
  'Puzzle': { bg1: [15, 23, 42], bg2: [4, 120, 87], accent: [250, 204, 21], badge: 'PUZZLE 6X' },
  'Multiplayer': { bg1: [23, 23, 23], bg2: [67, 56, 202], accent: [244, 63, 94], badge: '2-PLAYER' },
  'Retro': { bg1: [15, 23, 42], bg2: [2, 132, 199], accent: [249, 115, 22], badge: 'RETRO 6X' }
};

function generateThumbnail(title, categoryName, outputPath) {
  const W = 512;
  const H = 384;
  const buf = Buffer.alloc(W * H * 4);

  const palette = PALETTES[categoryName] || PALETTES['Action'];
  const [r1, g1, b1] = palette.bg1;
  const [r2, g2, b2] = palette.bg2;
  const [ar, ag, ab] = palette.accent;

  // 1. Draw radial/diagonal gradient background
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const idx = (y * W + x) * 4;
      // Distance from center-top
      const dx = (x - W * 0.5) / (W * 0.5);
      const dy = (y - H * 0.3) / (H * 0.5);
      const dist = Math.min(1, Math.sqrt(dx * dx + dy * dy) * 0.85);

      // Gradient interpolation
      const t = (x / W * 0.3) + (y / H * 0.7);
      let r = Math.floor(r2 + (r1 - r2) * dist);
      let g = Math.floor(g2 + (g1 - g2) * dist);
      let b = Math.floor(b2 + (b1 - b2) * dist);

      // Subtle retro grid pattern
      if (x % 32 === 0 || y % 32 === 0) {
        r = Math.min(255, r + 14);
        g = Math.min(255, g + 14);
        b = Math.min(255, b + 14);
      }

      buf[idx] = Math.max(0, Math.min(255, r));
      buf[idx + 1] = Math.max(0, Math.min(255, g));
      buf[idx + 2] = Math.max(0, Math.min(255, b));
      buf[idx + 3] = 255;
    }
  }

  // Helper to draw filled rectangle
  function fillRect(x0, y0, w, h, r, g, b, a = 255) {
    for (let y = Math.max(0, y0); y < Math.min(H, y0 + h); y++) {
      for (let x = Math.max(0, x0); x < Math.min(W, x0 + w); x++) {
        const idx = (y * W + x) * 4;
        if (a === 255) {
          buf[idx] = r;
          buf[idx + 1] = g;
          buf[idx + 2] = b;
          buf[idx + 3] = 255;
        } else {
          const alpha = a / 255;
          buf[idx] = Math.floor(buf[idx] * (1 - alpha) + r * alpha);
          buf[idx + 1] = Math.floor(buf[idx + 1] * (1 - alpha) + g * alpha);
          buf[idx + 2] = Math.floor(buf[idx + 2] * (1 - alpha) + b * alpha);
        }
      }
    }
  }

  // Draw Top Tag Badge
  const badgeText = palette.badge;
  const badgeWidth = badgeText.length * 10 + 24;
  fillRect(24, 24, badgeWidth, 28, ar, ag, ab, 240);

  // Draw text function using 5x7 font scaled
  function drawText(text, startX, startY, scale, r, g, b, shadow = true) {
    const upper = text.toUpperCase();
    let cx = startX;

    for (let i = 0; i < upper.length; i++) {
      const char = upper[i];
      const glyph = FONT[char] || FONT[' '];

      if (shadow) {
        for (let row = 0; row < 7; row++) {
          const bits = glyph[row];
          for (let col = 0; col < 5; col++) {
            if ((bits >> (4 - col)) & 1) {
              fillRect(cx + col * scale + 2, startY + row * scale + 2, scale, scale, 0, 0, 0, 180);
            }
          }
        }
      }

      for (let row = 0; row < 7; row++) {
        const bits = glyph[row];
        for (let col = 0; col < 5; col++) {
          if ((bits >> (4 - col)) & 1) {
            fillRect(cx + col * scale, startY + row * scale, scale, scale, r, g, b, 255);
          }
        }
      }
      cx += (5 + 1) * scale;
    }
  }

  // Draw badge label
  drawText(badgeText, 34, 30, 2, 255, 255, 255, false);

  // Draw Main Game Title (support multi-line if long)
  const words = title.split(' ');
  const lines = [];
  let curLine = '';

  for (const w of words) {
    if ((curLine + ' ' + w).trim().length > 14) {
      if (curLine) lines.push(curLine.trim());
      curLine = w;
    } else {
      curLine += ' ' + w;
    }
  }
  if (curLine) lines.push(curLine.trim());

  // Center vertical position of title
  const scale = lines.length > 2 ? 4 : 5;
  const lineHeight = 7 * scale + 14;
  const totalTextHeight = lines.length * lineHeight;
  let textY = Math.floor((H - totalTextHeight) * 0.52);

  // Card backdrop glow for title
  fillRect(20, textY - 16, W - 40, totalTextHeight + 32, 0, 0, 0, 110);

  // Outer border around thumbnail
  for (let x = 0; x < W; x++) {
    for (let t = 0; t < 3; t++) {
      fillRect(x, t, 1, 1, ar, ag, ab);
      fillRect(x, H - 1 - t, 1, 1, ar, ag, ab);
    }
  }
  for (let y = 0; y < H; y++) {
    for (let t = 0; t < 3; t++) {
      fillRect(t, y, 1, 1, ar, ag, ab);
      fillRect(W - 1 - t, y, 1, 1, ar, ag, ab);
    }
  }

  // Draw Title lines
  for (const line of lines) {
    const lineWidth = line.length * (6 * scale);
    const textX = Math.max(30, Math.floor((W - lineWidth) * 0.5));
    drawText(line, textX, textY, scale, 255, 255, 255, true);
    textY += lineHeight;
  }

  // Draw Bottom "RETRO BOWL UNBLOCKED 6X" Footer Pill
  const footerText = '★ PLAY FREE ONLINE ★';
  const fWidth = footerText.length * 10;
  const fX = Math.floor((W - fWidth) * 0.5);
  drawText(footerText, fX, H - 36, 2, 250, 204, 21, true);

  const png = createPng(W, H, buf);
  fs.writeFileSync(outputPath, png);
}

module.exports = { generateThumbnail };

// Test run for kart-bros
if (require.main === module) {
  generateThumbnail('Kart Bros', 'Driving', 'images/test_kart_bros.png');
  console.log('Generated images/test_kart_bros.png');
}
