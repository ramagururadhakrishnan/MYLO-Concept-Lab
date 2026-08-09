// ---------- PROPERTIES OF REGULAR LANGUAGES (CLOSURE) ----------

const PROP_A = { states: ['a0', 'a1'], alphabet: ['0', '1'], transitions: { a0: { '0': ['a0'], '1': ['a1'] }, a1: { '0': ['a1'], '1': ['a0'] } }, start: 'a0', accept: ['a1'], label: 'A: odd number of 1s' };
const PROP_B = { states: ['b0', 'b1'], alphabet: ['0', '1'], transitions: { b0: { '0': ['b1'], '1': ['b0'] }, b1: { '0': ['b0'], '1': ['b1'] } }, start: 'b0', accept: ['b1'], label: 'B: ends with a 0' };

function propRun() {
  const op = document.getElementById('propOp').value;
  renderFADiagram('propASvg', PROP_A);
  renderFADiagram('propBSvg', PROP_B);

  let result, resultLabel;
  if (op === 'union') { result = faProduct(PROP_A, PROP_B, ['0', '1'], 'union'); resultLabel = 'A ∪ B'; }
  else if (op === 'intersection') { result = faProduct(PROP_A, PROP_B, ['0', '1'], 'intersection'); resultLabel = 'A ∩ B'; }
  else { result = faComplement(PROP_A, ['0', '1']); resultLabel = 'complement of A'; }

  renderFADiagram('propResultSvg', result);
  document.getElementById('propResultLabel').textContent = resultLabel;
  document.getElementById('propResultCount').textContent = result.states.length;

  const testStr = document.getElementById('propTestInput').value;
  const rA = faSimulate(PROP_A, testStr).accepted;
  const rB = faSimulate(PROP_B, testStr).accepted;
  const rResult = faSimulate(result, testStr).accepted;
  document.getElementById('propTestOut').innerHTML =
    `A ${rA ? 'accepts' : 'rejects'} "${testStr}" &nbsp;·&nbsp; B ${rB ? 'accepts' : 'rejects'} "${testStr}" &nbsp;·&nbsp; <b>${resultLabel} ${rResult ? 'accepts' : 'rejects'}</b> "${testStr}"`;
}

function initPropertiesModule() {
  document.getElementById('propOp').addEventListener('change', propRun);
  document.getElementById('propRunBtn').addEventListener('click', propRun);
  document.getElementById('propTestInput').addEventListener('keydown', e => { if (e.key === 'Enter') propRun(); });
  document.getElementById('propTestInput').value = '110';
  propRun();
}
