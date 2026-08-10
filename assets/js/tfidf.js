// ---------- TF-IDF MODULE ----------

const TFIDF_DOCS_DEFAULT = [
  'the cat sat on the mat',
  'the dog sat on the log',
  'cats and dogs are pets',
  'the mat was on the floor near the log'
];
const TFIDF_STATE = { docs: [...TFIDF_DOCS_DEFAULT], selected: 0 };

function tfidfTokenize(text) { return (text.toLowerCase().match(/[a-z0-9']+/g) || []); }

function tfidfCompute() {
  const s = TFIDF_STATE;
  const tokenizedDocs = s.docs.map(tfidfTokenize);
  const N = tokenizedDocs.length;
  const df = {};
  tokenizedDocs.forEach(tokens => { new Set(tokens).forEach(t => { df[t] = (df[t] || 0) + 1; }); });
  const docTokens = tokenizedDocs[s.selected] || [];
  const tf = {};
  docTokens.forEach(t => { tf[t] = (tf[t] || 0) + 1; });
  const total = docTokens.length || 1;
  const rows = Object.keys(tf).map(t => {
    const tfVal = tf[t] / total;
    const idfVal = Math.log(N / (df[t] || 1));
    return { term: t, tf: tfVal, df: df[t], idf: idfVal, tfidf: tfVal * idfVal };
  }).sort((a, b) => b.tfidf - a.tfidf);
  return { rows, N };
}

function tfidfRender() {
  const { rows, N } = tfidfCompute();
  document.getElementById('tfidfDocCount').textContent = N;
  document.getElementById('tfidfTableBody').innerHTML = rows.map(r =>
    `<tr><td class="st-label">${r.term}</td><td>${r.tf.toFixed(3)}</td><td>${r.df}</td><td>${r.idf.toFixed(3)}</td><td><b>${r.tfidf.toFixed(4)}</b></td></tr>`
  ).join('');
}

function tfidfRenderDocs() {
  const wrap = document.getElementById('tfidfDocsWrap');
  wrap.innerHTML = '';
  TFIDF_STATE.docs.forEach((d, i) => {
    const div = document.createElement('div');
    div.className = 'field';
    div.innerHTML = `<label>Document ${i + 1}${i === TFIDF_STATE.selected ? ' — selected' : ''}</label><textarea data-idx="${i}" rows="2">${d}</textarea>`;
    wrap.appendChild(div);
  });
  wrap.querySelectorAll('textarea').forEach(ta => {
    ta.addEventListener('input', e => {
      TFIDF_STATE.docs[parseInt(e.target.dataset.idx)] = e.target.value;
      tfidfRender();
    });
  });
}

function initTfidfModule() {
  tfidfRenderDocs();
  const select = document.getElementById('tfidfDocSelect');
  TFIDF_STATE.docs.forEach((d, i) => {
    const opt = document.createElement('option');
    opt.value = i; opt.textContent = 'Document ' + (i + 1);
    select.appendChild(opt);
  });
  select.addEventListener('change', e => { TFIDF_STATE.selected = parseInt(e.target.value); tfidfRenderDocs(); tfidfRender(); });
  tfidfRender();
}
