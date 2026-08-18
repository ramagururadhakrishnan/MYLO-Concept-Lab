// ---------- MULTIVARIATE DATA LAB ----------
// Upload a CSV/Excel file (or load the sample), pick numeric feature columns
// and a class column, then run the full pipeline: covariance matrix,
// eigenvalues/eigenvectors, PCA, 2-class LDA, multiple linear regression,
// and logistic regression. Built on assets/js/stat-utils.js.

const MV_STATE = { headers: [], rows: [], meta: [] };

const MV_SAMPLE_CSV = `sepal_length,sepal_width,petal_length,petal_width,species
5.1,3.5,1.4,0.2,setosa
4.9,3.0,1.4,0.2,setosa
4.7,3.2,1.3,0.2,setosa
5.0,3.6,1.4,0.3,setosa
5.4,3.9,1.7,0.4,setosa
4.6,3.4,1.4,0.3,setosa
5.0,3.4,1.5,0.2,setosa
4.4,2.9,1.4,0.2,setosa
4.9,3.1,1.5,0.1,setosa
5.1,3.8,1.5,0.3,setosa
5.7,2.8,4.5,1.3,versicolor
6.3,3.3,4.7,1.6,versicolor
6.1,2.9,4.7,1.4,versicolor
6.4,3.2,4.5,1.5,versicolor
5.5,2.4,3.8,1.1,versicolor
6.6,3.0,4.4,1.4,versicolor
5.8,2.7,4.1,1.0,versicolor
6.2,2.2,4.5,1.5,versicolor
5.9,3.2,4.8,1.8,versicolor
6.0,2.9,4.5,1.5,versicolor
6.9,3.1,5.4,2.1,virginica
6.5,3.0,5.2,2.0,virginica
6.7,3.3,5.7,2.1,virginica
6.4,2.8,5.6,2.1,virginica
6.8,3.0,5.5,2.1,virginica
6.3,3.4,5.6,2.4,virginica
6.2,3.4,5.4,2.3,virginica
6.9,3.2,5.7,2.3,virginica
6.7,3.0,5.2,2.3,virginica
6.3,2.5,5.0,1.9,virginica`;

function mvInferColumnTypes(headers, rows) {
  return headers.map((h, ci) => {
    let numericCount = 0, nonMissing = 0;
    rows.forEach(r => {
      const v = (r[ci] ?? '').toString().trim();
      if (v === '') return;
      nonMissing++;
      if (!isNaN(parseFloat(v)) && isFinite(v)) numericCount++;
    });
    const numeric = nonMissing > 0 && numericCount / nonMissing >= 0.9;
    return { name: (h || `Column ${ci + 1}`).toString(), index: ci, numeric };
  });
}

function mvEscapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function mvProcess(headers, dataRows) {
  MV_STATE.headers = headers.map(h => (h ?? '').toString());
  MV_STATE.rows = dataRows;
  MV_STATE.meta = mvInferColumnTypes(MV_STATE.headers, dataRows);
  mvRenderColumnPickers();
  document.getElementById('mvStatus').textContent = `Loaded ${dataRows.length} rows × ${headers.length} columns. Pick feature/class columns below, then Analyze.`;
  document.getElementById('mvResults').style.display = 'none';
}

function mvHandleFile(file) {
  const status = document.getElementById('mvStatus');
  status.textContent = 'Reading file…';
  const name = file.name.toLowerCase();
  if (name.endsWith('.csv')) {
    const reader = new FileReader();
    reader.onload = e => {
      const rows = edaParseCSV(e.target.result);
      if (!rows.length) { status.textContent = 'Could not read any rows from that file.'; return; }
      mvProcess(rows[0], rows.slice(1));
    };
    reader.onerror = () => { status.textContent = 'Could not read that file.'; };
    reader.readAsText(file);
  } else if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
    if (typeof XLSX === 'undefined') { status.textContent = 'Excel support failed to load — export as CSV instead.'; return; }
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const wb = XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
        if (!rows.length) { status.textContent = 'Could not read any rows from that file.'; return; }
        mvProcess(rows[0], rows.slice(1).map(r => r.map(v => v === undefined ? '' : v)));
      } catch (err) { status.textContent = 'Could not parse that Excel file — try CSV instead.'; }
    };
    reader.onerror = () => { status.textContent = 'Could not read that file.'; };
    reader.readAsArrayBuffer(file);
  } else {
    status.textContent = 'Please upload a .csv, .xlsx, or .xls file.';
  }
}

