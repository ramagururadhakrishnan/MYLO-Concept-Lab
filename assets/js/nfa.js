// ---------- NFA MODULE ----------

const NFA_PRESETS = {
  contains01: {
    label: 'Contains "01" as a substring',
    def: { states: ['q0', 'q1', 'q2'], alphabet: ['0', '1'], transitions: { q0: { '0': ['q0', 'q1'], '1': ['q0'] }, q1: { '1': ['q2'] }, q2: { '0': ['q2'], '1': ['q2'] } }, start: 'q0', accept: ['q2'] }
  },
  epsilonExample: {
    label: '(a|b)*abb — epsilon-NFA',
    def: {
      states: ['q0', 'q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10'],
      alphabet: ['a', 'b', 'ε'],
      transitions: {
        q0: { 'ε': ['q1', 'q7'] },
        q1: { 'ε': ['q2', 'q4'] },
        q2: { 'a': ['q3'] },
        q3: { 'ε': ['q6'] },
        q4: { 'b': ['q5'] },
        q5: { 'ε': ['q6'] },
        q6: { 'ε': ['q1', 'q7'] },
        q7: { 'a': ['q8'] },
        q8: { 'b': ['q9'] },
        q9: { 'b': ['q10'] }
      },
      start: 'q0', accept: ['q10']
    }
  }
};

let NFA_CURRENT = JSON.parse(JSON.stringify(NFA_PRESETS.contains01.def));

function nfaRedrawDiagram(currentSet) {
  renderFADiagram('nfaSvg', NFA_CURRENT, { current: currentSet });
}

function nfaRunSim() {
  const input = document.getElementById('nfaInput').value;
  const result = faSimulate(NFA_CURRENT, input);
  renderSimTrace('nfaTrace', result.trace);
  const resultBox = document.getElementById('nfaResult');
  resultBox.textContent = result.accepted ? 'ACCEPTED' : 'REJECTED';
  resultBox.className = 'fa-result ' + (result.accepted ? 'accept' : 'reject');
  document.getElementById('nfaCurrentStates').textContent = '{ ' + result.finalStates.join(', ') + ' }';
  nfaRedrawDiagram(new Set(result.finalStates));
}

function nfaLoadPreset(key) {
  NFA_CURRENT = JSON.parse(JSON.stringify(NFA_PRESETS[key].def));
  renderNFATransitionTable('nfaTableWrap', NFA_CURRENT, () => nfaRedrawDiagram());
  document.getElementById('nfaResult').textContent = '';
  document.getElementById('nfaResult').className = 'fa-result';
  document.getElementById('nfaTrace').innerHTML = '';
  document.getElementById('nfaCurrentStates').textContent = '—';
  nfaRedrawDiagram();
}

function initNFAModule() {
  const select = document.getElementById('nfaPreset');
  Object.keys(NFA_PRESETS).forEach(k => {
    const opt = document.createElement('option');
    opt.value = k; opt.textContent = NFA_PRESETS[k].label;
    select.appendChild(opt);
  });
  select.addEventListener('change', e => nfaLoadPreset(e.target.value));
  document.getElementById('nfaRunBtn').addEventListener('click', nfaRunSim);
  document.getElementById('nfaInput').addEventListener('keydown', e => { if (e.key === 'Enter') nfaRunSim(); });
  nfaLoadPreset('contains01');
}
