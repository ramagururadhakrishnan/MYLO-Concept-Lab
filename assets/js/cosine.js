// ---------- COSINE SIMILARITY MODULE ----------

const COSINE_STATE = { textA: 'the cat sat on the mat', textB: 'the dog sat on the log' };

function cosineTokenize(text) { return (text.toLowerCase().match(/[a-z0-9']+/g) || []); }
function cosineTermFreq(tokens) {
  const freq = {};
  tokens.forEach(t => { freq[t] = (freq[t] || 0) + 1; });
  return freq;
}
function cosineCompute() {
  const s = COSINE_STATE;
  const freqA = cosineTermFreq(cosineTokenize(s.textA));
  const freqB = cosineTermFreq(cosineTokenize(s.textB));
  const vocab = [...new Set([...Object.keys(freqA), ...Object.keys(freqB)])].sort();
  const vecA = vocab.map(t => freqA[t] || 0);
  const vecB = vocab.map(t => freqB[t] || 0);
  let dot = 0, magA = 0, magB = 0;
  vocab.forEach((t, i) => { dot += vecA[i] * vecB[i]; magA += vecA[i] ** 2; magB += vecB[i] ** 2; });
  magA = Math.sqrt(magA); magB = Math.sqrt(magB);
  const cosine = (magA * magB) ? dot / (magA * magB) : 0;
  return { vocab, vecA, vecB, dot, magA, magB, cosine };
}
function cosineRender() {
  const c = cosineCompute();
  document.getElementById('cosineDot').textContent = c.dot;
  document.getElementById('cosineMagA').textContent = c.magA.toFixed(3);
  document.getElementById('cosineMagB').textContent = c.magB.toFixed(3);
  document.getElementById('cosineResult').textContent = c.cosine.toFixed(4);
  document.getElementById('cosineTableBody').innerHTML = c.vocab.map((t, i) =>
    `<tr><td class="st-label">${t}</td><td>${c.vecA[i]}</td><td>${c.vecB[i]}</td><td>${c.vecA[i] * c.vecB[i]}</td></tr>`
  ).join('');
}
function initCosineModule() {
  document.getElementById('cosineTextA').value = COSINE_STATE.textA;
  document.getElementById('cosineTextB').value = COSINE_STATE.textB;
  document.getElementById('cosineTextA').addEventListener('input', e => { COSINE_STATE.textA = e.target.value; cosineRender(); });
  document.getElementById('cosineTextB').addEventListener('input', e => { COSINE_STATE.textB = e.target.value; cosineRender(); });
  cosineRender();
}
