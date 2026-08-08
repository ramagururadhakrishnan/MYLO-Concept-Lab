// ---------- K-MEANS CLUSTERING MODULE ----------

const KM_RANGE = { xMin: 0, xMax: 10, yMin: 0, yMax: 10 };
const KM_STATE = { points: [], centroids: [], assignments: [], phase: 'assign', iteration: 0, inertiaHistory: [], k: 3 };

function kmGenerateData(seed) {
  const rng = mulberry32(seed);
  const centers = [{ x: 2.2, y: 2.5 }, { x: 7.5, y: 2.8 }, { x: 4.5, y: 8 }];
  const pts = [];
  centers.forEach(c => {
    for (let i = 0; i < 12; i++) {
      pts.push({ x: c.x + gaussian(rng) * 1.0, y: c.y + gaussian(rng) * 1.0 });
    }
  });
  KM_STATE.points = pts.filter(p => p.x >= 0 && p.x <= 10 && p.y >= 0 && p.y <= 10);
}

function kmInitCentroids(seed) {
  const rng = mulberry32(seed);
  const idxs = new Set();
  while (idxs.size < KM_STATE.k) idxs.add(Math.floor(rng() * KM_STATE.points.length));
  KM_STATE.centroids = [...idxs].map(i => ({ ...KM_STATE.points[i] }));
  KM_STATE.assignments = KM_STATE.points.map(() => -1);
  KM_STATE.phase = 'assign';
  KM_STATE.iteration = 0;
  KM_STATE.inertiaHistory = [];
}

function kmAssignStep() {
  KM_STATE.assignments = KM_STATE.points.map(p => {
    let best = 0, bestD = Infinity;
    KM_STATE.centroids.forEach((c, ci) => {
      const d = Math.hypot(p.x - c.x, p.y - c.y);
      if (d < bestD) { bestD = d; best = ci; }
    });
    return best;
  });
  KM_STATE.phase = 'update';
  KM_STATE.iteration++;
  kmRecordInertia();
}

function kmUpdateStep() {
  KM_STATE.centroids = KM_STATE.centroids.map((c, ci) => {
    const members = KM_STATE.points.filter((_, i) => KM_STATE.assignments[i] === ci);
    if (!members.length) return c;
    return {
      x: members.reduce((s, p) => s + p.x, 0) / members.length,
      y: members.reduce((s, p) => s + p.y, 0) / members.length
    };
  });
  KM_STATE.phase = 'assign';
}

function kmRecordInertia() {
  let s = 0;
  KM_STATE.points.forEach((p, i) => {
    const c = KM_STATE.centroids[KM_STATE.assignments[i]];
    s += (p.x - c.x) ** 2 + (p.y - c.y) ** 2;
  });
  KM_STATE.inertiaHistory.push(s);
}

function kmDrawScatter() {
  const canvas = document.getElementById('kmCanvas');
  const ctx = canvas.getContext('2d');
  clearCanvas(ctx, canvas);
  const scaler = makeScaler(canvas, KM_RANGE.xMin, KM_RANGE.xMax, KM_RANGE.yMin, KM_RANGE.yMax);
  drawFrame(ctx, scaler);

  KM_STATE.points.forEach((p, i) => {
    const ci = KM_STATE.assignments[i];
    const color = ci >= 0 ? CLUSTER_PALETTE[ci % CLUSTER_PALETTE.length] : LAB_COLORS.inkSoft;
    drawPoint(ctx, scaler, p.x, p.y, { fill: color, r: 4.5 });
  });
  KM_STATE.centroids.forEach((c, ci) => {
    const [px, py] = scaler.toPx(c.x, c.y);
    ctx.fillStyle = CLUSTER_PALETTE[ci % CLUSTER_PALETTE.length];
    ctx.strokeStyle = LAB_COLORS.ink;
    ctx.lineWidth = 2;
    ctx.beginPath();
    const s = 8;
    ctx.moveTo(px - s, py - s); ctx.lineTo(px + s, py + s);
    ctx.moveTo(px + s, py - s); ctx.lineTo(px - s, py + s);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(px, py, 10, 0, Math.PI * 2);
    ctx.strokeStyle = LAB_COLORS.card;
    ctx.lineWidth = 3;
    ctx.stroke();
  });
}

function kmDrawInertia() {
  const canvas = document.getElementById('kmInertiaCanvas');
  const ctx = canvas.getContext('2d');
  clearCanvas(ctx, canvas);
  const hist = KM_STATE.inertiaHistory;
  const maxI = Math.max(1, ...hist);
  const scaler = makeScaler(canvas, 0, Math.max(1, hist.length - 1), 0, maxI * 1.1);
  drawFrame(ctx, scaler);
  drawPolyline(ctx, scaler, hist.map((v, i) => [i, v]), { stroke: LAB_COLORS.red, width: 2 });
  hist.forEach((v, i) => drawPoint(ctx, scaler, i, v, { fill: LAB_COLORS.red, r: 3 }));
}

function kmRedraw() {
  kmDrawScatter();
  kmDrawInertia();
  document.getElementById('kmPhase').textContent = KM_STATE.phase === 'assign'
    ? 'Next: assign each point to its nearest centroid'
    : 'Next: move each centroid to the mean of its assigned points';
  document.getElementById('kmIter').textContent = KM_STATE.iteration;
  document.getElementById('kmInertia').textContent = KM_STATE.inertiaHistory.length
    ? KM_STATE.inertiaHistory[KM_STATE.inertiaHistory.length - 1].toFixed(1) : '—';
}

function kmStep() {
  if (KM_STATE.phase === 'assign') kmAssignStep(); else kmUpdateStep();
  kmRedraw();
}

function kmRunToConvergence() {
  let prev = null, guard = 0;
  while (guard++ < 60) {
    const before = JSON.stringify(KM_STATE.assignments);
    kmAssignStep();
    kmUpdateStep();
    if (before === JSON.stringify(KM_STATE.assignments)) break;
  }
  kmRedraw();
}

function initKMeansModule() {
  kmGenerateData(5);
  kmInitCentroids(9);
  document.getElementById('kmK').addEventListener('input', e => {
    KM_STATE.k = parseInt(e.target.value);
    document.getElementById('kmKVal').textContent = KM_STATE.k;
    kmInitCentroids(Math.floor(Math.random() * 1e9));
    kmRedraw();
  });
  document.getElementById('kmStep').addEventListener('click', kmStep);
  document.getElementById('kmRun').addEventListener('click', kmRunToConvergence);
  document.getElementById('kmReset').addEventListener('click', () => {
    kmInitCentroids(Math.floor(Math.random() * 1e9));
    kmRedraw();
  });
  document.getElementById('kmNewData').addEventListener('click', () => {
    kmGenerateData(Math.floor(Math.random() * 1e9));
    kmInitCentroids(Math.floor(Math.random() * 1e9));
    kmRedraw();
  });
  document.getElementById('kmKVal').textContent = KM_STATE.k;
  kmRedraw();
}
