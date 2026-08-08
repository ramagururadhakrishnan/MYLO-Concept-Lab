// ---------- EXPLORATORY DATA ANALYSIS (EDA) MODULE ----------
// Parses an uploaded CSV (built-in parser) or Excel file (via the optional
// SheetJS CDN script — degrades gracefully with a clear message if that
// script didn't load), infers column types, and renders summary stats,
// per-column detail, and a correlation heatmap. No server involved — the
// file never leaves the browser.

const EDA_STATE = { headers: [], rows: [], meta: [] };

const EDA_SAMPLE_CSV = `name,department,age,salary,years_experience,performance_score
Alice,Engineering,29,72000,4,8.2
Bob,Sales,34,58000,7,7.1
Carla,Engineering,41,95000,15,9.0
Dan,Marketing,26,51000,2,6.5
Elena,Engineering,31,81000,6,8.7
Farid,Sales,45,63000,12,7.8
Grace,Marketing,29,54000,3,6.9
Hank,Engineering,38,89000,10,8.9
Ivy,Sales,24,49000,1,6.0
Jay,Marketing,33,57000,5,7.3
Kira,Engineering,27,68000,3,7.6
Liam,Sales,52,71000,20,8.4
Mona,Marketing,40,66000,11,7.9
Nate,Engineering,35,84000,8,8.5
Omar,Sales,30,55000,4,6.8`;

function edaParseCSV(text) {
  const rows = [];
  let row = [], field = '', inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else inQuotes = false; }
      else field += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ',') { row.push(field); field = ''; }
      else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
      else if (c === '\r') { /* skip, \n follows */ }
      else field += c;
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows.filter(r => !(r.length === 1 && r[0].trim() === ''));
}

function edaInferMeta(headers, dataRows) {
  return headers.map((h, ci) => {
    let numericCount = 0, missing = 0;
    const raw = [];
    dataRows.forEach(r => {
      const v = (r[ci] ?? '').toString().trim();
      raw.push(v);
      if (v === '') { missing++; return; }
      if (!isNaN(parseFloat(v)) && isFinite(v)) numericCount++;
    });
    const nonMissing = dataRows.length - missing;
    const isNumeric = nonMissing > 0 && numericCount / nonMissing >= 0.8;
    return { name: (h || `Column ${ci + 1}`).toString(), index: ci, type: isNumeric ? 'numeric' : 'categorical', missing, raw };
  });
}

function edaNumericStats(raw) {
  const nums = raw.filter(v => v !== '' && !isNaN(parseFloat(v))).map(Number).sort((a, b) => a - b);
  const n = nums.length;
  if (!n) return null;
  const sum = nums.reduce((a, b) => a + b, 0);
  const mean = sum / n;
  const variance = nums.reduce((a, b) => a + (b - mean) ** 2, 0) / n;
  const q = p => {
    const idx = p * (n - 1), lo = Math.floor(idx), hi = Math.ceil(idx);
    return lo === hi ? nums[lo] : nums[lo] + (nums[hi] - nums[lo]) * (idx - lo);
  };
  return { n, mean, std: Math.sqrt(variance), min: nums[0], max: nums[n - 1], q1: q(0.25), median: q(0.5), q3: q(0.75), sorted: nums };
}

function edaCategoricalStats(raw) {
  const counts = {};
  raw.forEach(v => { if (v !== '') counts[v] = (counts[v] || 0) + 1; });
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((s, e) => s + e[1], 0);
  return { unique: entries.length, top: entries.slice(0, 6), total };
}

function edaPearson(xs, ys) {
  const n = xs.length;
  if (n < 2) return 0;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0, dx2 = 0, dy2 = 0;
  for (let i = 0; i < n; i++) { const dx = xs[i] - mx, dy = ys[i] - my; num += dx * dy; dx2 += dx * dx; dy2 += dy * dy; }
  const denom = Math.sqrt(dx2 * dy2);
  return denom === 0 ? 0 : num / denom;
}

function edaEscapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function edaDrawBoxPlot(canvasId, stats) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  clearCanvas(ctx, canvas);
  const pad = (stats.max - stats.min) * 0.12 || 1;
  const scaler = makeScaler(canvas, 0, 1, stats.min - pad, stats.max + pad);
  drawFrame(ctx, scaler);

  const cx = 0.5, boxW = 0.26;
  drawLineSeg(ctx, scaler, cx, stats.min, cx, stats.q1, { stroke: LAB_COLORS.ink, width: 1.5 });
  drawLineSeg(ctx, scaler, cx, stats.q3, cx, stats.max, { stroke: LAB_COLORS.ink, width: 1.5 });
  drawLineSeg(ctx, scaler, cx - 0.08, stats.min, cx + 0.08, stats.min, { stroke: LAB_COLORS.ink, width: 1.5 });
  drawLineSeg(ctx, scaler, cx - 0.08, stats.max, cx + 0.08, stats.max, { stroke: LAB_COLORS.ink, width: 1.5 });

  const [x0, y0] = scaler.toPx(cx - boxW / 2, stats.q1);
  const [x1, y1] = scaler.toPx(cx + boxW / 2, stats.q3);
  ctx.fillStyle = LAB_COLORS.tealSoft;
  ctx.fillRect(x0, y1, x1 - x0, y0 - y1);
  ctx.strokeStyle = LAB_COLORS.ink;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x0, y1, x1 - x0, y0 - y1);

  drawLineSeg(ctx, scaler, cx - boxW / 2, stats.median, cx + boxW / 2, stats.median, { stroke: LAB_COLORS.red, width: 2.5 });
}

function edaDrawLineChart(canvasId, values) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  clearCanvas(ctx, canvas);
  const n = values.length;
  if (!n) return;
  const minV = Math.min(...values), maxV = Math.max(...values);
  const pad = (maxV - minV) * 0.1 || 1;
  const scaler = makeScaler(canvas, 0, Math.max(1, n - 1), minV - pad, maxV + pad);
  drawFrame(ctx, scaler);
  drawPolyline(ctx, scaler, values.map((v, i) => [i, v]), { stroke: LAB_COLORS.red, width: 2 });
  values.forEach((v, i) => drawPoint(ctx, scaler, i, v, { fill: LAB_COLORS.red, r: 2.5 }));
}

function edaDrawBarChart(canvasId, catStats) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  clearCanvas(ctx, canvas);
  const top = catStats.top.slice(0, 8);
  if (!top.length) return;
  const maxCount = Math.max(...top.map(t => t[1]), 1);
  const scaler = makeScaler(canvas, 0, top.length, 0, maxCount * 1.15, 44);
  drawFrame(ctx, scaler);
  top.forEach(([label, count], i) => {
    const [x0, y0] = scaler.toPx(i + 0.15, 0);
    const [x1, y1] = scaler.toPx(i + 0.85, count);
    ctx.fillStyle = CLUSTER_PALETTE[i % CLUSTER_PALETTE.length];
    ctx.fillRect(x0, y1, x1 - x0, y0 - y1);
    ctx.fillStyle = LAB_COLORS.inkSoft;
    ctx.font = '10px IBM Plex Mono, monospace';
    ctx.textAlign = 'center';
    const short = label.length > 9 ? label.slice(0, 8) + '…' : label;
    ctx.fillText(short, (x0 + x1) / 2, scaler.h - scaler.pad + 16);
  });
}

