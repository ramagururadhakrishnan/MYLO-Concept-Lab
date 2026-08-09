// ---------- ADC SIMULATOR ----------

const ADC_STATE = { vin: 1.65, vref: 3.3, resolution: 12, sampleCycles: 15, adcClkMHz: 21 };
const ADC_RES_CYCLES = { 12: 12, 10: 10, 8: 8, 6: 6 };

function adcCompute() {
  const s = ADC_STATE;
  const maxCode = Math.pow(2, s.resolution) - 1;
  const code = Math.round((s.vin / s.vref) * maxCode);
  const clampedCode = Math.min(maxCode, Math.max(0, code));
  const totalCycles = s.sampleCycles + ADC_RES_CYCLES[s.resolution];
  const convTimeUs = totalCycles / s.adcClkMHz;
  const stepSize = s.vref / (maxCode + 1);
  return { maxCode, code: clampedCode, convTimeUs, stepSize };
}

function adcDraw() {
  const s = ADC_STATE;
  const c = adcCompute();
  const canvas = document.getElementById('adcCanvas');
  const ctx = canvas.getContext('2d');
  clearCanvas(ctx, canvas);
  const scaler = makeScaler(canvas, 0, s.vref, 0, 1, 34);
  drawFrame(ctx, scaler);

  // quantization staircase across the full range (coarser sampling for drawing clarity)
  const steps = Math.min(64, c.maxCode + 1);
  const stepV = s.vref / steps;
  ctx.strokeStyle = LAB_COLORS.rule;
  ctx.lineWidth = 1;
  for (let i = 0; i <= steps; i++) {
    const [x] = scaler.toPx(i * stepV, 0);
    ctx.beginPath(); ctx.moveTo(x, scaler.pad); ctx.lineTo(x, scaler.h - scaler.pad); ctx.stroke();
  }

  // Vin marker
  const [px] = scaler.toPx(s.vin, 0);
  ctx.fillStyle = LAB_COLORS.teal;
  ctx.fillRect(px - 1.5, scaler.pad, 3, scaler.h - 2 * scaler.pad);
  ctx.beginPath();
  ctx.arc(px, scaler.h / 2, 6, 0, Math.PI * 2);
  ctx.fillStyle = LAB_COLORS.teal;
  ctx.fill();

  ctx.fillStyle = LAB_COLORS.inkSoft;
  ctx.font = '11px IBM Plex Mono, monospace';
  ctx.textAlign = 'left';
  ctx.fillText('0V', scaler.pad + 2, scaler.h - 8);
  ctx.textAlign = 'right';
  ctx.fillText(s.vref.toFixed(2) + 'V', scaler.w - scaler.pad - 2, scaler.h - 8);
}

function adcRender() {
  const s = ADC_STATE;
  const c = adcCompute();
  document.getElementById('adcVinVal').textContent = s.vin.toFixed(3) + ' V';
  document.getElementById('adcVinValLabel').textContent = s.vin.toFixed(3) + ' V';
  document.getElementById('adcVrefVal').textContent = s.vref.toFixed(2) + ' V';
  document.getElementById('adcCodeDec').textContent = c.code;
  document.getElementById('adcCodeHex').textContent = '0x' + c.code.toString(16).toUpperCase().padStart(Math.ceil(s.resolution / 4), '0');
  document.getElementById('adcCodeBin').textContent = c.code.toString(2).padStart(s.resolution, '0');
  document.getElementById('adcConvTime').textContent = c.convTimeUs.toFixed(3) + ' µs';
  document.getElementById('adcStepSize').textContent = (c.stepSize * 1000).toFixed(3) + ' mV / step';
  adcDraw();
}

function initADCModule() {
  document.getElementById('adcVin').addEventListener('input', e => { ADC_STATE.vin = parseFloat(e.target.value); adcRender(); });
  document.getElementById('adcVref').addEventListener('change', e => { ADC_STATE.vref = parseFloat(e.target.value); adcRender(); });
  document.getElementById('adcResolution').addEventListener('change', e => { ADC_STATE.resolution = parseInt(e.target.value); adcRender(); });
  document.getElementById('adcSampleCycles').addEventListener('change', e => { ADC_STATE.sampleCycles = parseInt(e.target.value); adcRender(); });
  document.getElementById('adcClk').addEventListener('change', e => { ADC_STATE.adcClkMHz = parseFloat(e.target.value); adcRender(); });
  adcRender();
}
