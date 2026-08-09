// ---------- SHARED THEORY OF COMPUTATION ENGINE ----------
// Every FA is represented the same way, DFA or NFA:
//   { states: [...], alphabet: [...], transitions: {state: {symbol: [targetStates]}}, start, accept: [...] }
// A DFA is just an NFA where every transition array has length <= 1 and there's no 'ε'.

function faSvgEl(tag, attrs) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const k in attrs) el.setAttribute(k, attrs[k]);
  return el;
}

function renderFADiagram(svgId, def, opts = {}) {
  const svg = document.getElementById(svgId);
  if (!svg) return;
  svg.innerHTML = '';
  const width = opts.width || 560, height = opts.height || 380;
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

  const defs = faSvgEl('defs', {});
  const marker = faSvgEl('marker', { id: svgId + '-arrow', markerWidth: 8, markerHeight: 8, refX: 7, refY: 4, orient: 'auto', markerUnits: 'userSpaceOnUse' });
  marker.appendChild(faSvgEl('path', { d: 'M0,0 L8,4 L0,8 Z', fill: LAB_COLORS.ink }));
  defs.appendChild(marker);
  svg.appendChild(defs);

  const n = def.states.length || 1;
  const R = Math.max(70, Math.min(width, height) / 2 - 70);
  const cx = width / 2, cy = height / 2 + 6;
  const pos = {};
  def.states.forEach((s, i) => {
    const angle = (2 * Math.PI * i / n) - Math.PI / 2;
    pos[s] = { x: cx + R * Math.cos(angle), y: cy + R * Math.sin(angle) };
  });

  const edgeMap = {};
  Object.keys(def.transitions || {}).forEach(from => {
    Object.keys(def.transitions[from] || {}).forEach(sym => {
      const targets = def.transitions[from][sym] || [];
      targets.forEach(to => {
        if (!to || !pos[to]) return;
        const key = from + '|' + to;
        (edgeMap[key] = edgeMap[key] || []).push(sym);
      });
    });
  });

  Object.keys(edgeMap).forEach(key => {
    const [from, to] = key.split('|');
    const label = edgeMap[key].join(',');
    if (from === to) {
      const p = pos[from];
      const loop = faSvgEl('path', {
        d: `M ${p.x - 14},${p.y - 20} C ${p.x - 32},${p.y - 55} ${p.x + 32},${p.y - 55} ${p.x + 14},${p.y - 20}`,
        fill: 'none', stroke: LAB_COLORS.ink, 'stroke-width': 1.6, 'marker-end': `url(#${svgId}-arrow)`
      });
      svg.appendChild(loop);
      const t = faSvgEl('text', { x: p.x, y: p.y - 58, 'text-anchor': 'middle', 'font-size': 11, fill: LAB_COLORS.inkSoft, 'font-family': 'IBM Plex Mono, monospace' });
      t.textContent = label;
      svg.appendChild(t);
    } else {
      const hasReverse = edgeMap[to + '|' + from] !== undefined;
      const p1 = pos[from], p2 = pos[to];
      const dx = p2.x - p1.x, dy = p2.y - p1.y, dist = Math.hypot(dx, dy) || 1;
      const nx = -dy / dist, ny = dx / dist;
      const offset = hasReverse ? 20 : 0;
      const mx = (p1.x + p2.x) / 2 + nx * offset, my = (p1.y + p2.y) / 2 + ny * offset;
      const ux = dx / dist, uy = dy / dist, rad = 21;
      const sx = p1.x + ux * rad, sy = p1.y + uy * rad;
      const ex = p2.x - ux * rad, ey = p2.y - uy * rad;
      const path = faSvgEl('path', { d: `M ${sx},${sy} Q ${mx},${my} ${ex},${ey}`, fill: 'none', stroke: LAB_COLORS.ink, 'stroke-width': 1.6, 'marker-end': `url(#${svgId}-arrow)` });
      svg.appendChild(path);
      const t = faSvgEl('text', { x: mx, y: my - 5, 'text-anchor': 'middle', 'font-size': 11, fill: LAB_COLORS.inkSoft, 'font-family': 'IBM Plex Mono, monospace' });
      t.textContent = label;
      svg.appendChild(t);
    }
  });

  const sp = pos[def.start];
  if (sp) {
    const angleIn = Math.atan2(sp.y - cy, sp.x - cx);
    const sx = sp.x - Math.cos(angleIn) * 50, sy = sp.y - Math.sin(angleIn) * 50;
    const ex = sp.x - Math.cos(angleIn) * 22, ey = sp.y - Math.sin(angleIn) * 22;
    svg.appendChild(faSvgEl('line', { x1: sx, y1: sy, x2: ex, y2: ey, stroke: LAB_COLORS.red, 'stroke-width': 2.2, 'marker-end': `url(#${svgId}-arrow)` }));
  }

  const currentSet = opts.current instanceof Set ? opts.current : new Set(opts.current ? [opts.current] : []);
  def.states.forEach(s => {
    const p = pos[s];
    const isAccept = (def.accept || []).includes(s);
    const isCurrent = currentSet.has(s);
    svg.appendChild(faSvgEl('circle', { cx: p.x, cy: p.y, r: 20, fill: isCurrent ? LAB_COLORS.tealSoft : LAB_COLORS.card, stroke: LAB_COLORS.ink, 'stroke-width': 1.8 }));
    if (isAccept) svg.appendChild(faSvgEl('circle', { cx: p.x, cy: p.y, r: 15, fill: 'none', stroke: LAB_COLORS.ink, 'stroke-width': 1.3 }));
    const label = s.length > 8 ? s.slice(0, 7) + '…' : s;
    const text = faSvgEl('text', { x: p.x, y: p.y + 4, 'text-anchor': 'middle', 'font-size': 11, 'font-family': 'IBM Plex Mono, monospace', fill: LAB_COLORS.ink });
    text.textContent = label;
    if (label !== s) { const t2 = faSvgEl('title', {}); t2.textContent = s; text.appendChild(t2); }
    svg.appendChild(text);
  });
}

