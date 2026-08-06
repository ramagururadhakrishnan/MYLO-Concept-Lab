// ---------- TYPE-TOKEN RATIO MODULE ----------
// Tokenizes input text, counts tokens vs. unique types, and renders each
// token tagged as unique or repeated (with an occurrence badge).

function runTTR() {
  const raw = document.getElementById('ttrText').value;
  const tokens = raw.toLowerCase().match(/[a-z0-9']+/g) || [];
  const counts = {};
  tokens.forEach(t => { counts[t] = (counts[t] || 0) + 1; });
  const types = Object.keys(counts);
  const ratio = tokens.length ? types.length / tokens.length : 0;

  document.getElementById('statTokens').textContent = tokens.length;
  document.getElementById('statTypes').textContent = types.length;
  document.getElementById('statRatio').textContent = ratio.toFixed(2);
  document.getElementById('formulaEcho').textContent =
    `${types.length} ÷ ${tokens.length} = ${ratio.toFixed(2)}`;

  const seen = {};
  const field = document.getElementById('tokenField');
  field.innerHTML = '';
  tokens.forEach(tok => {
    seen[tok] = (seen[tok] || 0) + 1;
    const span = document.createElement('span');
    const totalCount = counts[tok];
    span.className = 'tok ' + (totalCount === 1 ? 'unique' : 'repeat');
    span.textContent = tok;
    if (totalCount > 1) {
      const badge = document.createElement('span');
      badge.className = 'count';
      badge.textContent = seen[tok] + '/' + totalCount;
      span.appendChild(badge);
    }
    field.appendChild(span);
  });
}

function initTTRModule() {
  document.getElementById('ttrGo').addEventListener('click', runTTR);
  runTTR();
}
