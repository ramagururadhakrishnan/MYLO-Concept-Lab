// ---------- TINY BIGRAM LANGUAGE MODEL ----------

const BIGRAM_STATE = {
  text: 'the cat sat on the mat the cat ate the fish the dog sat on the mat the dog ate the bone the cat and the dog sat on the mat',
  model: null
};

function bigramTokenize(text) { return (text.toLowerCase().match(/[a-z0-9']+/g) || []); }

function bigramBuildModel(text) {
  const tokens = bigramTokenize(text);
  const model = {};
  for (let i = 0; i < tokens.length - 1; i++) {
    const w1 = tokens[i], w2 = tokens[i + 1];
    model[w1] = model[w1] || {};
    model[w1][w2] = (model[w1][w2] || 0) + 1;
  }
  return model;
}

function bigramProbs(model, word) {
  const counts = model[word];
  if (!counts) return [];
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  return Object.entries(counts).map(([w, c]) => ({ word: w, count: c, prob: c / total })).sort((a, b) => b.prob - a.prob);
}

function bigramSample(probs) {
  const r = Math.random();
  let acc = 0;
  for (const p of probs) { acc += p.prob; if (r <= acc) return p.word; }
  return probs.length ? probs[probs.length - 1].word : null;
}

function bigramRenderTable() {
  const seed = document.getElementById('bigramSeed').value.toLowerCase().trim();
  const probs = bigramProbs(BIGRAM_STATE.model, seed);
  const tbody = document.getElementById('bigramTableBody');
  tbody.innerHTML = probs.length
    ? probs.map(p => `<tr><td class="st-label">${p.word}</td><td>${p.count}</td><td>${(p.prob * 100).toFixed(1)}%</td></tr>`).join('')
    : `<tr><td colspan="3" class="note">"${seed}" never appears (or is never followed by another word) in the training text.</td></tr>`;
}

function bigramGenerate() {
  const seed = document.getElementById('bigramSeed').value.toLowerCase().trim();
  const len = parseInt(document.getElementById('bigramLen').value);
  let current = seed;
  const out = [current];
  for (let i = 0; i < len; i++) {
    const probs = bigramProbs(BIGRAM_STATE.model, current);
    if (!probs.length) break;
    current = bigramSample(probs);
    out.push(current);
  }
  document.getElementById('bigramGenerated').textContent = out.join(' ');
}

function bigramRender() {
  BIGRAM_STATE.model = bigramBuildModel(BIGRAM_STATE.text);
  document.getElementById('bigramVocabSize').textContent = Object.keys(BIGRAM_STATE.model).length;
  bigramRenderTable();
}

function initBigramModule() {
  document.getElementById('bigramText').value = BIGRAM_STATE.text;
  document.getElementById('bigramText').addEventListener('input', e => { BIGRAM_STATE.text = e.target.value; bigramRender(); });
  document.getElementById('bigramSeed').addEventListener('input', bigramRenderTable);
  document.getElementById('bigramGenerateBtn').addEventListener('click', bigramGenerate);
  document.getElementById('bigramLen').addEventListener('input', e => { document.getElementById('bigramLenVal').textContent = e.target.value; });
  bigramRender();
}