// ---- Core simulation (works for both DFA and NFA / epsilon-NFA) ----
function faEpsilonClosure(transitions, seedStates) {
  const stack = [...seedStates];
  const closure = new Set(seedStates);
  while (stack.length) {
    const s = stack.pop();
    const eps = (transitions[s] && transitions[s]['ε']) || [];
    eps.forEach(t => { if (!closure.has(t)) { closure.add(t); stack.push(t); } });
  }
  return closure;
}
function faStep(transitions, currentSet, symbol) {
  const next = new Set();
  currentSet.forEach(s => {
    const targets = (transitions[s] && transitions[s][symbol]) || [];
    targets.forEach(t => next.add(t));
  });
  return faEpsilonClosure(transitions, next);
}
function faSimulate(def, input) {
  let current = faEpsilonClosure(def.transitions, [def.start]);
  const trace = [{ symbol: null, states: [...current].sort() }];
  for (const ch of input) {
    current = faStep(def.transitions, current, ch);
    trace.push({ symbol: ch, states: [...current].sort() });
  }
  const accepted = [...current].some(s => (def.accept || []).includes(s));
  return { trace, accepted, finalStates: [...current].sort() };
}

// ---- Subset construction (NFA -> DFA) ----
function faSubsetConstruction(nfaDef) {
  const alphabet = nfaDef.alphabet.filter(a => a !== 'ε');
  const startClosure = faEpsilonClosure(nfaDef.transitions, [nfaDef.start]);
  const keyOf = set => [...set].sort().join(',') || '∅';
  const startKey = keyOf(startClosure);
  const dfaStateSets = { [startKey]: [...startClosure].sort() };
  const dfaTransitions = { [startKey]: {} };
  const worklist = [startKey];
  const steps = [];
  while (worklist.length) {
    const key = worklist.shift();
    const stateSet = dfaStateSets[key];
    dfaTransitions[key] = dfaTransitions[key] || {};
    const stepRow = { from: key, moves: [] };
    alphabet.forEach(sym => {
      const next = faStep(nfaDef.transitions, stateSet, sym);
      if (next.size === 0) { stepRow.moves.push({ sym, to: '∅' }); return; }
      const nextKey = keyOf(next);
      if (!dfaStateSets[nextKey]) { dfaStateSets[nextKey] = [...next].sort(); worklist.push(nextKey); }
      dfaTransitions[key][sym] = [nextKey];
      stepRow.moves.push({ sym, to: nextKey });
    });
    steps.push(stepRow);
  }
  const states = Object.keys(dfaStateSets);
  const accept = states.filter(k => dfaStateSets[k].some(s => nfaDef.accept.includes(s)));
  return { def: { states, alphabet, transitions: dfaTransitions, start: startKey, accept }, stateSets: dfaStateSets, steps };
}

