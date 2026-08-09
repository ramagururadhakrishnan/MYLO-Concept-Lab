// ---------- DMA TRANSFER VISUALIZER ----------

const DMA_STATE = { srcBase: 0x40011004, dstBase: 0x20000000, count: 8, itemSize: 1, mode: 'normal', srcIncr: false, dstIncr: true, current: 0, done: false };

function dmaAddr(base, index, incr) {
  return incr ? (base + index * DMA_STATE.itemSize) >>> 0 : base;
}

function dmaRenderCells(containerId, count, activeIdx, doneUpTo) {
  const wrap = document.getElementById(containerId);
  wrap.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const cell = document.createElement('div');
    cell.className = 'dma-cell' + (i === activeIdx ? ' active' : (i < doneUpTo ? ' done' : ''));
    cell.textContent = i;
    wrap.appendChild(cell);
  }
}

function dmaRender() {
  const s = DMA_STATE;
  document.getElementById('dmaNdtr').textContent = Math.max(0, s.count - s.current);
  document.getElementById('dmaCurSrc').textContent = toHex(dmaAddr(s.srcBase, s.current, s.srcIncr));
  document.getElementById('dmaCurDst').textContent = toHex(dmaAddr(s.dstBase, s.current, s.dstIncr));
  document.getElementById('dmaStatus').textContent = s.done ? (s.mode === 'circular' ? 'Circular — wraps back to the start automatically.' : 'Transfer complete.') : `Transferring item ${s.current + 1} of ${s.count}…`;

  dmaRenderCells('dmaSrcCells', s.count, s.done ? -1 : s.current, s.done ? s.count : s.current);
  dmaRenderCells('dmaDstCells', s.count, s.done ? -1 : s.current, s.done ? s.count : s.current);

  document.getElementById('dmaStepBtn').disabled = s.done && s.mode !== 'circular';
}

function dmaStep() {
  const s = DMA_STATE;
  if (s.done && s.mode === 'circular') { s.current = 0; s.done = false; }
  if (s.done) return;
  s.current++;
  if (s.current >= s.count) { s.current = s.count; s.done = true; }
  dmaRender();
}

function dmaReset() {
  DMA_STATE.current = 0;
  DMA_STATE.done = false;
  dmaRender();
}

function initDMAModule() {
  document.getElementById('dmaSrcBaseInput').addEventListener('change', e => { const v = parseInt(e.target.value, 16); if (!isNaN(v)) DMA_STATE.srcBase = v >>> 0; dmaRender(); });
  document.getElementById('dmaDstBaseInput').addEventListener('change', e => { const v = parseInt(e.target.value, 16); if (!isNaN(v)) DMA_STATE.dstBase = v >>> 0; dmaRender(); });
  document.getElementById('dmaCount').addEventListener('input', e => { DMA_STATE.count = parseInt(e.target.value); document.getElementById('dmaCountVal').textContent = DMA_STATE.count; dmaReset(); });
  document.getElementById('dmaItemSize').addEventListener('change', e => { DMA_STATE.itemSize = parseInt(e.target.value); dmaRender(); });
  document.getElementById('dmaMode').addEventListener('change', e => { DMA_STATE.mode = e.target.value; dmaRender(); });
  document.getElementById('dmaSrcIncr').addEventListener('change', e => { DMA_STATE.srcIncr = e.target.checked; dmaRender(); });
  document.getElementById('dmaDstIncr').addEventListener('change', e => { DMA_STATE.dstIncr = e.target.checked; dmaRender(); });
  document.getElementById('dmaStepBtn').addEventListener('click', dmaStep);
  document.getElementById('dmaResetBtn').addEventListener('click', dmaReset);
  document.getElementById('dmaSrcBaseInput').value = toHex(DMA_STATE.srcBase);
  document.getElementById('dmaDstBaseInput').value = toHex(DMA_STATE.dstBase);
  dmaRender();
}
