// ---------- K-NEAREST NEIGHBORS MODULE ----------

const KNN_STATE = { points: [], k: 5, query: { x: 5, y: 5 } };
const KNN_RANGE = { xMin: 0, xMax: 10, yMin: 0, yMax: 10 };

function knnGenerateData(seed) {
  const rng = mulberry32(seed);
  const pts = [];
  for (let i = 0; i < 16; i++) {
    pts.push({ x: 3 + gaussian(rng) * 1.4, y: 3 + gaussian(rng) * 1.4, label: 'a' });
  }
  for (let i = 0; i < 16; i++) {
    pts.push({ x: 7 + gaussian(rng) * 1.4, y: 7 + gaussian(rng) * 1.4, label: 'b' });
  }
  KNN_STATE.points = pts.filter(p => p.x >= 0 && p.x <= 10 && p.y >= 0 && p.y <= 10);
}

function knnClassify(qx, qy, k) {
  const ranked = KNN_STATE.points
    .map(p => ({ p, d: Math.hypot(p.x - qx, p.y - qy) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, k);
  const votesA = ranked.filter(r => r.p.label === 'a').length;
  const votesB = ranked.length - votesA;
  return { ranked, votesA, votesB, label: votesA >= votesB ? 'a' : 'b' };
}

function knnRedraw() {
  const canvas = document.getElementById('knnCanvas');
  const ctx = canvas.getContext('2d');
  const scaler = makeScaler(canvas, KNN_RANGE.xMin, KNN_RANGE.xMax, KNN_RANGE.yMin, KNN_RANGE.yMax);
  clearCanvas(ctx, canvas);

  // coarse background shading showing the current decision region
  const res = 34;
  const cellW = (scaler.w - 2 * scaler.pad) / res;
  const cellH = (scaler.h - 2 * scaler.pad) / res;
  for (let i = 0; i < res; i++) {
    const x = KNN_RANGE.xMin + (KNN_RANGE.xMax - KNN_RANGE.xMin) * ((i + 0.5) / res);
    for (let j = 0; j < res; j++) {
      const y = KNN_RANGE.yMin + (KNN_RANGE.yMax - KNN_RANGE.yMin) * ((j + 0.5) / res);
      const { label } = knnClassify(x, y, KNN_STATE.k);
      ctx.fillStyle = label === 'a' ? LAB_COLORS.tealSoft : LAB_COLORS.redSoft;
      ctx.globalAlpha = 0.35;
      const [px, py] = scaler.toPx(x, y);
      ctx.fillRect(px - cellW / 2, py - cellH / 2, cellW + 1, cellH + 1);
    }
  }
  ctx.globalAlpha = 1;
  drawFrame(ctx, scaler);

  const result = knnClassify(KNN_STATE.query.x, KNN_STATE.query.y, KNN_STATE.k);

  // lines from query to its k neighbors
  result.ranked.forEach(r => {
    drawLineSeg(ctx, scaler, KNN_STATE.query.x, KNN_STATE.query.y, r.p.x, r.p.y,
      { stroke: LAB_COLORS.inkSoft, width: 1, dash: [3, 3] });
  });

  KNN_STATE.points.forEach(p => {
    const isNeighbor = result.ranked.some(r => r.p === p);
    drawPoint(ctx, scaler, p.x, p.y, {
      fill: p.label === 'a' ? LAB_COLORS.teal : LAB_COLORS.red,
      r: isNeighbor ? 6 : 4.5,
      stroke: isNeighbor ? LAB_COLORS.ink : null,
      strokeWidth: 2
    });
  });

  drawPoint(ctx, scaler, KNN_STATE.query.x, KNN_STATE.query.y, {
    fill: result.label === 'a' ? LAB_COLORS.teal : LAB_COLORS.red,
    r: 8, stroke: LAB_COLORS.card, strokeWidth: 2.5
  });

  document.getElementById('knnKVal').textContent = KNN_STATE.k;
  document.getElementById('knnVotes').textContent = `${result.votesA} teal vs ${result.votesB} red`;
  document.getElementById('knnPrediction').textContent = result.label === 'a' ? 'Teal class' : 'Red class';
}

function initKNNModule() {
  knnGenerateData(11);
  const canvas = document.getElementById('knnCanvas');
  canvas.addEventListener('click', e => {
    const rect = canvas.getBoundingClientRect();
    const scaler = makeScaler(canvas, KNN_RANGE.xMin, KNN_RANGE.xMax, KNN_RANGE.yMin, KNN_RANGE.yMax);
    const cx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const cy = (e.clientY - rect.top) * (canvas.height / rect.height);
    const x = KNN_RANGE.xMin + (cx - scaler.pad) / (scaler.w - 2 * scaler.pad) * (KNN_RANGE.xMax - KNN_RANGE.xMin);
    const y = KNN_RANGE.yMin + (scaler.h - scaler.pad - cy) / (scaler.h - 2 * scaler.pad) * (KNN_RANGE.yMax - KNN_RANGE.yMin);
    KNN_STATE.query = {
      x: Math.min(KNN_RANGE.xMax, Math.max(KNN_RANGE.xMin, x)),
      y: Math.min(KNN_RANGE.yMax, Math.max(KNN_RANGE.yMin, y))
    };
    knnRedraw();
  });
  document.getElementById('knnK').addEventListener('input', e => {
    KNN_STATE.k = parseInt(e.target.value);
    knnRedraw();
  });
  document.getElementById('knnNewData').addEventListener('click', () => {
    knnGenerateData(Math.floor(Math.random() * 1e9));
    knnRedraw();
  });
  knnRedraw();
}
