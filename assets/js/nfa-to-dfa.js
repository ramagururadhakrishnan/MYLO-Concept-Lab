// ---------- NFA to DFA EQUIVALENCE (SUBSET CONSTRUCTION) ----------

function n2dRun() {
  const nfaDef = NFA_CURRENT; // reuse whatever is currently loaded in the NFA module
  renderFADiagram('n2dNfaSvg', nfaDef);
  const { def: dfaDef, steps } = faSubsetConstruction(nfaDef);
  renderFADiagram('n2dDfaSvg', dfaDef);

  document.getElementById('n2dDfaStateCount').textContent = dfaDef.states.length;
  document.getElementById('n2dNfaStateCount').textContent = nfaDef.states.length;

  const stepsWrap = document.getElementById('n2dSteps');
  stepsWrap.innerHTML = steps.map(step => {
    const moves = step.moves.map(m => `on '${m.sym}' &rarr; ${m.to}`).join(' &nbsp;·&nbsp; ');
    return `<div class="fa-trace-step"><b>${step.from}</b> = { ${nfaDef.states.filter(s => step.from.split(',').includes(s)).length ? step.from.split(',').join(', ') : '∅'} } &nbsp; ${moves}</div>`;
  }).join('');

  const testInput = document.getElementById('n2dTestInput').value;
  if (testInput !== undefined) {
    const nfaResult = faSimulate(nfaDef, testInput);
    const dfaResult = faSimulate(dfaDef, testInput);
    document.getElementById('n2dAgree').textContent = nfaResult.accepted === dfaResult.accepted
      ? `Both ${nfaResult.accepted ? 'ACCEPT' : 'REJECT'} "${testInput}" — equivalent, as expected.`
      : `Mismatch on "${testInput}" — this would indicate a bug in the construction.`;
  }
}

function initN2DModule() {
  document.getElementById('n2dRunBtn').addEventListener('click', n2dRun);
  document.getElementById('n2dTestInput').addEventListener('keydown', e => { if (e.key === 'Enter') n2dRun(); });
  n2dRun();
}
