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
    this._pairsCache.push({ label, value, totalWidth });
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

  // --- Graphics & Codes ---
  barcode(data, type = 73) {
    // Type 73 is CODE128. Requires data in format { [Data] }
    this.buffer += this.GS + 'h\x50'; // Height (80px)
    this.buffer += this.GS + 'w\x03'; // Width (3)
    this.buffer += this.GS + 'f\x00'; // Font
    this.buffer += this.GS + 'H\x02'; // Text position (below)
    this.buffer +=
      this.GS + 'k' + String.fromCharCode(type) + String.fromCharCode(data.length) + data;
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
