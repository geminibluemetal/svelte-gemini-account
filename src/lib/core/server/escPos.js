export class ESCPOSPrinter {
  constructor() {
    this.reset();
    this.ESC = '\x1B';
    this.GS = '\x1D';
    this.LF = '\x0A';
  }

  // --- Core Utility ---
  reset() {
    this.buffer = '\x1B@'; // Initialize printer
    return this;
  }

  // --- Formatting ---
  align(type = 'left') {
    const modes = { left: '\x00', center: '\x01', right: '\x02' };
    this.buffer += this.ESC + 'a' + (modes[type.toLowerCase()] || '\x00');
    return this;
  }

  bold(on = true) {
    this.buffer += this.ESC + 'E' + (on ? '\x01' : '\x00');
    return this;
  }

  underline(style = 0) {
    // 0: Off, 1: Thin, 2: Thick
    this.buffer += this.ESC + '-' + String.fromCharCode(style);
    return this;
  }

  reverse(on = true) {
    // White text on Black background
    this.buffer += this.GS + 'B' + (on ? '\x01' : '\x00');
    return this;
  }

  setTextSize(width = 0, height = 0) {
    // Values 0-7 (0 is normal size, 7 is 8x size)
    const size = (width << 4) | height;
    this.buffer += this.GS + '!' + String.fromCharCode(size);
    return this;
  }

  // --- Text & Layout ---
  text(content) {
    this.buffer += content;
    return this;
  }

  line(content = '') {
    this.buffer += content + this.LF;
    return this;
  }

  // A very useful feature for receipts (e.g., "Total ........ $50.00")
  tableRow(left, right, totalWidth = 32) {
    const dotCount = totalWidth - (left.length + right.length);
    const dots = dotCount > 0 ? '.'.repeat(dotCount) : ' ';
    this.buffer += left + dots + right + this.LF;
    return this;
  }

  // A very useful feature for receipts (e.g., "Total : $50.00")
  pairs(label, value, totalWidth = 32) {
    // Store pairs in cache to calculate max width later
    if (!this._pairsCache) this._pairsCache = [];
    this._pairsCache.push({ label, value: value ? value : '-', totalWidth });
    return this;
  }
  pairsOptional(label, value, totalWidth = 32) {
    // Store pairs in cache to calculate max width later
    if (!this._pairsCache) this._pairsCache = [];
    if (value) {
      this._pairsCache.push({ label, value: value ? value : '-', totalWidth });
    }
    return this;
  }
  flushPairs() {
    if (!this._pairsCache || this._pairsCache.length === 0) return this;

    // Find the maximum label length
    const maxLabelLength = Math.max(...this._pairsCache.map((p) => p.label.length));

    // Print each pair with consistent alignment
    this._pairsCache.forEach(({ label, value }) => {
      // Pad label to max width
      const paddedLabel = label.padEnd(maxLabelLength, ' ');

      // Create the line: "label : value"
      const line = `${paddedLabel} : ${value}`;

      // Add to buffer
      this.buffer += line + this.LF;
    });

    // Clear cache
    this._pairsCache = [];
    return this;
  }

  dashedLine(length = 32) {
    this.line('-'.repeat(length));
    return this;
  }

  _alignCell(text, width, align = "left") {
    text = String(text);

    if (text.length > width) {
      return text.slice(0, width);
    }

    const space = width - text.length;

    switch (align) {
      case "right":
        return " ".repeat(space) + text;
      case "center": {
        const left = Math.floor(space / 2);
        const right = space - left;
        return " ".repeat(left) + text + " ".repeat(right);
      }
      default:
        return text.padEnd(width);
    }
  }

  table(rows, columns) {
    const totalWidth = columns.reduce((sum, c) => sum + c.width, 0);
    for (const row of rows) {
      let line = "";
      for (let i = 0; i < columns.length; i++) {
        const col = columns[i];
        const text = String(row[col.key] ?? "");
        line += this._alignCell(text, col.width, col.align);
      }
      this.line(line.slice(0, totalWidth));
    }
    return this;
  }

  tableBorder(rows, columns) {
    const horizontal =
      "+" +
      columns
        .map((c) => "-".repeat(c.width + 2))
        .join("+") +
      "+";

    this.line(horizontal);

    for (const row of rows) {
      let line = "|";

      for (const col of columns) {
        const text = String(row[col.key] ?? "");

        line +=
          " " +
          this._alignCell(text, col.width, col.align) +
          " |";
      }

      this.line(line);

      // Draw separator after header (optional)
      if (row === rows[0]) {
        this.line(horizontal);
      }
    }

    this.line(horizontal);

    return this;
  }

  // --- Graphics & Codes ---
  barcode(data, type = 73) {
    // Height (80px), Width (3), Font (0), Text position (below)
    this.buffer += this.GS + 'h\x50';
    this.buffer += this.GS + 'w\x03';
    this.buffer += this.GS + 'f\x00';
    this.buffer += this.GS + 'H\x02';

    if (type === 73) {
      // CODE128 requires formatting: "{B" + data
      // We adjust the length byte to include these 2 extra protocol characters
      const formattedData = '{B' + data;
      this.buffer += this.GS + 'k' + String.fromCharCode(type) + String.fromCharCode(formattedData.length) + formattedData;
    } else {
      // Fallback for other standard barcode types (like CODE39, JAN13, etc.)
      this.buffer += this.GS + 'k' + String.fromCharCode(type) + String.fromCharCode(data.length) + data;
    }

    return this;
  }

  qrCode(data, size = 6) {
    const store_len = data.length + 3;
    const pL = String.fromCharCode(store_len % 256);
    const pH = String.fromCharCode(Math.floor(store_len / 256));

    this.buffer += this.GS + '(k\x03\x00\x31\x43' + String.fromCharCode(size); // Size
    this.buffer += this.GS + '(k\x03\x00\x31\x45\x30'; // Error correction (Level L)
    this.buffer += this.GS + '(k' + pL + pH + '\x31\x50\x30' + data; // Store
    this.buffer += this.GS + '(k\x03\x00\x31\x51\x30'; // Print
    return this;
  }

  bmp(buffer) {
    return this._bmp(buffer);
  }

  bmpAdvance(buffer, targetWidth = null, targetHeight = null) {
    return this._bmp(buffer, targetWidth, targetHeight);
  }

  _bmp(buffer, targetWidth = null, targetHeight = null) {
    const view = new DataView(
      buffer.buffer,
      buffer.byteOffset,
      buffer.byteLength
    );

    // Validate BMP
    if (view.getUint16(0, true) !== 0x4d42) {
      throw new Error("Invalid BMP");
    }

    const pixelOffset = view.getUint32(10, true);
    const srcWidth = view.getInt32(18, true);
    const srcHeight = Math.abs(view.getInt32(22, true));
    const bpp = view.getUint16(28, true);

    if (bpp !== 24) {
      throw new Error("Only 24-bit BMP supported");
    }

    // Keep original size if no target size specified
    if (!targetWidth && !targetHeight) {
      targetWidth = srcWidth;
      targetHeight = srcHeight;
    } else if (targetWidth && !targetHeight) {
      targetHeight = Math.round(srcHeight * targetWidth / srcWidth);
    } else if (!targetWidth && targetHeight) {
      targetWidth = Math.round(srcWidth * targetHeight / srcHeight);
    }

    const rowSize = Math.floor((srcWidth * 3 + 3) / 4) * 4;
    const bytesPerRow = Math.ceil(targetWidth / 8);

    // ESC/POS Raster Header
    this.buffer += this.GS + "v0";
    this.buffer += "\x00";
    this.buffer += String.fromCharCode(bytesPerRow & 0xff);
    this.buffer += String.fromCharCode((bytesPerRow >> 8) & 0xff);
    this.buffer += String.fromCharCode(targetHeight & 0xff);
    this.buffer += String.fromCharCode((targetHeight >> 8) & 0xff);

    for (let y = 0; y < targetHeight; y++) {
      let byte = 0;
      let bit = 0;

      const srcY = Math.floor(y * srcHeight / targetHeight);

      for (let x = 0; x < targetWidth; x++) {
        const srcX = Math.floor(x * srcWidth / targetWidth);

        const row = pixelOffset + (srcHeight - 1 - srcY) * rowSize;
        const i = row + srcX * 3;

        const b = buffer[i];
        const g = buffer[i + 1];
        const r = buffer[i + 2];

        const gray =
          0.299 * r +
          0.587 * g +
          0.114 * b;

        if (gray < 128) {
          byte |= 0x80 >> bit;
        }

        bit++;

        if (bit === 8) {
          this.buffer += String.fromCharCode(byte);
          byte = 0;
          bit = 0;
        }
      }

      if (bit !== 0) {
        this.buffer += String.fromCharCode(byte);
      }
    }

    return this;
  }

  // --- Hardware Commands ---
  beep() {
    this.buffer += '\x1B\x42\x02\x02'; // Beep 2 times for 200ms
    return this;
  }

  beepOn(count = 2, duration = 2) {
    // Ensure values are within standard ESC/POS range (1-9)
    const n = Math.min(Math.max(count, 1), 9);
    const t = Math.min(Math.max(duration, 1), 9);

    // Command: ESC B n t
    this.buffer += this.ESC + 'B' + String.fromCharCode(n) + String.fromCharCode(t);
    return this;
  }

  openCashDrawer() {
    this.buffer += '\x1B\x70\x00\x19\xFA';
    return this;
  }

  feed(lines = 3) {
    this.buffer += this.LF.repeat(lines);
    return this;
  }

  cut() {
    // Full cut
    this.buffer += this.GS + 'V\x41\x00';
    return this;
  }

  getBuffer() {
    return this.buffer;
  }
}