// ---- DFA completion (add explicit trap state) + minimization ----
function faCompleteDFA(def) {
  const trans = {};
  def.states.forEach(s => { trans[s] = { ...(def.transitions[s] || {}) }; });
  let needsTrap = false;
  def.states.forEach(s => def.alphabet.forEach(sym => {
    if (!trans[s][sym] || !trans[s][sym].length) needsTrap = true;
  }));
  const states = [...def.states];
  if (needsTrap) {
    states.push('DEAD');
    trans['DEAD'] = {};
    def.alphabet.forEach(sym => { trans['DEAD'][sym] = ['DEAD']; });
    states.forEach(s => def.alphabet.forEach(sym => {
      if (!trans[s][sym] || !trans[s][sym].length) trans[s][sym] = ['DEAD'];
    }));
  }
  return { states, alphabet: def.alphabet, transitions: trans, start: def.start, accept: def.accept };
}

function faMinimizeDFA(defIn) {
  const def = faCompleteDFA(defIn);
  let partition = [def.states.filter(s => def.accept.includes(s)), def.states.filter(s => !def.accept.includes(s))].filter(g => g.length);
  const rounds = [partition.map(g => [...g])];
  let changed = true;
  while (changed) {
    changed = false;
    const newPartition = [];
    partition.forEach(group => {
      const buckets = {};
      group.forEach(s => {
        const sig = def.alphabet.map(sym => {
          const target = def.transitions[s][sym][0];
          return partition.findIndex(g => g.includes(target));
        }).join(',');
        (buckets[sig] = buckets[sig] || []).push(s);
      });
      const newGroups = Object.values(buckets);
      if (newGroups.length > 1) changed = true;
      newGroups.forEach(g => newPartition.push(g));
    });
    partition = newPartition;
    rounds.push(partition.map(g => [...g]));
  }
  const groupName = g => '{' + g.join(',') + '}';
  const stateOf = {};
  partition.forEach(g => g.forEach(s => { stateOf[s] = groupName(g); }));
  const minStates = partition.map(groupName);
  const minTransitions = {};
  partition.forEach(g => {
    const rep = g[0];
    minTransitions[groupName(g)] = {};
    def.alphabet.forEach(sym => { minTransitions[groupName(g)][sym] = [stateOf[def.transitions[rep][sym][0]]]; });
  });
  const minimized = { states: minStates, alphabet: def.alphabet, transitions: minTransitions, start: stateOf[def.start], accept: [...new Set(def.accept.map(s => stateOf[s]))] };
  return { minimized, rounds, completed: def };
}

// ---- Regex -> NFA (Thompson construction) ----
let _faRegexCounter = 0;
function _faRegexNewState() { return 'q' + (_faRegexCounter++); }

function faRegexParse(pattern) {
  let i = 0;
  function peek() { return pattern[i]; }
  function parseExpr() {
    let node = parseTerm();
    while (peek() === '|') { i++; node = { type: 'union', left: node, right: parseTerm() }; }
    return node;
  }
  function parseTerm() {
    let node = null;
    while (i < pattern.length && peek() !== '|' && peek() !== ')') {
      const f = parseFactor();
      node = node ? { type: 'concat', left: node, right: f } : f;
    }
    return node || { type: 'epsilon' };
  }
  function parseFactor() {
    let atom = parseAtom();
    while (i < pattern.length && (peek() === '*' || peek() === '+' || peek() === '?')) {
      const op = peek(); i++;
      atom = { type: op === '*' ? 'star' : op === '+' ? 'plus' : 'opt', child: atom };
    }
    return atom;
  }
  function parseAtom() {
    if (peek() === '(') { i++; const node = parseExpr(); if (peek() === ')') i++; else throw new Error('Missing )'); return node; }
    if (peek() === undefined) throw new Error('Unexpected end of pattern');
    const ch = peek(); i++;
    return { type: 'char', ch };
  }
  const ast = parseExpr();
  if (i !== pattern.length) throw new Error(`Unexpected "${pattern[i]}" at position ${i}`);
  return ast;
}

