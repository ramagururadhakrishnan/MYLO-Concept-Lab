// ---------- UART FRAME VISUALIZER ----------

const UART_STATE = { baud: 115200, dataBits: 8, parity: 'none', stopBits: 1, byte: 0x41 };

function uartParityBit(byte, dataBits, parity) {
  if (parity === 'none') return null;
  let ones = 0;
  for (let i = 0; i < dataBits; i++) if ((byte >> i) & 1) ones++;
  return parity === 'even' ? (ones % 2) : (1 - (ones % 2));
}

function uartBuildFrame() {
  const s = UART_STATE;
  const bits = [{ v: 0, label: 'Start' }];
  for (let i = 0; i < s.dataBits; i++) bits.push({ v: (s.byte >> i) & 1, label: `D${i}` });
  const p = uartParityBit(s.byte, s.dataBits, s.parity);
  if (p !== null) bits.push({ v: p, label: 'Parity' });
  const stopCount = s.stopBits === 1.5 ? 1 : s.stopBits; // draw 1.5 as one wide stop bit
  for (let i = 0; i < Math.round(s.stopBits === 1.5 ? 1 : s.stopBits); i++) bits.push({ v: 1, label: 'Stop', wide: s.stopBits === 1.5 });
  return bits;
}

function uartDraw() {
  const s = UART_STATE;
  const bits = uartBuildFrame();
  const canvas = document.getElementById('uartCanvas');
  const ctx = canvas.getContext('2d');
  clearCanvas(ctx, canvas);

  const totalWidth = bits.reduce((s2, b) => s2 + (b.wide ? 1.5 : 1), 0);
  const scaler = makeScaler(canvas, 0, totalWidth, -0.3, 1.5, 30);
  drawFrame(ctx, scaler);

  let x = 0;
  ctx.font = '11px IBM Plex Mono, monospace';
  bits.forEach(b => {
    const w = b.wide ? 1.5 : 1;
    const y = b.v ? 1 : 0;
    drawLineSeg(ctx, scaler, x, y, x + w, y, { stroke: LAB_COLORS.red, width: 2.5 });
    // vertical transition to next bit
    x += w;
    ctx.fillStyle = LAB_COLORS.inkSoft;
    ctx.textAlign = 'center';
    const [lx, ly] = scaler.toPx(x - w / 2, -0.18);
    ctx.fillText(b.label, lx, ly);
  });
  // vertical transitions between bits
  let xi = 0;
  for (let i = 0; i < bits.length - 1; i++) {
    const w = bits[i].wide ? 1.5 : 1;
    xi += w;
    if (bits[i].v !== bits[i + 1].v) {
      drawLineSeg(ctx, scaler, xi, bits[i].v, xi, bits[i + 1].v, { stroke: LAB_COLORS.red, width: 2.5 });
    }
  }
  // idle line before/after
  drawLineSeg(ctx, scaler, -0.4, 1, 0, 1, { stroke: LAB_COLORS.rule, width: 2, dash: [3, 3] });
  drawLineSeg(ctx, scaler, totalWidth, 1, totalWidth + 0.4, 1, { stroke: LAB_COLORS.rule, width: 2, dash: [3, 3] });
}

function uartRender() {
  const s = UART_STATE;
  const bitTimeUs = 1e6 / s.baud;
  const bits = uartBuildFrame();
  const frameBits = 1 + s.dataBits + (s.parity !== 'none' ? 1 : 0) + s.stopBits;
  const frameTimeUs = frameBits * bitTimeUs;
  const effectiveDataRate = (s.dataBits / frameBits) * s.baud;

  document.getElementById('uartByteHex').textContent = '0x' + s.byte.toString(16).toUpperCase().padStart(2, '0');
  document.getElementById('uartBitTime').textContent = bitTimeUs.toFixed(2) + ' µs';
  document.getElementById('uartFrameTime').textContent = frameTimeUs.toFixed(2) + ' µs';
  document.getElementById('uartFrameBits').textContent = frameBits.toFixed(1);
  document.getElementById('uartEffRate').textContent = (effectiveDataRate / 1000).toFixed(1) + ' kbit/s data (of ' + (s.baud / 1000).toFixed(1) + ' kbaud)';
  uartDraw();
}

function initUARTModule() {
  document.getElementById('uartByteInput').addEventListener('input', e => {
    let v = parseInt(e.target.value, 16);
    if (isNaN(v)) v = 0;
    UART_STATE.byte = Math.min(255, Math.max(0, v));
    uartRender();
  });
  document.getElementById('uartBaud').addEventListener('change', e => { UART_STATE.baud = parseInt(e.target.value); uartRender(); });
  document.getElementById('uartDataBits').addEventListener('change', e => { UART_STATE.dataBits = parseInt(e.target.value); uartRender(); });
  document.getElementById('uartParity').addEventListener('change', e => { UART_STATE.parity = e.target.value; uartRender(); });
  document.getElementById('uartStopBits').addEventListener('change', e => { UART_STATE.stopBits = parseFloat(e.target.value); uartRender(); });
  uartRender();
}