function edaDrawPieChart(canvasId, catStats) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  clearCanvas(ctx, canvas);
  const top = catStats.top.slice(0, 6);
  const total = top.reduce((s, t) => s + t[1], 0) || 1;
  const cx = canvas.width / 2, cy = canvas.height / 2;
  const r = Math.min(canvas.width, canvas.height) / 2 - 24;
  let angle = -Math.PI / 2;
  top.forEach(([label, count], i) => {
    const slice = (count / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, angle, angle + slice);
    ctx.closePath();
    ctx.fillStyle = CLUSTER_PALETTE[i % CLUSTER_PALETTE.length];
    ctx.fill();
    ctx.strokeStyle = LAB_COLORS.card;
    ctx.lineWidth = 2;
    ctx.stroke();
    angle += slice;
  });
}

function edaDrawScatter(canvasId, xs, ys) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  clearCanvas(ctx, canvas);
  const xMin = Math.min(...xs), xMax = Math.max(...xs);
  const yMin = Math.min(...ys), yMax = Math.max(...ys);
  const padX = (xMax - xMin) * 0.1 || 1, padY = (yMax - yMin) * 0.1 || 1;
  const scaler = makeScaler(canvas, xMin - padX, xMax + padX, yMin - padY, yMax + padY);
  drawFrame(ctx, scaler);
  xs.forEach((x, i) => drawPoint(ctx, scaler, x, ys[i], { fill: LAB_COLORS.teal, r: 4 }));
}

function edaPopulateChartControls() {
  const type = document.getElementById('edaChartType').value;
  const wrapY = document.getElementById('edaChartColWrapY');
  const xLabel = document.getElementById('edaChartColXLabel');
  const selX = document.getElementById('edaChartColX');
  const selY = document.getElementById('edaChartColY');

  const numericCols = EDA_STATE.meta.filter(m => m.type === 'numeric');
  const catCols = EDA_STATE.meta.filter(m => m.type === 'categorical');

  let optionsX;
  if (type === 'bar' || type === 'pie') { optionsX = catCols; xLabel.textContent = 'Category column'; }
  else { optionsX = numericCols; xLabel.textContent = type === 'scatter' ? 'X column' : 'Numeric column'; }

  selX.innerHTML = optionsX.map(m => `<option value="${m.index}">${edaEscapeHtml(m.name)}</option>`).join('');

  if (type === 'scatter') {
    wrapY.style.display = '';
    selY.innerHTML = numericCols.map(m => `<option value="${m.index}">${edaEscapeHtml(m.name)}</option>`).join('');
    if (numericCols.length > 1) selY.value = numericCols[1].index;
  } else {
    wrapY.style.display = 'none';
  }
}

