// ---------- DFA MODULE ----------

const DFA_PRESETS = {
  evenOnes: {
    label: 'Even number of 1s (binary strings)',
    def: { states: ['q0', 'q1'], alphabet: ['0', '1'], transitions: { q0: { '0': ['q0'], '1': ['q1'] }, q1: { '0': ['q1'], '1': ['q0'] } }, start: 'q0', accept: ['q0'] }
  },
  endsWith01: {
    label: 'Ends with "01" (binary strings)',
    def: { states: ['q0', 'q1', 'q2'], alphabet: ['0', '1'], transitions: { q0: { '0': ['q1'], '1': ['q0'] }, q1: { '0': ['q1'], '1': ['q2'] }, q2: { '0': ['q1'], '1': ['q0'] } }, start: 'q0', accept: ['q2'] }
  },
  divisibleBy3: {
    label: 'Binary number divisible by 3',
    def: { states: ['r0', 'r1', 'r2'], alphabet: ['0', '1'], transitions: { r0: { '0': ['r0'], '1': ['r1'] }, r1: { '0': ['r2'], '1': ['r0'] }, r2: { '0': ['r1'], '1': ['r2'] } }, start: 'r0', accept: ['r0'] }
  }
};

let DFA_CURRENT = JSON.parse(JSON.stringify(DFA_PRESETS.evenOnes.def));

function dfaRedrawDiagram(currentState) {
  renderFADiagram('dfaSvg', DFA_CURRENT, { current: currentState });
}

function dfaRunSim() {
  const input = document.getElementById('dfaInput').value;
  const result = faSimulate(DFA_CURRENT, input);
  renderSimTrace('dfaTrace', result.trace);
  const resultBox = document.getElementById('dfaResult');
  resultBox.textContent = result.accepted ? 'ACCEPTED' : 'REJECTED';
  resultBox.className = 'fa-result ' + (result.accepted ? 'accept' : 'reject');
  dfaRedrawDiagram(new Set(result.finalStates));
}

function dfaLoadPreset(key) {
  DFA_CURRENT = JSON.parse(JSON.stringify(DFA_PRESETS[key].def));
  renderDFATransitionTable('dfaTableWrap', DFA_CURRENT, () => dfaRedrawDiagram());
  document.getElementById('dfaResult').textContent = '';
  document.getElementById('dfaResult').className = 'fa-result';
  document.getElementById('dfaTrace').innerHTML = '';
  dfaRedrawDiagram();
}

function initDFAModule() {
  const select = document.getElementById('dfaPreset');
  Object.keys(DFA_PRESETS).forEach(k => {
    const opt = document.createElement('option');
    opt.value = k; opt.textContent = DFA_PRESETS[k].label;
    select.appendChild(opt);
  });
  select.addEventListener('change', e => dfaLoadPreset(e.target.value));
  document.getElementById('dfaRunBtn').addEventListener('click', dfaRunSim);
  document.getElementById('dfaInput').addEventListener('keydown', e => { if (e.key === 'Enter') dfaRunSim(); });
  dfaLoadPreset('evenOnes');
}
