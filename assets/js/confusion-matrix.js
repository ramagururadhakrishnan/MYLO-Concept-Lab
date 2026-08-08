// ---------- CONFUSION MATRIX / PRECISION / RECALL / F1 MODULE ----------
// A fixed set of synthetic "classifier scores" (0-1) with true labels.
// Moving the threshold slider re-splits predictions and recomputes every
// metric live, so students can feel the precision/recall tradeoff.

const CM_STATE = { examples: [], threshold: 0.5 };

function cmGenerateData(seed) {
  const rng = mulberry32(seed);
  const examples = [];
  for (let i = 0; i < 22; i++) {
    const score = Math.min(1, Math.max(0, 0.62 + gaussian(rng) * 0.16));
    examples.push({ score, label: 1 });
  }
  for (let i = 0; i < 22; i++) {
    const score = Math.min(1, Math.max(0, 0.38 + gaussian(rng) * 0.16));
    examples.push({ score, label: 0 });
  }
  CM_STATE.examples = examples;
}

function cmCompute() {
  let tp = 0, fp = 0, fn = 0, tn = 0;
  CM_STATE.examples.forEach(e => {
    const pred = e.score >= CM_STATE.threshold ? 1 : 0;
    if (pred === 1 && e.label === 1) tp++;
    else if (pred === 1 && e.label === 0) fp++;
    else if (pred === 0 && e.label === 1) fn++;
    else tn++;
  });
  const precision = tp + fp === 0 ? 0 : tp / (tp + fp);
  const recall = tp + fn === 0 ? 0 : tp / (tp + fn);
  const f1 = precision + recall === 0 ? 0 : 2 * precision * recall / (precision + recall);
  const accuracy = (tp + tn) / CM_STATE.examples.length;
  return { tp, fp, fn, tn, precision, recall, f1, accuracy };
}

function cmDrawStrip() {
  const canvas = document.getElementById('cmStripCanvas');
  const ctx = canvas.getContext('2d');
  clearCanvas(ctx, canvas);
  const scaler = makeScaler(canvas, 0, 1, 0, 1, 30);
  drawFrame(ctx, scaler);

  CM_STATE.examples.forEach((e, i) => {
    const jitter = ((i * 37) % 100) / 100; // deterministic vertical spread, avoids overlap
    const pred = e.score >= CM_STATE.threshold ? 1 : 0;
    const correct = pred === e.label;
    drawPoint(ctx, scaler, e.score, 0.12 + jitter * 0.76, {
      fill: e.label === 1 ? LAB_COLORS.red : LAB_COLORS.teal,
      r: correct ? 4.5 : 6,
      stroke: correct ? null : LAB_COLORS.ink,
      strokeWidth: 2
    });
  });

  const [tx] = scaler.toPx(CM_STATE.threshold, 0);
  ctx.beginPath();
  ctx.moveTo(tx, scaler.pad);
  ctx.lineTo(tx, scaler.h - scaler.pad);
  ctx.strokeStyle = LAB_COLORS.ink;
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 3]);
  ctx.stroke();
  ctx.setLineDash([]);
}

function cmRedraw() {
  const r = cmCompute();
  cmDrawStrip();

  document.getElementById('cmThreshVal').textContent = CM_STATE.threshold.toFixed(2);
  document.getElementById('cellTP').textContent = r.tp;
  document.getElementById('cellFP').textContent = r.fp;
  document.getElementById('cellFN').textContent = r.fn;
  document.getElementById('cellTN').textContent = r.tn;

  document.getElementById('statPrecision').textContent = r.precision.toFixed(2);
  document.getElementById('statRecall').textContent = r.recall.toFixed(2);
  document.getElementById('statF1').textContent = r.f1.toFixed(2);
  document.getElementById('statAccuracy').textContent = (r.accuracy * 100).toFixed(0) + '%';
}

function initConfusionMatrixModule() {
  cmGenerateData(21);
  document.getElementById('cmThreshold').addEventListener('input', e => {
    CM_STATE.threshold = parseFloat(e.target.value);
    cmRedraw();
  });
  document.getElementById('cmNewData').addEventListener('click', () => {
    cmGenerateData(Math.floor(Math.random() * 1e9));
    cmRedraw();
  });
  cmRedraw();
}
