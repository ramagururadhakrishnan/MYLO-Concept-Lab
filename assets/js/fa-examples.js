// ---------- DESIGNING FA FOR REAL-WORLD PROBLEMS ----------

const FA_EXAMPLES = {
  vending: {
    label: 'Vending machine — 15¢ item, accepts nickels (N) and dimes (D)',
    blurb: 'Each state tracks how much money has been inserted so far (capped at 15, since anything ≥15 dispenses the item). From "10" a nickel takes you to "15" (done) and a dime overshoots straight to "15" too (change is a separate concern).',
    def: {
      states: ['0¢', '5¢', '10¢', '15¢'], alphabet: ['N', 'D'],
      transitions: { '0¢': { N: ['5¢'], D: ['10¢'] }, '5¢': { N: ['10¢'], D: ['15¢'] }, '10¢': { N: ['15¢'], D: ['15¢'] }, '15¢': { N: ['15¢'], D: ['15¢'] } },
      start: '0¢', accept: ['15¢']
    }
  },
  identifier: {
    label: 'Valid identifier — starts with a letter, then letters/digits',
    blurb: 'Alphabet simplified to L (letter) and D (digit) for clarity. The machine rejects anything starting with a digit, and stays accepting for any length after the first letter.',
    def: {
      states: ['start', 'valid', 'invalid'], alphabet: ['L', 'D'],
      transitions: { start: { L: ['valid'], D: ['invalid'] }, valid: { L: ['valid'], D: ['valid'] }, invalid: { L: ['invalid'], D: ['invalid'] } },
      start: 'start', accept: ['valid']
    }
  },
  divisibleBy3: {
    label: 'Binary number divisible by 3',
    blurb: 'Each state is the running remainder mod 3 as bits arrive MSB-first. Reading a bit shifts the remainder left (×2) and adds the bit, all mod 3 — a real technique used in hardware checksum/CRC logic.',
    def: {
      states: ['rem0', 'rem1', 'rem2'], alphabet: ['0', '1'],
      transitions: { rem0: { '0': ['rem0'], '1': ['rem1'] }, rem1: { '0': ['rem2'], '1': ['rem0'] }, rem2: { '0': ['rem1'], '1': ['rem2'] } },
      start: 'rem0', accept: ['rem0']
    }
  },
  trafficLight: {
    label: 'Traffic light controller (on a "tick" input)',
    blurb: 'A simple Moore-style cycle: every tick advances to the next light. There\'s only one input symbol here ("tick"), which is common for controller FSMs — the interesting part is the states and transitions, not a rich alphabet.',
    def: {
      states: ['Red', 'Green', 'Yellow'], alphabet: ['tick'],
      transitions: { Red: { tick: ['Green'] }, Green: { tick: ['Yellow'] }, Yellow: { tick: ['Red'] } },
      start: 'Red', accept: ['Red', 'Green', 'Yellow']
    }
  },
  passwordAB: {
    label: 'Password screening — must contain "ab" somewhere',
    blurb: 'A minimal-state pattern-matcher: q1 remembers "I just saw an a", and once "ab" is seen the machine locks into the accepting trap state q2 regardless of what follows.',
    def: {
      states: ['q0', 'q1', 'q2'], alphabet: ['a', 'b'],
      transitions: { q0: { a: ['q1'], b: ['q0'] }, q1: { a: ['q1'], b: ['q2'] }, q2: { a: ['q2'], b: ['q2'] } },
      start: 'q0', accept: ['q2']
    }
  }
};

function faExRun() {
  const key = document.getElementById('faExPreset').value;
  const ex = FA_EXAMPLES[key];
  document.getElementById('faExBlurb').textContent = ex.blurb;
  renderDFATransitionTable('faExTableWrap', ex.def, () => renderFADiagram('faExSvg', ex.def));
  renderFADiagram('faExSvg', ex.def);
  document.getElementById('faExResult').textContent = '';
  document.getElementById('faExResult').className = 'fa-result';
  document.getElementById('faExTrace').innerHTML = '';
}

function faExRunSim() {
  const key = document.getElementById('faExPreset').value;
  const ex = FA_EXAMPLES[key];
  const input = document.getElementById('faExInput').value;
  const tokens = ex.def.alphabet.length > 2 || ex.def.alphabet.some(a => a.length > 1)
    ? input.split(',').map(s => s.trim()).filter(Boolean)
    : input.split('');
  const result = faSimulate(ex.def, tokens);
  renderSimTrace('faExTrace', result.trace);
  const resultBox = document.getElementById('faExResult');
  resultBox.textContent = result.accepted ? 'ACCEPTED' : 'REJECTED';
  resultBox.className = 'fa-result ' + (result.accepted ? 'accept' : 'reject');
  renderFADiagram('faExSvg', ex.def, { current: new Set(result.finalStates) });
}

function initFAExamplesModule() {
  const select = document.getElementById('faExPreset');
  Object.keys(FA_EXAMPLES).forEach(k => {
    const opt = document.createElement('option');
    opt.value = k; opt.textContent = FA_EXAMPLES[k].label;
    select.appendChild(opt);
  });
  select.addEventListener('change', faExRun);
  document.getElementById('faExRunBtn').addEventListener('click', faExRunSim);
  document.getElementById('faExInput').addEventListener('keydown', e => { if (e.key === 'Enter') faExRunSim(); });
  faExRun();
}
