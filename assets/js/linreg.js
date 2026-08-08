// ---------- LINEAR REGRESSION + GRADIENT DESCENT MODULE ----------

const LR_STATE = {
  points: [],
  trueM: 1.4, trueB: 2.2,
  m: 0, b: 0,
  history: [],
  lossGrid: null,
  mRange: [-1, 4], bRange: [-3, 8]
};

function lrGenerateData(seed) {
  const rng = mulberry32(seed);
  const pts = [];
  for (let i = 0; i < 22; i++) {
    const x = rng() * 10;
    const y = LR_STATE.trueM * x + LR_STATE.trueB + gaussian(rng) * 1.6;
    pts.push({ x, y });
  }
  LR_STATE.points = pts;
}

function lrLoss(m, b, points) {
  let s = 0;
  points.forEach(p => { const e = m * p.x + b - p.y; s += e * e; });
  return s / points.length;
}

function lrGradientStep(lr) {
  const pts = LR_STATE.points;
  let gm = 0, gb = 0;
  pts.forEach(p => {
    const err = LR_STATE.m * p.x + LR_STATE.b - p.y;
    gm += 2 * err * p.x;
    gb += 2 * err;
  });
  gm /= pts.length; gb /= pts.length;
  LR_STATE.m -= lr * gm;
  LR_STATE.b -= lr * gb;
}

function lrComputeLossGrid() {
  const res = 44;
  const [mLo, mHi] = LR_STATE.mRange, [bLo, bHi] = LR_STATE.bRange;
  const grid = [];
  let min = Infinity, max = -Infinity;
  for (let i = 0; i < res; i++) {
    const row = [];
    const m = mLo + (mHi - mLo) * (i / (res - 1));
    for (let j = 0; j < res; j++) {
      const b = bLo + (bHi - bLo) * (j / (res - 1));
      const l = lrLoss(m, b, LR_STATE.points);
      row.push(l);
      if (l < min) min = l;
      if (l > max) max = l;
    }
    grid.push(row);
  }
  LR_STATE.lossGrid = { grid, res, min, max };
}

function lrDrawFitCanvas() {
  const canvas = document.getElementById('lrFitCanvas');
  const ctx = canvas.getContext('2d');
  clearCanvas(ctx, canvas);
  const scaler = makeScaler(canvas, 0, 10, -2, 18);
  drawFrame(ctx, scaler);

  LR_STATE.points.forEach(p => drawPoint(ctx, scaler, p.x, p.y, { fill: LAB_COLORS.inkSoft, r: 4 }));

  const y0 = LR_STATE.m * 0 + LR_STATE.b;
  const y10 = LR_STATE.m * 10 + LR_STATE.b;
  drawLineSeg(ctx, scaler, 0, y0, 10, y10, { stroke: LAB_COLORS.red, width: 3 });
}

function lrDrawLossCanvas() {
  const canvas = document.getElementById('lrLossCanvas');
  const ctx = canvas.getContext('2d');
  const { grid, res, min, max } = LR_STATE.lossGrid;
  const scaler = makeScaler(canvas, LR_STATE.mRange[0], LR_STATE.mRange[1], LR_STATE.bRange[0], LR_STATE.bRange[1]);

  const cellW = (scaler.w - 2 * scaler.pad) / res;
  const cellH = (scaler.h - 2 * scaler.pad) / res;
  for (let i = 0; i < res; i++) {
    const m = LR_STATE.mRange[0] + (LR_STATE.mRange[1] - LR_STATE.mRange[0]) * (i / (res - 1));
    for (let j = 0; j < res; j++) {
      const b = LR_STATE.bRange[0] + (LR_STATE.bRange[1] - LR_STATE.bRange[0]) * (j / (res - 1));
      const t = Math.pow((grid[i][j] - min) / (max - min || 1), 0.45);
      ctx.fillStyle = lerpColor(LAB_COLORS.tealSoft, LAB_COLORS.red, t);
      const [px, py] = scaler.toPx(m, b);
      ctx.fillRect(px - cellW / 2, py - cellH / 2, cellW + 1, cellH + 1);
    }
  }
  drawFrame(ctx, scaler);

  // descent path
  const path = LR_STATE.history.map(h => [h.m, h.b]);
  drawPolyline(ctx, scaler, path, { stroke: LAB_COLORS.ink, width: 1.5 });
  LR_STATE.history.forEach((h, i) => {
    drawPoint(ctx, scaler, h.m, h.b, { fill: LAB_COLORS.card, stroke: LAB_COLORS.ink, r: 2.5, strokeWidth: 1 });
  });
  drawPoint(ctx, scaler, LR_STATE.m, LR_STATE.b, { fill: LAB_COLORS.ink, r: 5, stroke: LAB_COLORS.card, strokeWidth: 1.5 });
}

function lrUpdateReadout() {
  document.getElementById('lrM').textContent = LR_STATE.m.toFixed(2);
  document.getElementById('lrB').textContent = LR_STATE.b.toFixed(2);
  document.getElementById('lrLoss').textContent = lrLoss(LR_STATE.m, LR_STATE.b, LR_STATE.points).toFixed(2);
  document.getElementById('lrIter').textContent = LR_STATE.history.length;
}

function lrRedraw() {
  lrDrawFitCanvas();
  lrDrawLossCanvas();
  lrUpdateReadout();
}

function lrStep(n = 1) {
  const lr = parseFloat(document.getElementById('lrRate').value);
  for (let i = 0; i < n; i++) {
    LR_STATE.history.push({ m: LR_STATE.m, b: LR_STATE.b });
    lrGradientStep(lr);
  }
  lrRedraw();
}

function lrReset(newData) {
  if (newData) lrGenerateData(Math.floor(Math.random() * 1e9));
  LR_STATE.m = 0; LR_STATE.b = 0;
  LR_STATE.history = [];
  lrComputeLossGrid();
  lrRedraw();
}

function initLinRegModule() {
  lrGenerateData(42);
  lrComputeLossGrid();
  document.getElementById('lrStep').addEventListener('click', () => lrStep(1));
  document.getElementById('lrRun').addEventListener('click', () => lrStep(25));
  document.getElementById('lrResetParams').addEventListener('click', () => lrReset(false));
  document.getElementById('lrNewData').addEventListener('click', () => lrReset(true));
  document.getElementById('lrRate').addEventListener('input', e => {
    document.getElementById('lrRateVal').textContent = parseFloat(e.target.value).toFixed(3);
  });
  document.getElementById('lrRateVal').textContent = parseFloat(document.getElementById('lrRate').value).toFixed(3);
  lrRedraw();
}
