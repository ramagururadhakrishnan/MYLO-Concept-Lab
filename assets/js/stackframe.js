// ---------- CORTEX-M4 EXCEPTION STACK FRAME VISUALIZER ----------

const STACK_STATE = {
  sp: 0x20001000,
  regs: { R0: 0x00000001, R1: 0x00000002, R2: 0x00000003, R3: 0x00000004, R12: 0x0000000C, LR: 0xFFFFFFF9, PC: 0x08000420, xPSR: 0x61000000 },
  entered: false
};
// Stacked from highest address to lowest: xPSR, PC, LR, R12, R3, R2, R1, R0
const STACK_ORDER = ['xPSR', 'PC', 'LR', 'R12', 'R3', 'R2', 'R1', 'R0'];

function stackRender() {
  const s = STACK_STATE;
  document.getElementById('stackSpVal').textContent = toHex(s.sp);
  document.getElementById('stackEnterBtn').disabled = s.entered;
  document.getElementById('stackExitBtn').disabled = !s.entered;

  ['R0', 'R1', 'R2', 'R3', 'R12', 'LR', 'PC', 'xPSR'].forEach(name => {
    const input = document.getElementById('stackReg' + name);
    if (input && document.activeElement !== input) input.value = toHex(s.regs[name]);
  });

  const wrap = document.getElementById('stackFrameWrap');
  wrap.innerHTML = '';
  if (s.entered) {
    const baseSp = s.sp;
    STACK_ORDER.forEach((name, i) => {
      const addr = baseSp + (7 - i) * 4;
      const row = document.createElement('div');
      row.className = 'stack-row pushed';
      row.innerHTML = `<span class="stack-addr">${toHex(addr)}</span><span class="stack-name">${name}</span><span class="stack-val">${toHex(s.regs[name])}</span>`;
      wrap.appendChild(row);
    });
    const spRow = document.createElement('div');
    spRow.className = 'stack-row stack-sp-marker';
    spRow.innerHTML = `<span class="stack-addr">${toHex(baseSp)}</span><span class="stack-name">&larr; SP (MSP) points here</span><span class="stack-val"></span>`;
    wrap.appendChild(spRow);
  } else {
    const row = document.createElement('div');
    row.className = 'stack-row stack-sp-marker';
    row.innerHTML = `<span class="stack-addr">${toHex(s.sp)}</span><span class="stack-name">&larr; SP (MSP) points here — nothing stacked yet</span><span class="stack-val"></span>`;
    wrap.appendChild(row);
  }
}

function initStackFrameModule() {
  ['R0', 'R1', 'R2', 'R3', 'R12', 'LR', 'PC', 'xPSR'].forEach(name => {
    document.getElementById('stackReg' + name).addEventListener('change', e => {
      const v = parseInt(e.target.value, 16);
      if (!isNaN(v)) STACK_STATE.regs[name] = v >>> 0;
      stackRender();
    });
  });
  document.getElementById('stackSpInput').addEventListener('change', e => {
    const v = parseInt(e.target.value, 16);
    if (!isNaN(v)) STACK_STATE.sp = v >>> 0;
    stackRender();
  });
  document.getElementById('stackEnterBtn').addEventListener('click', () => {
    STACK_STATE.sp = (STACK_STATE.sp - 32) >>> 0;
    STACK_STATE.entered = true;
    stackRender();
  });
  document.getElementById('stackExitBtn').addEventListener('click', () => {
    STACK_STATE.sp = (STACK_STATE.sp + 32) >>> 0;
    STACK_STATE.entered = false;
    stackRender();
  });
  document.getElementById('stackSpInput').value = toHex(STACK_STATE.sp);
  stackRender();
}
