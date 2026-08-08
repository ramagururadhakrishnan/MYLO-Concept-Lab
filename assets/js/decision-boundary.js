// ---------- DECISION BOUNDARY / LOGISTIC REGRESSION MODULE ----------

const DB_RANGE = { xMin: 0, xMax: 10, yMin: 0, yMax: 10 };
const DB_STATE = { points: [], w1: 0, w2: 0, bias: 0, iter: 0, lossHistory: [] };

function dbGenerateData(seed) {
  const rng = mulberry32(seed);
  const pts = [];
  for (let i = 0; i < 20; i++) {
    pts.push({ x: 3 + gaussian(rng) * 1.6, y: 6.5 + gaussian(rng) * 1.6, label: 0 });
  }
  for (let i = 0; i < 20; i++) {
    pts.push({ x: 7 + gaussian(rng) * 1.6, y: 3.5 + gaussian(rng) * 1.6, label: 1 });
  }
  DB_STATE.points = pts.filter(p => p.x >= 0 && p.x <= 10 && p.y >= 0 && p.y <= 10);
}

function sigmoid(z) { return 1 / (1 + Math.exp(-z)); }

function dbPredictProb(x, y) {
  return sigmoid(DB_STATE.w1 * x + DB_STATE.w2 * y + DB_STATE.bias);
}

function dbLoss() {
  let s = 0;
  DB_STATE.points.forEach(p => {
    const pr = Math.min(Math.max(dbPredictProb(p.x, p.y), 1e-6), 1 - 1e-6);
    s += -(p.label * Math.log(pr) + (1 - p.label) * Math.log(1 - pr));
  });
  return s / DB_STATE.points.length;
}

function dbGradientStep(lr) {
  let g1 = 0, g2 = 0, gb = 0;
  DB_STATE.points.forEach(p => {
    const err = dbPredictProb(p.x, p.y) - p.label;
    g1 += err * p.x; g2 += err * p.y; gb += err;
  });
  const n = DB_STATE.points.length;
  DB_STATE.w1 -= lr * g1 / n;
  DB_STATE.w2 -= lr * g2 / n;
  DB_STATE.bias -= lr * gb / n;
  DB_STATE.iter++;
  DB_STATE.lossHistory.push(dbLoss());
}

function dbAccuracy() {
  let correct = 0;
  DB_STATE.points.forEach(p => {
    const pred = dbPredictProb(p.x, p.y) >= 0.5 ? 1 : 0;
    if (pred === p.label) correct++;
  });
  return correct / DB_STATE.points.length;
}

function dbDrawCanvas() {
  const canvas = document.getElementById('dbCanvas');
  const ctx = canvas.getContext('2d');
  const scaler = makeScaler(canvas, DB_RANGE.xMin, DB_RANGE.xMax, DB_RANGE.yMin, DB_RANGE.yMax);
  clearCanvas(ctx, canvas);

  const res = 36;
  const cellW = (scaler.w - 2 * scaler.pad) / res;
  const cellH = (scaler.h - 2 * scaler.pad) / res;
  for (let i = 0; i < res; i++) {
    const x = DB_RANGE.xMin + (DB_RANGE.xMax - DB_RANGE.xMin) * ((i + 0.5) / res);
    for (let j = 0; j < res; j++) {
      const y = DB_RANGE.yMin + (DB_RANGE.yMax - DB_RANGE.yMin) * ((j + 0.5) / res);
      const prob = dbPredictProb(x, y);
      ctx.fillStyle = prob >= 0.5 ? LAB_COLORS.redSoft : LAB_COLORS.tealSoft;
      ctx.globalAlpha = 0.3 + 0.25 * Math.abs(prob - 0.5) * 2;
      const [px, py] = scaler.toPx(x, y);
      ctx.fillRect(px - cellW / 2, py - cellH / 2, cellW + 1, cellH + 1);
    }
  }
  ctx.globalAlpha = 1;
  drawFrame(ctx, scaler);

  // decision boundary line: w1*x + w2*y + bias = 0  ->  y = -(w1*x+bias)/w2
  if (Math.abs(DB_STATE.w2) > 1e-6) {
    const y0 = -(DB_STATE.w1 * DB_RANGE.xMin + DB_STATE.bias) / DB_STATE.w2;
    const y1 = -(DB_STATE.w1 * DB_RANGE.xMax + DB_STATE.bias) / DB_STATE.w2;
    drawLineSeg(ctx, scaler, DB_RANGE.xMin, y0, DB_RANGE.xMax, y1, { stroke: LAB_COLORS.ink, width: 2.5 });
  }

  DB_STATE.points.forEach(p => {
    const pred = dbPredictProb(p.x, p.y) >= 0.5 ? 1 : 0;
    const misclassified = pred !== p.label;
    drawPoint(ctx, scaler, p.x, p.y, {
      fill: p.label === 1 ? LAB_COLORS.red : LAB_COLORS.teal,
      r: misclassified ? 6 : 4.5,
      stroke: misclassified ? LAB_COLORS.ink : null,
      strokeWidth: 2
    });
  });
}

function dbDrawLossCanvas() {
  const canvas = document.getElementById('dbLossCanvas');
  const ctx = canvas.getContext('2d');
  clearCanvas(ctx, canvas);
  const hist = DB_STATE.lossHistory;
  const maxL = Math.max(0.5, ...hist);
  const scaler = makeScaler(canvas, 0, Math.max(1, hist.length - 1), 0, maxL * 1.1);
  drawFrame(ctx, scaler);
  drawPolyline(ctx, scaler, hist.map((v, i) => [i, v]), { stroke: LAB_COLORS.red, width: 2 });
}

function dbRedraw() {
  dbDrawCanvas();
  dbDrawLossCanvas();
  document.getElementById('dbIter').textContent = DB_STATE.iter;
  document.getElementById('dbLoss').textContent = dbLoss().toFixed(3);
  document.getElementById('dbAcc').textContent = (dbAccuracy() * 100).toFixed(0) + '%';
}

function dbStep(n) {
  const lr = parseFloat(document.getElementById('dbRate').value);
  for (let i = 0; i < n; i++) dbGradientStep(lr);
  dbRedraw();
}

function dbResetWeights() {
  DB_STATE.w1 = 0; DB_STATE.w2 = 0; DB_STATE.bias = 0;
  DB_STATE.iter = 0; DB_STATE.lossHistory = [];
  dbRedraw();
}

function initDecisionBoundaryModule() {
  dbGenerateData(3);
  document.getElementById('dbStep').addEventListener('click', () => dbStep(1));
  document.getElementById('dbRun').addEventListener('click', () => dbStep(25));
  document.getElementById('dbResetWeights').addEventListener('click', dbResetWeights);
  document.getElementById('dbNewData').addEventListener('click', () => {
    dbGenerateData(Math.floor(Math.random() * 1e9));
    dbResetWeights();
  });
  document.getElementById('dbRate').addEventListener('input', e => {
    document.getElementById('dbRateVal').textContent = parseFloat(e.target.value).toFixed(3);
  });
  document.getElementById('dbRateVal').textContent = parseFloat(document.getElementById('dbRate').value).toFixed(3);
  dbRedraw();
}
