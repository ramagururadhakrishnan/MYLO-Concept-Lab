// ---------- SHARED STATISTICS / LINEAR ALGEBRA ENGINE ----------
// Used by the Multivariate Data Lab (PCA / LDA / regression on uploaded data).
// Every function here is pure math — no DOM access — so it can be tested
// standalone in Node before any UI is wired to it.

function statMean(rows) {
  const n = rows.length, p = rows[0].length;
  const m = new Array(p).fill(0);
  rows.forEach(row => row.forEach((v, j) => { m[j] += v; }));
  return m.map(v => v / n);
}

function statCovarianceMatrix(rows) {
  const n = rows.length, p = rows[0].length;
  const means = statMean(rows);
  const cov = Array.from({ length: p }, () => new Array(p).fill(0));
  rows.forEach(row => {
    for (let i = 0; i < p; i++) {
      for (let j = 0; j < p; j++) cov[i][j] += (row[i] - means[i]) * (row[j] - means[j]);
    }
  });
  const denom = Math.max(1, n - 1);
  for (let i = 0; i < p; i++) for (let j = 0; j < p; j++) cov[i][j] /= denom;
  return { cov, means };
}

// Classic Jacobi eigenvalue algorithm — for symmetric matrices only (which a
// covariance matrix always is). Returns eigenvalues and the matching
// eigenvectors (as rows), not sorted.
function statJacobiEigen(matrix, maxIter = 200, tol = 1e-12) {
  const n = matrix.length;
  let a = matrix.map(row => [...row]);
  let v = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));

  for (let iter = 0; iter < maxIter; iter++) {
    let p = 0, q = 1, max = 0;
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      if (Math.abs(a[i][j]) > max) { max = Math.abs(a[i][j]); p = i; q = j; }
    }
    if (max < tol) break;

    const app = a[p][p], aqq = a[q][q], apq = a[p][q];
    const phi = Math.abs(app - aqq) < 1e-300 ? Math.PI / 4 : 0.5 * Math.atan2(2 * apq, aqq - app);
    const c = Math.cos(phi), s = Math.sin(phi);

    for (let k = 0; k < n; k++) {
      const akp = a[k][p], akq = a[k][q];
      a[k][p] = c * akp - s * akq;
      a[k][q] = s * akp + c * akq;
    }
    for (let k = 0; k < n; k++) {
      const apk = a[p][k], aqk = a[q][k];
      a[p][k] = c * apk - s * aqk;
      a[q][k] = s * apk + c * aqk;
    }
    for (let k = 0; k < n; k++) {
      const vkp = v[k][p], vkq = v[k][q];
      v[k][p] = c * vkp - s * vkq;
      v[k][q] = s * vkp + c * vkq;
    }
  }

  const eigenvalues = a.map((row, i) => row[i]);
  const eigenvectors = [];
  for (let j = 0; j < n; j++) eigenvectors.push(v.map(row => row[j]));
  return { eigenvalues, eigenvectors };
}

// Sorts eigenpairs by eigenvalue descending — the convention PCA needs.
function statSortEigen(eigenvalues, eigenvectors) {
  const idx = eigenvalues.map((_, i) => i).sort((a, b) => eigenvalues[b] - eigenvalues[a]);
  return { eigenvalues: idx.map(i => eigenvalues[i]), eigenvectors: idx.map(i => eigenvectors[i]) };
}

function statPCA(rows) {
  const { cov, means } = statCovarianceMatrix(rows);
  const raw = statJacobiEigen(cov);
  const { eigenvalues, eigenvectors } = statSortEigen(raw.eigenvalues, raw.eigenvectors);
  const totalVar = eigenvalues.reduce((a, b) => a + b, 0) || 1;
  const varExplained = eigenvalues.map(v => v / totalVar);
  const projected = rows.map(row => {
    const centered = row.map((v, j) => v - means[j]);
    return eigenvectors.map(vec => centered.reduce((s, v, j) => s + v * vec[j], 0));
  });
  return { cov, means, eigenvalues, eigenvectors, varExplained, projected };
}

// Gauss-Jordan matrix inverse with partial pivoting.
function statMatrixInverse(A) {
  const n = A.length;
  const M = A.map((row, i) => [...row, ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))]);
  for (let col = 0; col < n; col++) {
    let piv = col;
    for (let r = col + 1; r < n; r++) if (Math.abs(M[r][col]) > Math.abs(M[piv][col])) piv = r;
    [M[col], M[piv]] = [M[piv], M[col]];
    const pivVal = M[col][col];
    if (Math.abs(pivVal) < 1e-12) continue; // singular direction — leave row as-is (defensive, ridge term below avoids this in practice)
    for (let c = 0; c < 2 * n; c++) M[col][c] /= pivVal;
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const factor = M[r][col];
      for (let c = 0; c < 2 * n; c++) M[r][c] -= factor * M[col][c];
    }
  }
  return M.map(row => row.slice(n));
}
function statMatVecMul(A, v) { return A.map(row => row.reduce((s, a, j) => s + a * v[j], 0)); }

