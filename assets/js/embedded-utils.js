// ---------- SHARED EMBEDDED-SYSTEMS HELPERS ----------

function toHex(n, digits = 8) {
  return '0x' + ((n >>> 0).toString(16).toUpperCase().padStart(digits, '0'));
}
function toBin32(n) {
  return (n >>> 0).toString(2).padStart(32, '0');
}
function fieldMask(width) {
  return width >= 32 ? 0xFFFFFFFF : ((1 << width) - 1);
}
function getBits(value, bitPos, width) {
  return (value >>> bitPos) & fieldMask(width);
}
function setBits(value, bitPos, width, fieldValue) {
  const mask = (fieldMask(width) << bitPos) >>> 0;
  return ((value & ~mask) | (((fieldValue & fieldMask(width)) << bitPos) & mask)) >>> 0;
}
// Renders a 32-bit value as a strip of clickable/plain bit spans, grouped in
// nibbles, msb first. onBitClick(bitIndexFromLsb) is optional.
function renderBitStrip(container, value, opts = {}) {
  container.innerHTML = '';
  for (let i = 31; i >= 0; i--) {
    const bit = (value >>> i) & 1;
    const span = document.createElement('span');
    span.className = 'ip-bit ' + (bit ? 'on' : 'off');
    span.textContent = bit;
    if (opts.highlightRange && i >= opts.highlightRange[0] && i <= opts.highlightRange[1]) {
      span.classList.add(opts.highlightClass || 'net');
    }
    if (opts.onBitClick) {
      span.style.cursor = 'pointer';
      span.addEventListener('click', () => opts.onBitClick(i));
    }
    container.appendChild(span);
    if (i % 4 === 0 && i !== 0) {
      const gap = document.createElement('span');
      gap.style.width = '6px';
      gap.style.display = 'inline-block';
      container.appendChild(gap);
    }
  }
}
