// ---------- REGULAR EXPRESSIONS MODULE ----------

function regexRenderAST(node) {
  if (!node) return '';
  const label = { char: `'${node.ch}'`, epsilon: 'ε', concat: '·', union: '|', star: '*', plus: '+', opt: '?' }[node.type];
  if (node.type === 'char' || node.type === 'epsilon') return `<li>${label}</li>`;
  if (node.type === 'concat' || node.type === 'union') return `<li>${label}<ul>${regexRenderAST(node.left)}${regexRenderAST(node.right)}</ul></li>`;
  return `<li>${label}<ul>${regexRenderAST(node.child)}</ul></li>`;
}

function regexRun() {
  const pattern = document.getElementById('regexPattern').value;
  const testStr = document.getElementById('regexTestInput').value;
  const statusBox = document.getElementById('regexStatus');
  try {
    const { def, ast } = faRegexToNFA(pattern);
    statusBox.textContent = '';
    document.getElementById('regexAST').innerHTML = '<ul>' + regexRenderAST(ast) + '</ul>';
    document.getElementById('regexStateCount').textContent = def.states.length;
    renderFADiagram('regexSvg', def);

    const result = faSimulate(def, testStr);
    const resultBox = document.getElementById('regexResult');
    resultBox.textContent = result.accepted ? 'MATCH' : 'NO MATCH';
    resultBox.className = 'fa-result ' + (result.accepted ? 'accept' : 'reject');
    renderFADiagram('regexSvg', def, { current: new Set(result.finalStates) });
  } catch (err) {
    statusBox.textContent = 'Parse error: ' + err.message;
    document.getElementById('regexAST').innerHTML = '';
    document.getElementById('regexResult').textContent = '';
    document.getElementById('regexResult').className = 'fa-result';
  }
}

function initRegexModule() {
  document.getElementById('regexRunBtn').addEventListener('click', regexRun);
  document.getElementById('regexTestInput').addEventListener('keydown', e => { if (e.key === 'Enter') regexRun(); });
  document.getElementById('regexPattern').value = '(a|b)*abb';
  document.getElementById('regexTestInput').value = 'aababb';
  regexRun();
}