function mvRenderColumnPickers() {
  const numericCols = MV_STATE.meta.filter(m => m.numeric);
  const featWrap = document.getElementById('mvFeatureChecks');
  featWrap.innerHTML = numericCols.map((m, i) =>
    `<label class="mv-check"><input type="checkbox" value="${m.index}" ${i < 4 ? 'checked' : ''}> ${mvEscapeHtml(m.name)}</label>`
  ).join('');

  const classSelect = document.getElementById('mvClassSelect');
  classSelect.innerHTML = MV_STATE.meta.map(m => `<option value="${m.index}">${mvEscapeHtml(m.name)}</option>`).join('');
  const likelyClassCol = MV_STATE.meta.find(m => !m.numeric) || MV_STATE.meta[MV_STATE.meta.length - 1];
  if (likelyClassCol) classSelect.value = likelyClassCol.index;

  const targetSelect = document.getElementById('mvTargetSelect');
  targetSelect.innerHTML = numericCols.map(m => `<option value="${m.index}">${mvEscapeHtml(m.name)}</option>`).join('');

  classSelect.onchange = mvPopulateClassAB;
  mvPopulateClassAB();
}

function mvPopulateClassAB() {
  const classIdx = parseInt(document.getElementById('mvClassSelect').value);
  const values = [...new Set(MV_STATE.rows.map(r => (r[classIdx] ?? '').toString().trim()).filter(v => v !== ''))];
  const selA = document.getElementById('mvClassASelect');
  const selB = document.getElementById('mvClassBSelect');
  selA.innerHTML = values.map(v => `<option value="${mvEscapeHtml(v)}">${mvEscapeHtml(v)}</option>`).join('');
  selB.innerHTML = values.map(v => `<option value="${mvEscapeHtml(v)}">${mvEscapeHtml(v)}</option>`).join('');
  if (values.length > 1) selB.value = values[1];
  document.getElementById('mvClassABNote').textContent = values.length >= 2
    ? `${values.length} distinct classes found — LDA and logistic regression need exactly two, so pick which pair to compare.`
    : 'This column needs at least 2 distinct values for LDA/logistic regression.';
}

function mvGetSelectedFeatureIndices() {
  return [...document.querySelectorAll('#mvFeatureChecks input[type=checkbox]:checked')].map(cb => parseInt(cb.value));
}

function mvRenderCovariance(cov, featureNames) {
  const maxAbs = Math.max(...cov.flat().map(v => Math.abs(v)), 1e-9);
  let html = '<div class="table-scroll"><table class="subnet-table corr-table"><thead><tr><th></th>' + featureNames.map(n => `<th>${mvEscapeHtml(n)}</th>`).join('') + '</tr></thead><tbody>';
  cov.forEach((row, i) => {
    html += `<tr><td class="st-label">${mvEscapeHtml(featureNames[i])}</td>`;
    row.forEach(v => {
      const t = Math.abs(v) / maxAbs;
      const color = v >= 0 ? lerpColor(LAB_COLORS.paperDim, LAB_COLORS.teal, t) : lerpColor(LAB_COLORS.paperDim, LAB_COLORS.red, t);
      html += `<td style="background:${color};">${v.toFixed(3)}</td>`;
    });
    html += '</tr>';
  });
  html += '</tbody></table></div>';
  document.getElementById('mvCovWrap').innerHTML = html;
}

function mvRenderEigen(eigenvalues, eigenvectors, featureNames) {
  const total = eigenvalues.reduce((a, b) => a + b, 0) || 1;
  let html = '<div class="table-scroll"><table class="subnet-table"><thead><tr><th>Component</th><th>Eigenvalue</th><th>% Variance</th>' +
    featureNames.map(n => `<th>${mvEscapeHtml(n)} loading</th>`).join('') + '</tr></thead><tbody>';
  eigenvalues.forEach((ev, i) => {
    html += `<tr><td class="st-label">PC${i + 1}</td><td>${ev.toFixed(4)}</td><td>${(ev / total * 100).toFixed(1)}%</td>` +
      eigenvectors[i].map(v => `<td>${v.toFixed(3)}</td>`).join('') + '</tr>';
  });
  html += '</tbody></table></div>';
  document.getElementById('mvEigenWrap').innerHTML = html;
}

