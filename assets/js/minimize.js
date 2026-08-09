// ---------- DFA MINIMIZATION MODULE ----------

const MIN_PRESETS = {
  redundant: {
    label: 'DFA with redundant states',
    def: {
      states: ['A', 'B', 'C', 'D', 'E', 'F'], alphabet: ['0', '1'],
      transitions: {
        A: { '0': ['B'], '1': ['C'] }, B: { '0': ['A'], '1': ['D'] }, C: { '0': ['E'], '1': ['F'] },
        D: { '0': ['E'], '1': ['F'] }, E: { '0': ['E'], '1': ['F'] }, F: { '0': ['F'], '1': ['F'] }
      },
      start: 'A', accept: ['C', 'D', 'E']
    }
  }
};

let MIN_CURRENT = JSON.parse(JSON.stringify(MIN_PRESETS.redundant.def));

function minRun() {
  renderFADiagram('minOrigSvg', MIN_CURRENT);
  const { minimized, rounds } = faMinimizeDFA(MIN_CURRENT);
  renderFADiagram('minResultSvg', minimized);

  document.getElementById('minOrigCount').textContent = MIN_CURRENT.states.length;
  document.getElementById('minResultCount').textContent = minimized.states.length;

  const wrap = document.getElementById('minRounds');
  wrap.innerHTML = rounds.map((groups, i) =>
    `<div class="fa-trace-step"><b>Round ${i}</b>: ${groups.map(g => '{' + g.join(',') + '}').join('  ')}</div>`
  ).join('');
}

function minLoadPreset(key) {
  MIN_CURRENT = JSON.parse(JSON.stringify(MIN_PRESETS[key].def));
  renderDFATransitionTable('minTableWrap', MIN_CURRENT, () => {});
  minRun();
}

function initMinimizeModule() {
  const select = document.getElementById('minPreset');
  Object.keys(MIN_PRESETS).forEach(k => {
    const opt = document.createElement('option');
    opt.value = k; opt.textContent = MIN_PRESETS[k].label;
    select.appendChild(opt);
  });
  select.addEventListener('change', e => minLoadPreset(e.target.value));
  document.getElementById('minRunBtn').addEventListener('click', minRun);
  minLoadPreset('redundant');
}
