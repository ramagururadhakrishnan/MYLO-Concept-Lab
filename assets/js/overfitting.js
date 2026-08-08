// ---------- OVERFITTING VS UNDERFITTING MODULE ----------
// Fits a polynomial of adjustable degree to noisy train data and compares
// train vs. held-out test error, the classic underfit/overfit demo.

const OF_STATE = { train: [], test: [], degree: 3, errByDegree: [] };

function ofTrueFn(x) {
  return Math.sin(x * 0.9) * 2.2 + 0.15 * x + 3;
}

function ofGenerateData(seed) {
  const rng = mulberry32(seed);
  const train = [], test = [];
  for (let i = 0; i < 16; i++) {
    const x = rng() * 10;
    train.push({ x, y: ofTrueFn(x) + gaussian(rng) * 0.7 });
  }
  for (let i = 0; i < 10; i++) {
    const x = rng() * 10;
    test.push({ x, y: ofTrueFn(x) + gaussian(rng) * 0.7 });
  }
  OF_STATE.train = train; OF_STATE.test = test;
}

// x is normalized to [-1,1] before building the Vandermonde matrix so high
// degrees stay numerically stable.
function ofNorm(x) { return (x - 5) / 5; }

function solveLinearSystem(A, b) {
  const n = A.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let col = 0; col < n; col++) {
    let piv = col;
    for (let r = col + 1; r < n; r++) if (Math.abs(M[r][col]) > Math.abs(M[piv][col])) piv = r;
    [M[col], M[piv]] = [M[piv], M[col]];
    if (Math.abs(M[col][col]) < 1e-10) continue;
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const factor = M[r][col] / M[col][col];
      for (let c = col; c <= n; c++) M[r][c] -= factor * M[col][c];
    }
  }
  return M.map((row, i) => Math.abs(row[i]) < 1e-10 ? 0 : row[n] / row[i]);
}

function polyFit(points, degree) {
  const d = degree + 1;
  const XT_X = Array.from({ length: d }, () => new Array(d).fill(0));
  const XT_y = new Array(d).fill(0);
  points.forEach(p => {
    const xn = ofNorm(p.x);
    const powers = [];
    let acc = 1;
    for (let k = 0; k <= degree; k++) { powers.push(acc); acc *= xn; }
    for (let i = 0; i < d; i++) {
      XT_y[i] += powers[i] * p.y;
      for (let j = 0; j < d; j++) XT_X[i][j] += powers[i] * powers[j];
    }
  });
  // tiny ridge term for numerical stability at high degree
  for (let i = 0; i < d; i++) XT_X[i][i] += 1e-6;
  return solveLinearSystem(XT_X, XT_y);
}

function polyPredict(weights, x) {
  const xn = ofNorm(x);
  let acc = 1, y = 0;
  for (let k = 0; k < weights.length; k++) { y += weights[k] * acc; acc *= xn; }
  return y;
}

function mse(weights, points) {
  let s = 0;
  points.forEach(p => { const e = polyPredict(weights, p.x) - p.y; s += e * e; });
  return s / points.length;
}

function ofComputeErrorCurve() {
  const errs = [];
  for (let d = 1; d <= 9; d++) {
    const w = polyFit(OF_STATE.train, d);
    errs.push({ degree: d, train: mse(w, OF_STATE.train), test: mse(w, OF_STATE.test) });
  }
  OF_STATE.errByDegree = errs;
}

function ofDrawFitCanvas(weights) {
  const canvas = document.getElementById('ofFitCanvas');
  const ctx = canvas.getContext('2d');
  clearCanvas(ctx, canvas);
  const scaler = makeScaler(canvas, 0, 10, -2, 8);
  drawFrame(ctx, scaler);

  const curve = [];
  for (let i = 0; i <= 100; i++) {
    const x = i / 10;
    curve.push([x, polyPredict(weights, x)]);
  }
  drawPolyline(ctx, scaler, curve, { stroke: LAB_COLORS.ink, width: 2.5 });

  OF_STATE.train.forEach(p => drawPoint(ctx, scaler, p.x, p.y, { fill: LAB_COLORS.teal, r: 4.5 }));
  OF_STATE.test.forEach(p => drawPoint(ctx, scaler, p.x, p.y, { fill: LAB_COLORS.card, stroke: LAB_COLORS.red, strokeWidth: 2, r: 4.5 }));
}

function ofDrawErrorCanvas() {
  const canvas = document.getElementById('ofErrCanvas');
  const ctx = canvas.getContext('2d');
  clearCanvas(ctx, canvas);
  const maxErr = Math.min(20, Math.max(...OF_STATE.errByDegree.map(e => Math.max(e.train, e.test))) * 1.1);
  const scaler = makeScaler(canvas, 1, 9, 0, maxErr);
  drawFrame(ctx, scaler);

  drawPolyline(ctx, scaler, OF_STATE.errByDegree.map(e => [e.degree, e.train]), { stroke: LAB_COLORS.teal, width: 2 });
  drawPolyline(ctx, scaler, OF_STATE.errByDegree.map(e => [e.degree, e.test]), { stroke: LAB_COLORS.red, width: 2 });
  OF_STATE.errByDegree.forEach(e => {
    drawPoint(ctx, scaler, e.degree, e.train, { fill: LAB_COLORS.teal, r: 3 });
    drawPoint(ctx, scaler, e.degree, e.test, { fill: LAB_COLORS.red, r: 3 });
  });

  const [px] = scaler.toPx(OF_STATE.degree, 0);
  ctx.beginPath();
  ctx.moveTo(px, scaler.pad);
  ctx.lineTo(px, scaler.h - scaler.pad);
  ctx.strokeStyle = LAB_COLORS.inkSoft;
  ctx.setLineDash([4, 3]);
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.setLineDash([]);
}

function ofRedraw() {
  const weights = polyFit(OF_STATE.train, OF_STATE.degree);
  ofDrawFitCanvas(weights);
  ofDrawErrorCanvas();
  document.getElementById('ofDegreeVal').textContent = OF_STATE.degree;
  document.getElementById('ofTrainErr').textContent = mse(weights, OF_STATE.train).toFixed(2);
  document.getElementById('ofTestErr').textContent = mse(weights, OF_STATE.test).toFixed(2);
  const gap = mse(weights, OF_STATE.test) - mse(weights, OF_STATE.train);
  const verdict = document.getElementById('ofVerdict');
  if (OF_STATE.degree <= 2) verdict.textContent = 'Likely underfitting — too simple to capture the curve.';
  else if (gap > 2.5) verdict.textContent = 'Likely overfitting — fits train noise, test error is much higher.';
  else verdict.textContent = 'Reasonable fit — train and test error are close.';
}

function initOverfittingModule() {
  ofGenerateData(7);
  ofComputeErrorCurve();
  const slider = document.getElementById('ofDegree');
  slider.addEventListener('input', e => { OF_STATE.degree = parseInt(e.target.value); ofRedraw(); });
  document.getElementById('ofNewData').addEventListener('click', () => {
    ofGenerateData(Math.floor(Math.random() * 1e9));
    ofComputeErrorCurve();
    ofRedraw();
  });
  ofRedraw();
}