function edaRenderChart() {
  const type = document.getElementById('edaChartType').value;
  const canvas = document.getElementById('edaChartCanvas');
  const ctx = canvas.getContext('2d');
  const legend = document.getElementById('edaChartLegend');
  const note = document.getElementById('edaChartNote');
  legend.innerHTML = '';
  note.textContent = '';

  const selX = document.getElementById('edaChartColX');
  if (!selX.options.length) {
    clearCanvas(ctx, canvas);
    note.textContent = (type === 'bar' || type === 'pie')
      ? 'No categorical columns available for this chart type.'
      : 'No numeric columns available for this chart type.';
    return;
  }
  const idxX = parseInt(selX.value);
  const m = EDA_STATE.meta[idxX];
  if (!m) return;

  if (type === 'histogram' || type === 'box' || type === 'line') {
    const stats = edaNumericStats(m.raw);
    if (!stats) { clearCanvas(ctx, canvas); note.textContent = 'No numeric values in this column.'; return; }
    if (type === 'histogram') {
      edaDrawHistogram('edaChartCanvas', stats);
      note.textContent = `n=${stats.n} · mean ${stats.mean.toFixed(2)} · std dev ${stats.std.toFixed(2)}`;
    } else if (type === 'box') {
      edaDrawBoxPlot('edaChartCanvas', stats);
      note.textContent = `min ${stats.min.toFixed(2)} · Q1 ${stats.q1.toFixed(2)} · median ${stats.median.toFixed(2)} · Q3 ${stats.q3.toFixed(2)} · max ${stats.max.toFixed(2)}`;
    } else {
      const nums = m.raw.filter(v => v !== '' && !isNaN(parseFloat(v))).map(Number);
      edaDrawLineChart('edaChartCanvas', nums);
      note.textContent = `${nums.length} values plotted in row order (only a real time axis if your rows are already date-sorted).`;
    }
  } else if (type === 'bar' || type === 'pie') {
    const stats = edaCategoricalStats(m.raw);
    if (type === 'bar') {
      edaDrawBarChart('edaChartCanvas', stats);
    } else {
      edaDrawPieChart('edaChartCanvas', stats);
      const top = stats.top.slice(0, 6);
      const total = top.reduce((s, t) => s + t[1], 0) || 1;
      legend.innerHTML = top.map(([label, count], i) =>
        `<span><span class="swatch" style="background:${CLUSTER_PALETTE[i % CLUSTER_PALETTE.length]}"></span>${edaEscapeHtml(label)} (${(count / total * 100).toFixed(0)}%)</span>`
      ).join('');
    }
    note.textContent = `${stats.unique} unique value${stats.unique === 1 ? '' : 's'} total — showing top ${Math.min(6, stats.unique)}.`;
  } else if (type === 'scatter') {
    const idxY = parseInt(document.getElementById('edaChartColY').value);
    const my = EDA_STATE.meta[idxY];
    if (!my) return;
    const xs = [], ys = [];
    m.raw.forEach((v, i) => {
      const a = parseFloat(v), b = parseFloat(my.raw[i]);
      if (!isNaN(a) && !isNaN(b)) { xs.push(a); ys.push(b); }
    });
    if (!xs.length) { clearCanvas(ctx, canvas); note.textContent = 'No overlapping numeric values between these two columns.'; return; }
    edaDrawScatter('edaChartCanvas', xs, ys);
    note.textContent = `n=${xs.length} · Pearson r = ${edaPearson(xs, ys).toFixed(2)}`;
  }
}

function edaProcess(headers, dataRows) {
  EDA_STATE.headers = headers.map(h => (h ?? '').toString());
  EDA_STATE.rows = dataRows;
  EDA_STATE.meta = edaInferMeta(EDA_STATE.headers, dataRows);
  edaRenderAll();
}

function edaRenderAll() {
  document.getElementById('edaResults').style.display = 'block';
  document.getElementById('edaStatus').textContent =
    `Loaded ${EDA_STATE.rows.length} rows × ${EDA_STATE.headers.length} columns.`;

  const totalCells = EDA_STATE.rows.length * EDA_STATE.headers.length;
  const missingTotal = EDA_STATE.meta.reduce((s, m) => s + m.missing, 0);
  const numericCols = EDA_STATE.meta.filter(m => m.type === 'numeric');
  const catCols = EDA_STATE.meta.filter(m => m.type === 'categorical');

  document.getElementById('edaRows').textContent = EDA_STATE.rows.length;
  document.getElementById('edaCols').textContent = EDA_STATE.headers.length;
  document.getElementById('edaMissing').textContent = `${missingTotal} / ${totalCells}`;
  document.getElementById('edaNumericCount').textContent = numericCols.length;
  document.getElementById('edaCatCount').textContent = catCols.length;

  const tbody = document.getElementById('edaColumnTableBody');
  tbody.innerHTML = '';
  EDA_STATE.meta.forEach(m => {
    const tr = document.createElement('tr');
    let summary = '—';
    if (m.type === 'numeric') {
      const s = edaNumericStats(m.raw);
      summary = s ? `mean ${s.mean.toFixed(2)}` : '—';
    } else {
      summary = `${edaCategoricalStats(m.raw).unique} unique`;
    }
    tr.innerHTML = `<td class="st-label">${edaEscapeHtml(m.name)}</td><td>${m.type}</td><td>${m.missing}</td><td>${summary}</td>`;
    tbody.appendChild(tr);
  });

  const select = document.getElementById('edaColumnSelect');
  select.innerHTML = '';
  EDA_STATE.meta.forEach((m, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = m.name;
    select.appendChild(opt);
  });
  select.onchange = () => edaRenderColumnDetail(parseInt(select.value));
  edaRenderColumnDetail(0);

  edaPopulateChartControls();
  edaRenderChart();

  edaRenderCorrelation(numericCols);
  edaRenderPreview();
}

