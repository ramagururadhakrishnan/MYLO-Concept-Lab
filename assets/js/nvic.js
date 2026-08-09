// ---------- NVIC PRIORITY / PREEMPTION SIMULATOR ----------

const NVIC_TOTAL_MS = 3000;
const NVIC_ISR_COLORS = [LAB_COLORS.red, LAB_COLORS.teal, '#B8862F'];
const NVIC_STATE = {
  isrs: [
    { name: 'ISR1', priority: 1, fireAt: 200, duration: 700 },
    { name: 'ISR2', priority: 0, fireAt: 500, duration: 400 },
    { name: 'ISR3', priority: 2, fireAt: 1200, duration: 600 }
  ]
};

function nvicSimulate() {
  const tasks = NVIC_STATE.isrs.map(t => ({ ...t, remaining: t.duration, started: null, finished: null }));
  const segments = [];
  let lastRunner = 'main';
  let segStart = 0;

  for (let t = 0; t < NVIC_TOTAL_MS; t++) {
    const ready = tasks.filter(x => t >= x.fireAt && x.remaining > 0);
    let runner = 'main';
    if (ready.length) {
      ready.sort((a, b) => a.priority - b.priority || a.fireAt - b.fireAt);
      runner = ready[0].name;
      if (ready[0].started === null) ready[0].started = t;
    }
    if (runner !== lastRunner) {
      segments.push({ name: lastRunner, start: segStart, end: t });
      segStart = t;
      lastRunner = runner;
    }
    if (runner !== 'main') {
      const task = tasks.find(x => x.name === runner);
      task.remaining--;
      if (task.remaining === 0) task.finished = t + 1;
    }
  }
  segments.push({ name: lastRunner, start: segStart, end: NVIC_TOTAL_MS });
  return { segments, tasks };
}

function nvicColorFor(name) {
  if (name === 'main') return LAB_COLORS.paperDim;
  const idx = NVIC_STATE.isrs.findIndex(i => i.name === name);
  return NVIC_ISR_COLORS[idx % NVIC_ISR_COLORS.length];
}

function nvicDraw(segments) {
  const canvas = document.getElementById('nvicCanvas');
  const ctx = canvas.getContext('2d');
  clearCanvas(ctx, canvas);
  const scaler = makeScaler(canvas, 0, NVIC_TOTAL_MS, 0, 1, 24);
  segments.forEach(seg => {
    const [x0, y0] = scaler.toPx(seg.start, 0);
    const [x1, y1] = scaler.toPx(seg.end, 1);
    ctx.fillStyle = nvicColorFor(seg.name);
    ctx.fillRect(x0, y1, Math.max(1, x1 - x0), y0 - y1);
    if (seg.end - seg.start > 90) {
      ctx.fillStyle = seg.name === 'main' ? LAB_COLORS.inkSoft : LAB_COLORS.card;
      ctx.font = '11px IBM Plex Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(seg.name, (x0 + x1) / 2, (y0 + y1) / 2 + 4);
    }
  });
  drawFrame(ctx, scaler);
  // time axis ticks every 500ms
  ctx.fillStyle = LAB_COLORS.inkSoft;
  ctx.font = '10px IBM Plex Mono, monospace';
  ctx.textAlign = 'center';
  for (let t = 0; t <= NVIC_TOTAL_MS; t += 500) {
    const [x] = scaler.toPx(t, 0);
    ctx.fillText(t + 'ms', x, scaler.h - 6);
  }
}

function nvicRender() {
  const { segments, tasks } = nvicSimulate();
  nvicDraw(segments);

  const legend = document.getElementById('nvicLegend');
  legend.innerHTML = `<span><span class="swatch" style="background:${LAB_COLORS.paperDim};border:1px solid var(--rule);"></span>main</span>` +
    NVIC_STATE.isrs.map((isr, i) => `<span><span class="swatch" style="background:${NVIC_ISR_COLORS[i % NVIC_ISR_COLORS.length]}"></span>${isr.name} (prio ${isr.priority})</span>`).join('');

  const tbody = document.getElementById('nvicResultBody');
  tbody.innerHTML = tasks.map(t => {
    const latency = t.started !== null ? t.started - t.fireAt : null;
    return `<tr><td class="st-label">${t.name}</td><td>${t.priority}</td><td>${t.fireAt}ms</td><td>${t.duration}ms</td><td>${t.started !== null ? t.started + 'ms' : '—'}</td><td>${latency !== null ? latency + 'ms' : '—'}</td></tr>`;
  }).join('');
}

function initNVICModule() {
  NVIC_STATE.isrs.forEach((isr, i) => {
    const prefix = 'nvicIsr' + (i + 1);
    document.getElementById(prefix + 'Priority').addEventListener('change', e => { isr.priority = parseInt(e.target.value); nvicRender(); });
    document.getElementById(prefix + 'Fire').addEventListener('input', e => { isr.fireAt = parseInt(e.target.value); document.getElementById(prefix + 'FireVal').textContent = isr.fireAt + 'ms'; nvicRender(); });
    document.getElementById(prefix + 'Duration').addEventListener('input', e => { isr.duration = parseInt(e.target.value); document.getElementById(prefix + 'DurationVal').textContent = isr.duration + 'ms'; nvicRender(); });
  });
  nvicRender();
}
