// ---------- LEVENSHTEIN MODULE ----------
// Computes edit distance, backtraces the optimal path through the DP table,
// and builds a left-to-right sequence of "steps" so students can watch the
// source word transform into the target word one operation at a time.

let levSteps = [];
let levStepIdx = 0;

function levenshteinTable(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1];
      else dp[i][j] = 1 + Math.min(dp[i - 1][j - 1], dp[i][j - 1], dp[i - 1][j]);
    }
  }
  return dp;
}

function levBacktrace(a, b, dp) {
  let i = a.length, j = b.length;
  const path = [];
  const ops = [];
  while (i > 0 || j > 0) {
    path.push({ i, j });
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1] && dp[i][j] === dp[i - 1][j - 1]) {
      ops.push({ type: 'match', ai: i - 1, bj: j - 1 });
      i--; j--;
    } else if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + 1) {
      ops.push({ type: 'sub', ai: i - 1, bj: j - 1 });
      i--; j--;
    } else if (j > 0 && dp[i][j] === dp[i][j - 1] + 1) {
      ops.push({ type: 'ins', ai: i - 1, bj: j - 1 });
      j--;
    } else {
      ops.push({ type: 'del', ai: i - 1, bj: j - 1 });
      i--;
    }
  }
  path.push({ i, j });
  ops.reverse();
  path.reverse();
  return { ops, path };
}

function buildLevSteps(a, b, ops) {
  let working = a.split('').map(c => ({ ch: c, tag: 'plain' }));
  const steps = [working.map(x => ({ ...x }))];
  let ptr = 0;
  ops.forEach(op => {
    if (op.type === 'match') {
      working[ptr] = { ch: working[ptr].ch, tag: 'plain' };
      ptr++;
    } else if (op.type === 'sub') {
      working[ptr] = { ch: working[ptr].ch, tag: 'sub', to: b[op.bj] };
      steps.push(working.map(x => ({ ...x })));
      working[ptr] = { ch: b[op.bj], tag: 'plain' };
      ptr++;
    } else if (op.type === 'del') {
      working[ptr] = { ch: working[ptr].ch, tag: 'del' };
      steps.push(working.map(x => ({ ...x })));
      working.splice(ptr, 1);
    } else if (op.type === 'ins') {
      working.splice(ptr, 0, { ch: b[op.bj], tag: 'ins' });
      steps.push(working.map(x => ({ ...x })));
      working[ptr] = { ch: b[op.bj], tag: 'plain' };
      ptr++;
    }
  });
  steps.push(working.map(x => ({ ...x })));
  return steps;
}

function renderTraceStep(step) {
  const el = document.getElementById('traceLine');
  el.innerHTML = '';
  step.forEach(item => {
    const span = document.createElement('span');
    span.className = 'ch' + (item.tag && item.tag !== 'plain' ? ' ' + item.tag : '');
    span.textContent = item.ch;
    if (item.tag === 'sub' && item.to) span.setAttribute('data-to', item.to);
    el.appendChild(span);
  });
}

function renderDPGrid(a, b, dp, path) {
  const table = document.getElementById('dpGrid');
  table.innerHTML = '';
  const pathSet = new Set(path.map(p => p.i + '-' + p.j));

  const headRow = document.createElement('tr');
  const cornerTh = document.createElement('th');
  cornerTh.textContent = '';
  headRow.appendChild(cornerTh);
  const emptyTh = document.createElement('th');
  emptyTh.textContent = 'ε';
  headRow.appendChild(emptyTh);
  for (let j = 0; j < b.length; j++) {
    const th = document.createElement('th');
    th.textContent = b[j];
    headRow.appendChild(th);
  }
  table.appendChild(headRow);

  for (let i = 0; i <= a.length; i++) {
    const row = document.createElement('tr');
    const th = document.createElement('th');
    th.textContent = i === 0 ? 'ε' : a[i - 1];
    row.appendChild(th);
    for (let j = 0; j <= b.length; j++) {
      const td = document.createElement('td');
      td.textContent = dp[i][j];
      td.className = 'cell' + (pathSet.has(i + '-' + j) ? ' path' : '');
      row.appendChild(td);
    }
    table.appendChild(row);
  }
}

function updateStepCount() {
  document.getElementById('stepCount').textContent = `step ${levStepIdx} / ${levSteps.length - 1}`;
  document.getElementById('stepBack').disabled = levStepIdx === 0;
  document.getElementById('stepFwd').disabled = levStepIdx === levSteps.length - 1;
}

function runLevenshtein() {
  const a = document.getElementById('wordA').value.trim().toLowerCase() || 'kitten';
  const b = document.getElementById('wordB').value.trim().toLowerCase() || 'sitting';
  const dp = levenshteinTable(a, b);
  const distance = dp[a.length][b.length];
  const { ops, path } = levBacktrace(a, b, dp);

  document.getElementById('levNumber').textContent = distance;
  document.getElementById('levWordsLabel').textContent = `"${a}" into "${b}"`;

  renderDPGrid(a, b, dp, path);

  levSteps = buildLevSteps(a, b, ops);
  levStepIdx = 0;
  renderTraceStep(levSteps[0]);
  updateStepCount();
}

function initLevenshteinModule() {
  document.getElementById('levGo').addEventListener('click', runLevenshtein);
  document.getElementById('stepFwd').addEventListener('click', () => {
    if (levStepIdx < levSteps.length - 1) {
      levStepIdx++;
      renderTraceStep(levSteps[levStepIdx]);
      updateStepCount();
    }
  });
  document.getElementById('stepBack').addEventListener('click', () => {
    if (levStepIdx > 0) {
      levStepIdx--;
      renderTraceStep(levSteps[levStepIdx]);
      updateStepCount();
    }
  });
  ['wordA', 'wordB'].forEach(id => {
    document.getElementById(id).addEventListener('keydown', e => {
      if (e.key === 'Enter') runLevenshtein();
    });
  });
  runLevenshtein();
}