function edaRenderColumnDetail(idx) {
  const m = EDA_STATE.meta[idx];
  const wrap = document.getElementById('edaColumnDetail');
  if (!m) { wrap.innerHTML = ''; return; }

  if (m.type === 'numeric') {
    const s = edaNumericStats(m.raw);
    if (!s) { wrap.innerHTML = '<p class="note">No numeric values in this column.</p>'; return; }
    wrap.innerHTML = `
      <div class="readout-row">
        <div class="readout"><div class="n">${s.mean.toFixed(2)}</div><div class="l">mean</div></div>
        <div class="readout"><div class="n">${s.median.toFixed(2)}</div><div class="l">median</div></div>
        <div class="readout"><div class="n">${s.std.toFixed(2)}</div><div class="l">std dev</div></div>
        <div class="readout"><div class="n">${s.min.toFixed(1)} – ${s.max.toFixed(1)}</div><div class="l">min – max</div></div>
        <div class="readout accent"><div class="n">${s.q1.toFixed(1)} / ${s.q3.toFixed(1)}</div><div class="l">Q1 / Q3</div></div>
      </div>
      <div class="canvas-box readonly"><div class="trace-title">Distribution</div><canvas id="edaHistCanvas" width="560" height="220"></canvas></div>
    `;
    requestAnimationFrame(() => edaDrawHistogram('edaHistCanvas', s));
  } else {
    const s = edaCategoricalStats(m.raw);
    const bars = s.top.map(([label, count]) => {
      const pct = s.total ? (count / s.total * 100) : 0;
      return `<div class="eda-bar-row"><span class="eda-bar-label" title="${edaEscapeHtml(label)}">${edaEscapeHtml(label)}</span><div class="eda-bar-track"><div class="eda-bar-fill" style="width:${pct.toFixed(1)}%"></div></div><span class="eda-bar-count">${count}</span></div>`;
    }).join('');
    wrap.innerHTML = `
      <div class="readout-row">
        <div class="readout"><div class="n">${s.unique}</div><div class="l">unique values</div></div>
        <div class="readout accent"><div class="n">${m.missing}</div><div class="l">missing</div></div>
      </div>
      <div class="canvas-box readonly"><div class="trace-title">Top categories</div>${bars || '<p class="note">No values.</p>'}</div>
    `;
  }
}

function edaDrawHistogram(canvasId, stats) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  clearCanvas(ctx, canvas);
  const bins = 10;
  const width = (stats.max - stats.min) || 1;
  const counts = new Array(bins).fill(0);
  stats.sorted.forEach(v => {
    let idx = Math.floor((v - stats.min) / width * bins);
    if (idx >= bins) idx = bins - 1;
    if (idx < 0) idx = 0;
    counts[idx]++;
  });
  const maxCount = Math.max(...counts, 1);
  const scaler = makeScaler(canvas, 0, bins, 0, maxCount * 1.15);
  drawFrame(ctx, scaler);
  counts.forEach((c, i) => {
    const [x0, y0] = scaler.toPx(i, 0);
    const [x1, y1] = scaler.toPx(i + 1, c);
    ctx.fillStyle = LAB_COLORS.teal;
    ctx.fillRect(x0 + 1, y1, (x1 - x0) - 2, y0 - y1);
  });
}

