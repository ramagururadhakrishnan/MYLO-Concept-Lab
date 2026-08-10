// ---------- N-GRAM OVERLAP MODULE ----------

const NGRAM_STATE = { textA: 'the cat sat on the mat', textB: 'the cat sat on the rug', n: 2, mode: 'word' };

function ngramTokenize(text, mode) {
  if (mode === 'char') return text.replace(/\s+/g, '').toLowerCase().split('');
  return (text.toLowerCase().match(/[a-z0-9']+/g) || []);
}
function ngramBuild(tokens, n, sep) {
  const grams = [];
  for (let i = 0; i + n <= tokens.length; i++) grams.push(tokens.slice(i, i + n).join(sep));
  return grams;
}
function ngramCompute() {
  const s = NGRAM_STATE;
  const sep = s.mode === 'char' ? '' : ' ';
  const gramsA = ngramBuild(ngramTokenize(s.textA, s.mode), s.n, sep);
  const gramsB = ngramBuild(ngramTokenize(s.textB, s.mode), s.n, sep);
  const setA = new Set(gramsA), setB = new Set(gramsB);
  const intersection = new Set([...setA].filter(g => setB.has(g)));
  const union = new Set([...setA, ...setB]);
  const jaccard = union.size ? intersection.size / union.size : 0;
  const overlapCoef = Math.min(setA.size, setB.size) ? intersection.size / Math.min(setA.size, setB.size) : 0;
  return { gramsA, gramsB, setA, setB, intersection, jaccard, overlapCoef };
}
function ngramRenderList(containerId, grams, sharedSet) {
  const wrap = document.getElementById(containerId);
  wrap.innerHTML = '';
  grams.forEach(g => {
    const span = document.createElement('span');
    span.className = 'tok ' + (sharedSet.has(g) ? 'unique' : 'repeat');
    span.textContent = g;
    wrap.appendChild(span);
  });
}
function ngramRender() {
  const c = ngramCompute();
  document.getElementById('ngramJaccard').textContent = c.jaccard.toFixed(3);
  document.getElementById('ngramOverlap').textContent = c.overlapCoef.toFixed(3);
  document.getElementById('ngramCountA').textContent = c.setA.size;
  document.getElementById('ngramCountB').textContent = c.setB.size;
  document.getElementById('ngramShared').textContent = c.intersection.size;
  ngramRenderList('ngramListA', c.gramsA, c.intersection);
  ngramRenderList('ngramListB', c.gramsB, c.intersection);
}
function initNgramModule() {
  document.getElementById('ngramTextA').value = NGRAM_STATE.textA;
  document.getElementById('ngramTextB').value = NGRAM_STATE.textB;
  document.getElementById('ngramTextA').addEventListener('input', e => { NGRAM_STATE.textA = e.target.value; ngramRender(); });
  document.getElementById('ngramTextB').addEventListener('input', e => { NGRAM_STATE.textB = e.target.value; ngramRender(); });
  document.getElementById('ngramN').addEventListener('input', e => { NGRAM_STATE.n = parseInt(e.target.value); document.getElementById('ngramNVal').textContent = NGRAM_STATE.n; ngramRender(); });
  document.getElementById('ngramMode').addEventListener('change', e => { NGRAM_STATE.mode = e.target.value; ngramRender(); });
  ngramRender();
}
