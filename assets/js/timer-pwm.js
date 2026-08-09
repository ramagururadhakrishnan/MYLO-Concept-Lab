// ---------- TIMER + PWM SIMULATOR ----------

const TIM_STATE = { timClk: 84, psc: 83, arr: 999, ccr: 250 };

function timCompute() {
  const s = TIM_STATE;
  const ckCnt = (s.timClk * 1e6) / (s.psc + 1);
  const pwmFreq = ckCnt / (s.arr + 1);
  const duty = s.arr > 0 ? Math.min(100, (s.ccr / (s.arr + 1)) * 100) : 0;
  return { ckCnt, pwmFreq, duty };
}

function timDraw() {
  const s = TIM_STATE;
  const c = timCompute();
  const canvas = document.getElementById('timCanvas');
  const ctx = canvas.getContext('2d');
  clearCanvas(ctx, canvas);

  const periods = 2.5;
  const scaler = makeScaler(canvas, 0, periods * (s.arr + 1), -0.3, (s.arr + 1) * 1.15, 40);
  drawFrame(ctx, scaler);

  // counter sawtooth
  const sawPts = [];
  for (let p = 0; p < periods; p++) {
    sawPts.push([p * (s.arr + 1), 0]);
    sawPts.push([p * (s.arr + 1) + s.arr, s.arr]);
    sawPts.push([p * (s.arr + 1) + s.arr + 0.001, 0]);
  }
  drawPolyline(ctx, scaler, sawPts, { stroke: LAB_COLORS.inkSoft, width: 1.5 });

  // compare level
  drawLineSeg(ctx, scaler, 0, s.ccr, periods * (s.arr + 1), s.ccr, { stroke: LAB_COLORS.teal, width: 1, dash: [4, 3] });

  // PWM output (mode 1: high while counter < CCR)
  const pwmPts = [];
  for (let p = 0; p < periods; p++) {
    const base = p * (s.arr + 1);
    pwmPts.push([base, -0.15]);
    pwmPts.push([base + s.ccr, -0.15]);
    pwmPts.push([base + s.ccr, -0.28]);
    pwmPts.push([base + s.ccr, -0.28]);
    pwmPts.push([base + s.arr, -0.28]);
    pwmPts.push([base + s.arr, -0.15]);
  }
  drawPolyline(ctx, scaler, pwmPts, { stroke: LAB_COLORS.red, width: 2.5 });
}

function timRender() {
  const c = timCompute();
  document.getElementById('timPscVal').textContent = TIM_STATE.psc;
  document.getElementById('timArrVal').textContent = TIM_STATE.arr;
  document.getElementById('timCcrVal').textContent = TIM_STATE.ccr;
  document.getElementById('timCkCnt').textContent = (c.ckCnt / 1e3).toFixed(1) + ' kHz';
  document.getElementById('timFreq').textContent = c.pwmFreq >= 1000 ? (c.pwmFreq / 1000).toFixed(2) + ' kHz' : c.pwmFreq.toFixed(1) + ' Hz';
  document.getElementById('timDuty').textContent = c.duty.toFixed(1) + '%';
  timDraw();
}

function initTimerModule() {
  document.getElementById('timClk').addEventListener('change', e => { TIM_STATE.timClk = parseFloat(e.target.value); timRender(); });
  document.getElementById('timPsc').addEventListener('input', e => { TIM_STATE.psc = parseInt(e.target.value); if (TIM_STATE.ccr > TIM_STATE.arr) TIM_STATE.ccr = TIM_STATE.arr; timRender(); });
  document.getElementById('timArr').addEventListener('input', e => {
    TIM_STATE.arr = parseInt(e.target.value);
    document.getElementById('timCcr').max = TIM_STATE.arr;
    if (TIM_STATE.ccr > TIM_STATE.arr) { TIM_STATE.ccr = TIM_STATE.arr; document.getElementById('timCcr').value = TIM_STATE.ccr; }
    timRender();
  });
  document.getElementById('timCcr').addEventListener('input', e => { TIM_STATE.ccr = parseInt(e.target.value); timRender(); });
  timRender();
}
