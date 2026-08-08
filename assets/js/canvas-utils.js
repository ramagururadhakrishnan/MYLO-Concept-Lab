// ---------- SHARED CANVAS HELPERS ----------
// Small, dependency-free helpers used by every ML module so plots share one
// visual language. Colors are read from the CSS custom properties in
// style.css so canvas drawings always match the rest of the page.

const LAB_COLORS = (() => {
  const s = getComputedStyle(document.documentElement);
  const g = name => s.getPropertyValue(name).trim();
  return {
    paper: g('--paper'), paperDim: g('--paper-dim'),
    ink: g('--ink'), inkSoft: g('--ink-soft'),
    rule: g('--rule'), red: g('--red'), redSoft: g('--red-soft'),
    teal: g('--teal'), tealSoft: g('--teal-soft'), card: g('--card')
  };
})();

// A small categorical palette for modules needing >2 groups (e.g. k-means).
const CLUSTER_PALETTE = ['#2E6B64', '#B4392C', '#B8862F', '#7A4B6B', '#3D5A73'];

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)];
}
function lerpColor(hexA, hexB, t) {
  const a = hexToRgb(hexA), b = hexToRgb(hexB);
  const c = a.map((v, i) => Math.round(v + (b[i] - v) * t));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

// Builds a coordinate mapper from data space to canvas pixel space.
// canvas.width/height (the element attributes, not CSS size) define the
// drawing surface resolution.
function makeScaler(canvas, xMin, xMax, yMin, yMax, pad = 34) {
  const w = canvas.width, h = canvas.height;
  return {
    xMin, xMax, yMin, yMax, w, h, pad,
    toPx(x, y) {
      const px = pad + (x - xMin) / (xMax - xMin) * (w - 2 * pad);
      const py = h - pad - (y - yMin) / (yMax - yMin) * (h - 2 * pad);
      return [px, py];
    }
  };
}

function clearCanvas(ctx, canvas, bg) {
  ctx.fillStyle = bg || LAB_COLORS.card;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawFrame(ctx, scaler) {
  ctx.strokeStyle = LAB_COLORS.rule;
  ctx.lineWidth = 1;
  ctx.strokeRect(scaler.pad, scaler.pad, scaler.w - 2 * scaler.pad, scaler.h - 2 * scaler.pad);
}

function drawPoint(ctx, scaler, x, y, opts = {}) {
  const [px, py] = scaler.toPx(x, y);
  ctx.beginPath();
  ctx.arc(px, py, opts.r || 4, 0, Math.PI * 2);
  ctx.fillStyle = opts.fill || LAB_COLORS.ink;
  ctx.fill();
  if (opts.stroke) {
    ctx.lineWidth = opts.strokeWidth || 1.5;
    ctx.strokeStyle = opts.stroke;
    ctx.stroke();
  }
}

function drawLineSeg(ctx, scaler, x1, y1, x2, y2, opts = {}) {
  const [px1, py1] = scaler.toPx(x1, y1);
  const [px2, py2] = scaler.toPx(x2, y2);
  ctx.beginPath();
  ctx.moveTo(px1, py1);
  ctx.lineTo(px2, py2);
  ctx.strokeStyle = opts.stroke || LAB_COLORS.ink;
  ctx.lineWidth = opts.width || 2;
  if (opts.dash) ctx.setLineDash(opts.dash);
  ctx.stroke();
  ctx.setLineDash([]);
}

// Draws a polyline through data-space points, e.g. a fitted curve or a
// gradient-descent path.
function drawPolyline(ctx, scaler, pts, opts = {}) {
  if (pts.length < 2) return;
  ctx.beginPath();
  pts.forEach(([x, y], i) => {
    const [px, py] = scaler.toPx(x, y);
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  });
  ctx.strokeStyle = opts.stroke || LAB_COLORS.ink;
  ctx.lineWidth = opts.width || 2;
  if (opts.dash) ctx.setLineDash(opts.dash);
  ctx.stroke();
  ctx.setLineDash([]);
}

// Simple seeded RNG so "New data" is varied but each module's default state
// still renders something sensible on first load.
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function gaussian(rng) {
  const u = 1 - rng(), v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