function _faThompsonBuild(node, trans) {
  switch (node.type) {
    case 'char': {
      const s1 = _faRegexNewState(), s2 = _faRegexNewState();
      trans[s1] = { [node.ch]: [s2] };
      return { start: s1, accept: s2 };
    }
    case 'epsilon': {
      const s1 = _faRegexNewState(), s2 = _faRegexNewState();
      trans[s1] = { 'ε': [s2] };
      return { start: s1, accept: s2 };
    }
    case 'concat': {
      const a = _faThompsonBuild(node.left, trans), b = _faThompsonBuild(node.right, trans);
      trans[a.accept] = trans[a.accept] || {};
      trans[a.accept]['ε'] = (trans[a.accept]['ε'] || []).concat(b.start);
      return { start: a.start, accept: b.accept };
    }
    case 'union': {
      const a = _faThompsonBuild(node.left, trans), b = _faThompsonBuild(node.right, trans);
      const s1 = _faRegexNewState(), s2 = _faRegexNewState();
      trans[s1] = { 'ε': [a.start, b.start] };
      trans[a.accept] = trans[a.accept] || {}; trans[a.accept]['ε'] = (trans[a.accept]['ε'] || []).concat(s2);
      trans[b.accept] = trans[b.accept] || {}; trans[b.accept]['ε'] = (trans[b.accept]['ε'] || []).concat(s2);
      return { start: s1, accept: s2 };
    }
    case 'star': {
      const a = _faThompsonBuild(node.child, trans);
      const s1 = _faRegexNewState(), s2 = _faRegexNewState();
      trans[s1] = { 'ε': [a.start, s2] };
      trans[a.accept] = trans[a.accept] || {}; trans[a.accept]['ε'] = (trans[a.accept]['ε'] || []).concat([a.start, s2]);
      return { start: s1, accept: s2 };
    }
    case 'plus':
      return _faThompsonBuild({ type: 'concat', left: node.child, right: { type: 'star', child: node.child } }, trans);
    case 'opt': {
      const a = _faThompsonBuild(node.child, trans);
      const s1 = _faRegexNewState(), s2 = _faRegexNewState();
      trans[s1] = { 'ε': [a.start, s2] };
      trans[a.accept] = trans[a.accept] || {}; trans[a.accept]['ε'] = (trans[a.accept]['ε'] || []).concat(s2);
      return { start: s1, accept: s2 };
    }
  }
}

function faRegexToNFA(pattern) {
  _faRegexCounter = 0;
  const ast = faRegexParse(pattern);
  const trans = {};
  const frag = _faThompsonBuild(ast, trans);
  const allStates = new Set(Object.keys(trans));
  Object.values(trans).forEach(m => Object.values(m).forEach(arr => arr.forEach(s => allStates.add(s))));
  allStates.add(frag.start); allStates.add(frag.accept);
  const alphabet = [...new Set(Object.values(trans).flatMap(m => Object.keys(m)))].filter(a => a !== 'ε');
  return { def: { states: [...allStates], alphabet, transitions: trans, start: frag.start, accept: [frag.accept] }, ast };
}

// ---- Product construction (closure properties: union / intersection / complement) ----
function faProduct(defA, defB, alphabet, mode) {
  const key = (a, b) => a + '||' + b;
  const start = key(defA.start, defB.start);
  const states = [], transitions = {}, accept = [];
  const worklist = [[defA.start, defB.start]];
  const seen = new Set([start]);
  while (worklist.length) {
    const [a, b] = worklist.shift();
    const k = key(a, b);
    states.push(k);
    transitions[k] = {};
    const aAcc = defA.accept.includes(a), bAcc = defB.accept.includes(b);
    if (mode === 'union' ? (aAcc || bAcc) : (aAcc && bAcc)) accept.push(k);
    alphabet.forEach(sym => {
      const na = defA.transitions[a] && defA.transitions[a][sym] ? defA.transitions[a][sym][0] : null;
      const nb = defB.transitions[b] && defB.transitions[b][sym] ? defB.transitions[b][sym][0] : null;
      if (na == null || nb == null) return;
      const nk = key(na, nb);
      if (!seen.has(nk)) { seen.add(nk); worklist.push([na, nb]); }
      transitions[k][sym] = [nk];
    });
  }
  return { states, alphabet, transitions, start, accept };
}
function faComplement(def, alphabet) {
  const completed = faCompleteDFA({ ...def, alphabet });
  return { states: completed.states, alphabet, transitions: completed.transitions, start: completed.start, accept: completed.states.filter(s => !completed.accept.includes(s)) };
}