function mvDrawScree(varExplained) {
  const canvas = document.getElementById('mvPcaScreeCanvas');
  const ctx = canvas.getContext('2d');
  clearCanvas(ctx, canvas);
  const maxV = Math.max(...varExplained, 0.01);
  const scaler = makeScaler(canvas, 0, varExplained.length, 0, maxV * 1.15, 40);
  drawFrame(ctx, scaler);
  varExplained.forEach((v, i) => {
    const [x0, y0] = scaler.toPx(i + 0.15, 0);
    const [x1, y1] = scaler.toPx(i + 0.85, v);
    ctx.fillStyle = LAB_COLORS.teal;
    ctx.fillRect(x0, y1, x1 - x0, y0 - y1);
    ctx.fillStyle = LAB_COLORS.inkSoft;
    ctx.font = '10px IBM Plex Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('PC' + (i + 1), (x0 + x1) / 2, scaler.h - scaler.pad + 16);
  });
}

function mvDrawPcaScatter(projected, labels, classList) {
  const canvas = document.getElementById('mvPcaScatterCanvas');
  const ctx = canvas.getContext('2d');
  clearCanvas(ctx, canvas);
  const xs = projected.map(p => p[0]), ys = projected.map(p => p[1] || 0);
  const xMin = Math.min(...xs), xMax = Math.max(...xs), yMin = Math.min(...ys), yMax = Math.max(...ys);
  const padX = (xMax - xMin) * 0.12 || 1, padY = (yMax - yMin) * 0.12 || 1;
  const scaler = makeScaler(canvas, xMin - padX, xMax + padX, yMin - padY, yMax + padY);
  drawFrame(ctx, scaler);
  projected.forEach((p, i) => {
    const colorIdx = classList.indexOf(labels[i]);
    drawPoint(ctx, scaler, p[0], p[1] || 0, { fill: CLUSTER_PALETTE[Math.max(0, colorIdx) % CLUSTER_PALETTE.length], r: 4.5 });
  });
  const legend = document.getElementById('mvPcaLegend');
  legend.innerHTML = classList.map((c, i) => `<span><span class="swatch" style="background:${CLUSTER_PALETTE[i % CLUSTER_PALETTE.length]}"></span>${mvEscapeHtml(c)}</span>`).join('');
}

function mvDrawLdaStrip(projected, labelsBin, classNames, threshold) {
  const canvas = document.getElementById('mvLdaStripCanvas');
  const ctx = canvas.getContext('2d');
  clearCanvas(ctx, canvas);
  const minV = Math.min(...projected), maxV = Math.max(...projected);
  const pad = (maxV - minV) * 0.1 || 1;
  const scaler = makeScaler(canvas, minV - pad, maxV + pad, 0, 1, 30);
  drawFrame(ctx, scaler);
  projected.forEach((v, i) => {
    const jitter = ((i * 37) % 100) / 100;
    drawPoint(ctx, scaler, v, 0.12 + jitter * 0.76, { fill: labelsBin[i] === 0 ? LAB_COLORS.teal : LAB_COLORS.red, r: 4 });
  });
  const [tx] = scaler.toPx(threshold, 0);
  ctx.beginPath(); ctx.moveTo(tx, scaler.pad); ctx.lineTo(tx, scaler.h - scaler.pad);
  ctx.strokeStyle = LAB_COLORS.ink; ctx.lineWidth = 2; ctx.setLineDash([5, 3]); ctx.stroke(); ctx.setLineDash([]);
}

