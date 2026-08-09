// ---------- SPI / I2C TIMING DIAGRAMS ----------

const SPII2C_STATE = { mode: 'spi', cpol: 0, cpha: 0, byte: 0xA5 };

function spiDraw() {
  const s = SPII2C_STATE;
  const canvas = document.getElementById('spii2cCanvas');
  const ctx = canvas.getContext('2d');
  clearCanvas(ctx, canvas);
  const bits = 8;
  const scaler = makeScaler(canvas, 0, bits, -0.4, 2.6, 30);
  drawFrame(ctx, scaler);

  // SCK clock line: idle level = CPOL, toggles each half-bit
  const idle = s.cpol;
  const sckPts = [[0, idle]];
  for (let i = 0; i < bits; i++) {
    const lvl1 = i % 2 === 0 ? 1 - idle : idle;
    sckPts.push([i + 0.5, sckPts[sckPts.length - 1][1]]);
    sckPts.push([i + 0.5, idle === 0 ? 1 : 0]);
    sckPts.push([i + 1, idle === 0 ? 1 : 0]);
    sckPts.push([i + 1, idle]);
  }
  const clkLine = [];
  let lvl = idle;
  clkLine.push([0, lvl + 1.6]);
  for (let i = 0; i < bits; i++) {
    clkLine.push([i + 0.5, lvl + 1.6]);
    lvl = 1 - lvl;
    clkLine.push([i + 0.5, lvl + 1.6]);
    clkLine.push([i + 1, lvl + 1.6]);
    lvl = idle;
    clkLine.push([i + 1, lvl + 1.6]);
  }
  drawPolyline(ctx, scaler, clkLine, { stroke: LAB_COLORS.ink, width: 2 });

  // MOSI data line: one level per bit, msb first
  const dataLine = [];
  for (let i = 0; i < bits; i++) {
    const bitVal = (s.byte >> (bits - 1 - i)) & 1;
    dataLine.push([i, bitVal * 0.8]);
    dataLine.push([i + 1, bitVal * 0.8]);
  }
  drawPolyline(ctx, scaler, dataLine, { stroke: LAB_COLORS.teal, width: 2 });

  // sample points: CPHA=0 samples on first edge (0.5 into cycle from idle... actually first transition), CPHA=1 samples on second edge
  ctx.fillStyle = LAB_COLORS.red;
  for (let i = 0; i < bits; i++) {
    const sampleX = s.cpha === 0 ? i : i + 0.5;
    if (s.cpha === 0 && i === 0) continue; // no clock edge before first bit when CPHA=0 sampling at cycle start boundary handled visually
    const [px] = scaler.toPx(sampleX, 0);
    ctx.beginPath();
    ctx.moveTo(px, scaler.pad);
    ctx.lineTo(px, scaler.h - scaler.pad);
    ctx.strokeStyle = 'rgba(180,57,44,0.35)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([2, 3]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  ctx.fillStyle = LAB_COLORS.inkSoft;
  ctx.font = '11px IBM Plex Mono, monospace';
  ctx.textAlign = 'left';
  let [lx, ly] = scaler.toPx(0, 2.35);
  ctx.fillText('SCK', 4, ly);
  [lx, ly] = scaler.toPx(0, 0.9);
  ctx.fillText('MOSI', 4, ly);
}

function i2cDraw() {
  const s = SPII2C_STATE;
  const canvas = document.getElementById('spii2cCanvas');
  const ctx = canvas.getContext('2d');
  clearCanvas(ctx, canvas);
  const bits = 9; // 8 data + ACK
  const scaler = makeScaler(canvas, -0.5, bits + 0.5, -0.4, 2.6, 30);
  drawFrame(ctx, scaler);

  // SCL: low during start, then toggles once per bit
  const sclLine = [[-0.5, 1.6]];
  for (let i = 0; i < bits; i++) {
    sclLine.push([i, 1.6]);
    sclLine.push([i, 2.4]);
    sclLine.push([i + 0.7, 2.4]);
    sclLine.push([i + 0.7, 1.6]);
    sclLine.push([i + 1, 1.6]);
  }
  drawPolyline(ctx, scaler, sclLine, { stroke: LAB_COLORS.ink, width: 2 });

  // SDA: start condition = falls while SCL high; then 8 data bits + ACK (pulled low by receiver); stop = rises while SCL high
  const sdaLine = [];
  sdaLine.push([-0.5, 0.8]);
  sdaLine.push([-0.2, 0.8]);
  sdaLine.push([-0.2, 0]); // start condition: falls
  sdaLine.push([0, 0]);
  for (let i = 0; i < 8; i++) {
    const bitVal = (s.byte >> (7 - i)) & 1;
    sdaLine.push([i, bitVal * 0.8]);
    sdaLine.push([i + 1, bitVal * 0.8]);
  }
  // ACK bit (bit index 8): receiver pulls low
  sdaLine.push([8, 0]);
  sdaLine.push([9, 0]);
  // stop condition: SDA rises while SCL high
  sdaLine.push([9, 0]);
  sdaLine.push([9.3, 0]);
  sdaLine.push([9.3, 0.8]);
  drawPolyline(ctx, scaler, sdaLine, { stroke: LAB_COLORS.teal, width: 2 });

  ctx.fillStyle = LAB_COLORS.inkSoft;
  ctx.font = '11px IBM Plex Mono, monospace';
  ctx.textAlign = 'center';
  ['START', 'D7', 'D6', 'D5', 'D4', 'D3', 'D2', 'D1', 'D0', 'ACK', 'STOP'].forEach((label, idx) => {
    const xPos = idx === 0 ? -0.2 : idx === 10 ? 9.3 : idx - 1 + 0.5;
    const [lx, ly] = scaler.toPx(xPos, -0.2);
    ctx.fillText(label, lx, ly);
  });
}

function spii2cRender() {
  const s = SPII2C_STATE;
  document.getElementById('spii2cByteHex').textContent = '0x' + s.byte.toString(16).toUpperCase().padStart(2, '0');
  document.getElementById('spiControls').style.display = s.mode === 'spi' ? '' : 'none';
  document.getElementById('spii2cModeNote').textContent = s.mode === 'spi'
    ? `CPOL=${s.cpol}, CPHA=${s.cpha} — data is sampled on the ${s.cpha === 0 ? 'first' : 'second'} SCK edge of each bit period.`
    : 'START = SDA falls while SCL is high. Each bit is valid while SCL is high. The 9th clock is ACK (receiver pulls SDA low). STOP = SDA rises while SCL is high.';
  if (s.mode === 'spi') spiDraw(); else i2cDraw();
}

function initSPII2CModule() {
  document.getElementById('spii2cModeSelect').addEventListener('change', e => { SPII2C_STATE.mode = e.target.value; spii2cRender(); });
  document.getElementById('spii2cByteInput').addEventListener('input', e => {
    let v = parseInt(e.target.value, 16);
    if (isNaN(v)) v = 0;
    SPII2C_STATE.byte = Math.min(255, Math.max(0, v));
    spii2cRender();
  });
  document.getElementById('spiCpol').addEventListener('change', e => { SPII2C_STATE.cpol = parseInt(e.target.value); spii2cRender(); });
  document.getElementById('spiCpha').addEventListener('change', e => { SPII2C_STATE.cpha = parseInt(e.target.value); spii2cRender(); });
  spii2cRender();
}