// 2-class Fisher's LDA (closed form: w = Sw^-1 (mean0 - mean1)).
function statLDA2Class(rows, labels) {
  const classes = [...new Set(labels)];
  if (classes.length !== 2) return null;
  const p = rows[0].length;
  const rowsOf = c => rows.filter((_, i) => labels[i] === c);
  const class0 = rowsOf(classes[0]), class1 = rowsOf(classes[1]);
  const mean0 = statMean(class0), mean1 = statMean(class1);

  const Sw = Array.from({ length: p }, () => new Array(p).fill(0));
  [[class0, mean0], [class1, mean1]].forEach(([cls, m]) => {
    cls.forEach(row => {
      const d = row.map((v, j) => v - m[j]);
      for (let i = 0; i < p; i++) for (let j = 0; j < p; j++) Sw[i][j] += d[i] * d[j];
    });
  });
  for (let i = 0; i < p; i++) Sw[i][i] += 1e-6; // ridge for numerical stability

  const SwInv = statMatrixInverse(Sw);
  const meanDiff = mean0.map((v, j) => v - mean1[j]);
  const wRaw = statMatVecMul(SwInv, meanDiff);
  const norm = Math.sqrt(wRaw.reduce((s, v) => s + v * v, 0)) || 1;
  const w = wRaw.map(v => v / norm);

  const projected = rows.map(row => row.reduce((s, v, j) => s + v * w[j], 0));
  const proj0 = projected.filter((_, i) => labels[i] === classes[0]);
  const proj1 = projected.filter((_, i) => labels[i] === classes[1]);
  const mean0p = proj0.reduce((a, b) => a + b, 0) / proj0.length;
  const mean1p = proj1.reduce((a, b) => a + b, 0) / proj1.length;
  const threshold = (mean0p + mean1p) / 2;
  const flip = mean0p < mean1p; // true when class0 sits on the LOW side of the projection
  const predClass = projected.map(v => (flip ? v < threshold : v >= threshold) ? classes[0] : classes[1]);
  const accuracy = predClass.reduce((s, p, i) => s + (p === labels[i] ? 1 : 0), 0) / labels.length;

  return { w, projected, threshold, classes, mean0proj: mean0p, mean1proj: mean1p, accuracy };
}

// Generic linear system solve (Gaussian elimination, partial pivoting).
function statSolveLinearSystem(A, b) {
  const n = A.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let col = 0; col < n; col++) {
    let piv = col;
    for (let r = col + 1; r < n; r++) if (Math.abs(M[r][col]) > Math.abs(M[piv][col])) piv = r;
    [M[col], M[piv]] = [M[piv], M[col]];
    if (Math.abs(M[col][col]) < 1e-12) continue;
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const factor = M[r][col] / M[col][col];
      for (let c = col; c <= n; c++) M[r][c] -= factor * M[col][c];
    }
  }
  return M.map((row, i) => Math.abs(row[i]) < 1e-12 ? 0 : row[n] / row[i]);
}

// Multiple linear regression via the normal equations, with an intercept.
function statLinearRegression(X, y) {
  const n = X.length, p = X[0].length;
  const Xd = X.map(row => [1, ...row]);
  const d = p + 1;
  const XtX = Array.from({ length: d }, () => new Array(d).fill(0));
  const Xty = new Array(d).fill(0);
  Xd.forEach((row, i) => {
    for (let a = 0; a < d; a++) {
      Xty[a] += row[a] * y[i];
      for (let b = 0; b < d; b++) XtX[a][b] += row[a] * row[b];
    }
  });
  for (let i = 0; i < d; i++) XtX[i][i] += 1e-8;
  const w = statSolveLinearSystem(XtX, Xty);
  const preds = Xd.map(row => row.reduce((s, v, i) => s + v * w[i], 0));
  const yMean = y.reduce((a, b) => a + b, 0) / n;
  const ssRes = preds.reduce((s, p, i) => s + (y[i] - p) ** 2, 0);
  const ssTot = y.reduce((s, v) => s + (v - yMean) ** 2, 0) || 1;
  const r2 = 1 - ssRes / ssTot;
  return { weights: w, preds, r2 };
}

function statStandardize(X) {
  const n = X.length, p = X[0].length;
  const means = statMean(X);
  const stds = new Array(p).fill(0);
  X.forEach(row => row.forEach((v, j) => { stds[j] += (v - means[j]) ** 2; }));
  const s = stds.map(v => Math.sqrt(v / n) || 1);
  return { Z: X.map(row => row.map((v, j) => (v - means[j]) / s[j])), means, stds: s };
}

// Logistic regression via batch gradient descent on standardized features.
function statLogisticRegression(X, y, opts = {}) {
  const lr = opts.lr || 0.3, iters = opts.iters || 800;
  const n = X.length, p = X[0].length;
  const { Z } = statStandardize(X);
  const Xd = Z.map(row => [1, ...row]);
  const d = p + 1;
  let w = new Array(d).fill(0);
  const sigmoid = z => 1 / (1 + Math.exp(-z));
  for (let it = 0; it < iters; it++) {
    const grad = new Array(d).fill(0);
    Xd.forEach((row, i) => {
      const pred = sigmoid(row.reduce((s, v, j) => s + v * w[j], 0));
      const err = pred - y[i];
      row.forEach((v, j) => { grad[j] += err * v; });
    });
    w = w.map((wj, j) => wj - lr * grad[j] / n);
  }
  const probs = Xd.map(row => sigmoid(row.reduce((s, v, j) => s + v * w[j], 0)));
  const predClass = probs.map(p => (p >= 0.5 ? 1 : 0));
  const accuracy = predClass.reduce((s, p, i) => s + (p === y[i] ? 1 : 0), 0) / n;
  return { weights: w, probs, predClass, accuracy, standardized: true };
}