// ---- Shared table renderers ----
function renderDFATransitionTable(containerId, def, onChange) {
  const wrap = document.getElementById(containerId);
  wrap.innerHTML = '';
  const table = document.createElement('table');
  table.className = 'subnet-table fa-table';
  const thead = document.createElement('thead');
  thead.innerHTML = '<tr><th>State</th>' + def.alphabet.map(a => `<th>${a}</th>`).join('') + '</tr>';
  table.appendChild(thead);
  const tbody = document.createElement('tbody');
  def.states.forEach(s => {
    const tr = document.createElement('tr');
    let rowHtml = `<td class="st-label">${s}${s === def.start ? ' &rarr;' : ''}${def.accept.includes(s) ? ' *' : ''}</td>`;
    def.alphabet.forEach(sym => {
      const current = (def.transitions[s] && def.transitions[s][sym] && def.transitions[s][sym][0]) || '';
      const opts = ['<option value="">—</option>'].concat(def.states.map(t => `<option value="${t}" ${t === current ? 'selected' : ''}>${t}</option>`)).join('');
      rowHtml += `<td><select data-state="${s}" data-sym="${sym}">${opts}</select></td>`;
    });
    tr.innerHTML = rowHtml;
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  wrap.appendChild(table);
  wrap.querySelectorAll('select').forEach(sel => {
    sel.addEventListener('change', e => {
      const state = e.target.dataset.state, sym = e.target.dataset.sym;
      def.transitions[state] = def.transitions[state] || {};
      def.transitions[state][sym] = e.target.value ? [e.target.value] : [];
      onChange();
    });
  });
}

function renderNFATransitionTable(containerId, def, onChange) {
  const wrap = document.getElementById(containerId);
  wrap.innerHTML = '';
  const cols = def.alphabet.includes('ε') ? def.alphabet : def.alphabet.concat(['ε']);
  const table = document.createElement('table');
  table.className = 'subnet-table fa-table';
  const thead = document.createElement('thead');
  thead.innerHTML = '<tr><th>State</th>' + cols.map(a => `<th>${a}</th>`).join('') + '</tr>';
  table.appendChild(thead);
  const tbody = document.createElement('tbody');
  def.states.forEach(s => {
    const tr = document.createElement('tr');
    let rowHtml = `<td class="st-label">${s}${s === def.start ? ' &rarr;' : ''}${def.accept.includes(s) ? ' *' : ''}</td>`;
    cols.forEach(sym => {
      const current = ((def.transitions[s] && def.transitions[s][sym]) || []).join(',');
      rowHtml += `<td><input type="text" data-state="${s}" data-sym="${sym}" value="${current}" placeholder="e.g. q1,q2"></td>`;
    });
    tr.innerHTML = rowHtml;
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  wrap.appendChild(table);
  wrap.querySelectorAll('input').forEach(inp => {
    inp.addEventListener('change', e => {
      const state = e.target.dataset.state, sym = e.target.dataset.sym;
      def.transitions[state] = def.transitions[state] || {};
      def.transitions[state][sym] = e.target.value.split(',').map(x => x.trim()).filter(Boolean);
      onChange();
    });
  });
}

function renderSimTrace(containerId, trace) {
  const wrap = document.getElementById(containerId);
  wrap.innerHTML = trace.map((t, i) =>
    `<div class="fa-trace-step">${i === 0 ? '<b>start</b>' : `read '<b>${t.symbol}</b>' &rarr;`} { ${t.states.join(', ') || '∅'} }</div>`
  ).join('');
}