function mvDrawLinregScatter(actual, predicted) {
  const canvas = document.getElementById('mvLinregScatterCanvas');
  const ctx = canvas.getContext('2d');
  clearCanvas(ctx, canvas);
  const all = [...actual, ...predicted];
  const minV = Math.min(...all), maxV = Math.max(...all);
  const pad = (maxV - minV) * 0.1 || 1;
  const scaler = makeScaler(canvas, minV - pad, maxV + pad, minV - pad, maxV + pad);
  drawFrame(ctx, scaler);
  drawLineSeg(ctx, scaler, minV - pad, minV - pad, maxV + pad, maxV + pad, { stroke: LAB_COLORS.rule, width: 1, dash: [4, 3] });
  actual.forEach((a, i) => drawPoint(ctx, scaler, a, predicted[i], { fill: LAB_COLORS.teal, r: 4 }));
}

function mvRenderLogregCm(predClass, actual) {
  let tp = 0, fp = 0, fn = 0, tn = 0;
  predClass.forEach((p, i) => {
    const pred1 = p === 1, act1 = actual[i] === 1;
    if (pred1 && act1) tp++; else if (pred1 && !act1) fp++; else if (!pred1 && act1) fn++; else tn++;
  });
  document.getElementById('mvCmTP').textContent = tp;
  document.getElementById('mvCmFP').textContent = fp;
  document.getElementById('mvCmFN').textContent = fn;
  document.getElementById('mvCmTN').textContent = tn;
}

