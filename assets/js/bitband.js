// ---------- BIT-BANDING VISUALIZER ----------

const BITBAND_REGIONS = {
  sram: { base: 0x20000000, alias: 0x22000000, label: 'SRAM bit-band region' },
  periph: { base: 0x40000000, alias: 0x42000000, label: 'Peripheral bit-band region' }
};
const BITBAND_STATE = { region: 'periph', addr: 0x40020014, bit: 5 }; // GPIOA_ODR example

function bitbandCompute() {
  const r = BITBAND_REGIONS[BITBAND_STATE.region];
  const byteOffset = (BITBAND_STATE.addr - r.base) >>> 0;
  const aliasAddr = (r.alias + byteOffset * 32 + BITBAND_STATE.bit * 4) >>> 0;
  return { r, byteOffset, aliasAddr };
}

function bitbandRender() {
  const { r, byteOffset, aliasAddr } = bitbandCompute();
  document.getElementById('bitbandBase').textContent = toHex(r.base);
  document.getElementById('bitbandAliasBase').textContent = toHex(r.alias);
  document.getElementById('bitbandOffset').textContent = toHex(byteOffset);
  document.getElementById('bitbandAliasAddr').textContent = toHex(aliasAddr);
  document.getElementById('bitbandValid').textContent = byteOffset >= 0 && byteOffset < 0x100000 ? 'Valid — within the 1 MB bit-band region.' : 'Out of range — this address is outside the 1 MB bit-band window for this region.';
}

function initBitbandModule() {
  document.getElementById('bitbandRegion').addEventListener('change', e => {
    BITBAND_STATE.region = e.target.value;
    bitbandRender();
  });
  document.getElementById('bitbandAddrInput').addEventListener('change', e => {
    const v = parseInt(e.target.value, 16);
    if (!isNaN(v)) BITBAND_STATE.addr = v >>> 0;
    bitbandRender();
  });
  document.getElementById('bitbandBitInput').addEventListener('input', e => {
    BITBAND_STATE.bit = Math.min(31, Math.max(0, parseInt(e.target.value) || 0));
    document.getElementById('bitbandBitVal').textContent = BITBAND_STATE.bit;
    bitbandRender();
  });
  document.getElementById('bitbandAddrInput').value = toHex(BITBAND_STATE.addr);
  bitbandRender();
}