function edaRenderCorrelation(numericCols) {
  const wrap = document.getElementById('edaCorrelationWrap');
  if (numericCols.length < 2) {
    wrap.innerHTML = '<p class="note">Need at least two numeric columns for a correlation heatmap.</p>';
    return;
  }
  let html = '<div class="table-scroll"><table class="subnet-table corr-table"><thead><tr><th></th>' +
    numericCols.map(m => `<th>${edaEscapeHtml(m.name)}</th>`).join('') + '</tr></thead><tbody>';
  numericCols.forEach((mi, i) => {
    html += `<tr><td class="st-label">${edaEscapeHtml(mi.name)}</td>`;
    numericCols.forEach((mj, j) => {
      const xs = [], ys = [];
      mi.raw.forEach((v, k) => {
        const a = parseFloat(v), b = parseFloat(mj.raw[k]);
        if (!isNaN(a) && !isNaN(b)) { xs.push(a); ys.push(b); }
      });
      const r = i === j ? 1 : edaPearson(xs, ys);
      const color = r >= 0 ? lerpColor(LAB_COLORS.paperDim, LAB_COLORS.teal, r) : lerpColor(LAB_COLORS.paperDim, LAB_COLORS.red, -r);
      html += `<td style="background:${color};">${r.toFixed(2)}</td>`;
    });
    html += '</tr>';
  });
  html += '</tbody></table></div>';
  wrap.innerHTML = html;
}

function edaRenderPreview() {
  const table = document.getElementById('edaPreviewTable');
  const previewRows = EDA_STATE.rows.slice(0, 10);
  let html = '<thead><tr>' + EDA_STATE.headers.map(h => `<th>${edaEscapeHtml(h)}</th>`).join('') + '</tr></thead><tbody>';
  previewRows.forEach(r => {
    html += '<tr>' + EDA_STATE.headers.map((_, i) => `<td>${edaEscapeHtml(r[i] ?? '')}</td>`).join('') + '</tr>';
  });
  html += '</tbody>';
  table.innerHTML = html;
}

function edaHandleFile(file) {
  const status = document.getElementById('edaStatus');
  status.textContent = 'Reading file…';
  const name = file.name.toLowerCase();

  if (name.endsWith('.csv')) {
    const reader = new FileReader();
    reader.onload = e => {
      const rows = edaParseCSV(e.target.result);
      if (!rows.length) { status.textContent = 'Could not read any rows from that file.'; return; }
      edaProcess(rows[0], rows.slice(1));
    };
    reader.onerror = () => { status.textContent = 'Could not read that file.'; };
    reader.readAsText(file);
  } else if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
    if (typeof XLSX === 'undefined') {
      status.textContent = 'Excel support (SheetJS) failed to load — export your file as CSV and upload that instead.';
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const wb = XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
        if (!rows.length) { status.textContent = 'Could not read any rows from that file.'; return; }
        edaProcess(rows[0], rows.slice(1).map(r => r.map(v => v === undefined ? '' : v)));
      } catch (err) {
        status.textContent = 'Could not parse that Excel file — try exporting as CSV instead.';
      }
    };
    reader.onerror = () => { status.textContent = 'Could not read that file.'; };
    reader.readAsArrayBuffer(file);
  } else {
    status.textContent = 'Please upload a .csv, .xlsx, or .xls file.';
  }
}

function initEDAModule() {
  document.getElementById('edaFileInput').addEventListener('change', e => {
    if (e.target.files && e.target.files[0]) edaHandleFile(e.target.files[0]);
  });
  document.getElementById('edaLoadSample').addEventListener('click', () => {
    const rows = edaParseCSV(EDA_SAMPLE_CSV);
    edaProcess(rows[0], rows.slice(1));
  });
  document.getElementById('edaChartType').addEventListener('change', () => {
    edaPopulateChartControls();
    edaRenderChart();
  });
  document.getElementById('edaChartColX').addEventListener('change', edaRenderChart);
  document.getElementById('edaChartColY').addEventListener('change', edaRenderChart);
}