function mvAnalyze() {
  const status = document.getElementById('mvStatus');
  const featureIdx = mvGetSelectedFeatureIndices();
  if (featureIdx.length < 2) { status.textContent = 'Pick at least two numeric feature columns.'; return; }

  const classIdx = parseInt(document.getElementById('mvClassSelect').value);
  const X = [], labelsAll = [];
  MV_STATE.rows.forEach(r => {
    const vals = featureIdx.map(ci => parseFloat(r[ci]));
    if (vals.every(v => !isNaN(v))) { X.push(vals); labelsAll.push((r[classIdx] ?? '').toString().trim()); }
  });
  if (X.length < featureIdx.length + 2) { status.textContent = 'Not enough complete numeric rows to analyze with this many features.'; return; }

  const featureNames = featureIdx.map(ci => MV_STATE.headers[ci]);
  const uniqueClasses = [...new Set(labelsAll)];
  status.textContent = '';
  document.getElementById('mvResults').style.display = 'block';
  document.getElementById('mvRowCount').textContent = X.length;
  document.getElementById('mvFeatureCount').textContent = featureIdx.length;

  // --- Covariance, eigenvalues/eigenvectors, PCA ---
  const pca = statPCA(X);
  mvRenderCovariance(pca.cov, featureNames);
  mvRenderEigen(pca.eigenvalues, pca.eigenvectors, featureNames);
  mvDrawScree(pca.varExplained);
  mvDrawPcaScatter(pca.projected, labelsAll, uniqueClasses);
  const pc12 = ((pca.varExplained[0] || 0) + (pca.varExplained[1] || 0)) * 100;
  document.getElementById('mvPcaVarText').textContent = `PC1 + PC2 together capture ${pc12.toFixed(1)}% of the total variance.`;

  // --- LDA + Logistic regression (binary, classA vs classB) ---
  const classA = document.getElementById('mvClassASelect').value;
  const classB = document.getElementById('mvClassBSelect').value;
  const Xbin = [], ybin = [];
  X.forEach((row, i) => {
    if (labelsAll[i] === classA) { Xbin.push(row); ybin.push(0); }
    else if (labelsAll[i] === classB) { Xbin.push(row); ybin.push(1); }
  });

  const ldaSection = document.getElementById('mvLdaSection');
  const logregSection = document.getElementById('mvLogregSection');
  if (classA && classB && classA !== classB && Xbin.length >= featureIdx.length + 4) {
    ldaSection.style.display = ''; logregSection.style.display = '';

    const lda = statLDA2Class(Xbin, ybin);
    let ldaHtml = '<table class="subnet-table"><thead><tr><th>Feature</th><th>LDA weight</th></tr></thead><tbody>';
    featureNames.forEach((n, i) => { ldaHtml += `<tr><td class="st-label">${mvEscapeHtml(n)}</td><td>${lda.w[i].toFixed(4)}</td></tr>`; });
    ldaHtml += '</tbody></table>';
    document.getElementById('mvLdaWeights').innerHTML = ldaHtml;
    document.getElementById('mvLdaAccuracy').textContent = (lda.accuracy * 100).toFixed(1) + '%';
    mvDrawLdaStrip(lda.projected, ybin, [classA, classB], lda.threshold);
    document.getElementById('mvLdaLegend').innerHTML =
      `<span><span class="swatch" style="background:${LAB_COLORS.teal}"></span>${mvEscapeHtml(classA)}</span>` +
      `<span><span class="swatch" style="background:${LAB_COLORS.red}"></span>${mvEscapeHtml(classB)}</span>`;

    const logreg = statLogisticRegression(Xbin, ybin, { lr: 0.3, iters: 800 });
    let lrHtml = '<table class="subnet-table"><thead><tr><th>Term</th><th>Coefficient (standardized)</th></tr></thead><tbody>';
    lrHtml += `<tr><td class="st-label">Intercept</td><td>${logreg.weights[0].toFixed(4)}</td></tr>`;
    featureNames.forEach((n, i) => { lrHtml += `<tr><td class="st-label">${mvEscapeHtml(n)}</td><td>${logreg.weights[i + 1].toFixed(4)}</td></tr>`; });
    lrHtml += '</tbody></table>';
    document.getElementById('mvLogregWeights').innerHTML = lrHtml;
    document.getElementById('mvLogregAccuracy').textContent = (logreg.accuracy * 100).toFixed(1) + '%';
    document.getElementById('mvLogregNote').textContent = `Predicting "${classB}" (1) vs. "${classA}" (0). Features were standardized (z-scored) before fitting so the coefficients are comparable to each other.`;
    mvRenderLogregCm(logreg.predClass, ybin);
  } else {
    ldaSection.style.display = 'none';
    logregSection.style.display = 'none';
  }

  // --- Linear regression ---
  const targetIdx = parseInt(document.getElementById('mvTargetSelect').value);
  const predictorIdx = featureIdx.filter(i => i !== targetIdx);
  const linregSection = document.getElementById('mvLinregSection');
  if (predictorIdx.length >= 1) {
    const Xr = [], yr = [];
    MV_STATE.rows.forEach(r => {
      const xVals = predictorIdx.map(ci => parseFloat(r[ci]));
      const yVal = parseFloat(r[targetIdx]);
      if (xVals.every(v => !isNaN(v)) && !isNaN(yVal)) { Xr.push(xVals); yr.push(yVal); }
    });
    if (Xr.length >= predictorIdx.length + 2) {
      linregSection.style.display = '';
      const linreg = statLinearRegression(Xr, yr);
      const predictorNames = predictorIdx.map(ci => MV_STATE.headers[ci]);
      let html = '<table class="subnet-table"><thead><tr><th>Term</th><th>Coefficient</th></tr></thead><tbody>';
      html += `<tr><td class="st-label">Intercept</td><td>${linreg.weights[0].toFixed(4)}</td></tr>`;
      predictorNames.forEach((n, i) => { html += `<tr><td class="st-label">${mvEscapeHtml(n)}</td><td>${linreg.weights[i + 1].toFixed(4)}</td></tr>`; });
      html += '</tbody></table>';
      document.getElementById('mvLinregWeights').innerHTML = html;
      document.getElementById('mvLinregR2').textContent = linreg.r2.toFixed(4);
      document.getElementById('mvLinregTargetLabel').textContent = MV_STATE.headers[targetIdx];
      mvDrawLinregScatter(yr, linreg.preds);
    } else {
      linregSection.style.display = 'none';
    }
  } else {
    linregSection.style.display = 'none';
  }
}

function initMVLabModule() {
  document.getElementById('mvFileInput').addEventListener('change', e => {
    if (e.target.files && e.target.files[0]) mvHandleFile(e.target.files[0]);
  });
  document.getElementById('mvLoadSample').addEventListener('click', () => {
    const rows = edaParseCSV(MV_SAMPLE_CSV);
    mvProcess(rows[0], rows.slice(1));
  });
  document.getElementById('mvAnalyzeBtn').addEventListener('click', mvAnalyze);
}
