// ---------- RCC CLOCK TREE SIMULATOR ----------

const RCC_STATE = { source: 8, pllEnabled: true, m: 8, n: 336, p: 4, q: 7, ahb: 1, apb1: 4, apb2: 2 };
const RCC_AHB_OPTS = [1, 2, 4, 8, 16, 64, 128, 256, 512];
const RCC_APB_OPTS = [1, 2, 4, 8, 16];
const RCC_LIMITS = { sysclk: 168, hclk: 168, apb1: 42, apb2: 84, vcoInLo: 1, vcoInHi: 2, vcoOutLo: 100, vcoOutHi: 432 };

function rccCompute() {
  const s = RCC_STATE;
  const vcoIn = s.source / s.m;
  const vcoOut = vcoIn * s.n;
  const pllOut = vcoOut / s.p;
  const sysclk = s.pllEnabled ? pllOut : s.source;
  const hclk = sysclk / s.ahb;
  const pclk1 = hclk / s.apb1;
  const pclk2 = hclk / s.apb2;
  const tim1 = s.apb1 === 1 ? pclk1 : pclk1 * 2;
  const tim2 = s.apb2 === 1 ? pclk2 : pclk2 * 2;
  return { vcoIn, vcoOut, pllOut, sysclk, hclk, pclk1, pclk2, tim1, tim2 };
}

function rccWarn(el, value, limit, label) {
  el.classList.toggle('rcc-bad', value > limit + 1e-6);
  el.title = value > limit ? `Exceeds max ${label} of ${limit} MHz!` : '';
}

function rccRender() {
  const s = RCC_STATE;
  const c = rccCompute();

  document.getElementById('rccMVal').textContent = s.m;
  document.getElementById('rccNVal').textContent = s.n;
  document.getElementById('rccQVal').textContent = s.q;

  const fmt = v => v >= 1 ? v.toFixed(2) : v.toFixed(3);

  document.getElementById('rccSrcOut').textContent = s.source.toFixed(1) + ' MHz';
  document.getElementById('rccVcoIn').textContent = fmt(c.vcoIn) + ' MHz';
  document.getElementById('rccVcoOut').textContent = fmt(c.vcoOut) + ' MHz';
  document.getElementById('rccPllOut').textContent = fmt(c.pllOut) + ' MHz';
  document.getElementById('rccSysclk').textContent = fmt(c.sysclk) + ' MHz';
  document.getElementById('rccHclk').textContent = fmt(c.hclk) + ' MHz';
  document.getElementById('rccPclk1').textContent = fmt(c.pclk1) + ' MHz';
  document.getElementById('rccPclk2').textContent = fmt(c.pclk2) + ' MHz';
  document.getElementById('rccTim1').textContent = fmt(c.tim1) + ' MHz';
  document.getElementById('rccTim2').textContent = fmt(c.tim2) + ' MHz';

  const warnBox = document.getElementById('rccWarnings');
  const warnings = [];
  if (c.sysclk > RCC_LIMITS.sysclk) warnings.push(`SYSCLK ${fmt(c.sysclk)} MHz exceeds the 168 MHz max.`);
  if (c.pclk1 > RCC_LIMITS.apb1) warnings.push(`PCLK1 (APB1) ${fmt(c.pclk1)} MHz exceeds the 42 MHz max.`);
  if (c.pclk2 > RCC_LIMITS.apb2) warnings.push(`PCLK2 (APB2) ${fmt(c.pclk2)} MHz exceeds the 84 MHz max.`);
  if (c.vcoIn < RCC_LIMITS.vcoInLo || c.vcoIn > RCC_LIMITS.vcoInHi) warnings.push(`VCO input ${fmt(c.vcoIn)} MHz is outside the recommended 1–2 MHz range (affects jitter).`);
  if (c.vcoOut < RCC_LIMITS.vcoOutLo || c.vcoOut > RCC_LIMITS.vcoOutHi) warnings.push(`VCO output ${fmt(c.vcoOut)} MHz is outside the valid 100–432 MHz range.`);
  warnBox.innerHTML = warnings.length
    ? warnings.map(w => `<div>&#9888; ${w}</div>`).join('')
    : '<div>All clocks within STM32F407 limits.</div>';
  warnBox.classList.toggle('rcc-warn-box-bad', warnings.length > 0);
}

function initRCCModule() {
  document.getElementById('rccSource').addEventListener('change', e => {
    RCC_STATE.source = parseFloat(e.target.value);
    rccRender();
  });
  document.getElementById('rccPllToggle').addEventListener('click', () => {
    RCC_STATE.pllEnabled = !RCC_STATE.pllEnabled;
    document.getElementById('rccPllToggle').textContent = RCC_STATE.pllEnabled ? 'PLL: ON' : 'PLL: OFF (bypass)';
    rccRender();
  });
  document.getElementById('rccM').addEventListener('input', e => { RCC_STATE.m = parseInt(e.target.value); rccRender(); });
  document.getElementById('rccN').addEventListener('input', e => { RCC_STATE.n = parseInt(e.target.value); rccRender(); });
  document.getElementById('rccP').addEventListener('change', e => { RCC_STATE.p = parseInt(e.target.value); rccRender(); });
  document.getElementById('rccQ').addEventListener('input', e => { RCC_STATE.q = parseInt(e.target.value); rccRender(); });
  document.getElementById('rccAhb').addEventListener('change', e => { RCC_STATE.ahb = parseInt(e.target.value); rccRender(); });
  document.getElementById('rccApb1').addEventListener('change', e => { RCC_STATE.apb1 = parseInt(e.target.value); rccRender(); });
  document.getElementById('rccApb2').addEventListener('change', e => { RCC_STATE.apb2 = parseInt(e.target.value); rccRender(); });

  ['rccAhb', 'rccApb1', 'rccApb2'].forEach((id, i) => {
    const sel = document.getElementById(id);
    RCC_AHB_OPTS.forEach(v => {
      if (id !== 'rccAhb' && v > 16) return;
      const opt = document.createElement('option');
      opt.value = v; opt.textContent = '/' + v;
      sel.appendChild(opt);
    });
  });
  document.getElementById('rccAhb').value = RCC_STATE.ahb;
  document.getElementById('rccApb1').value = RCC_STATE.apb1;
  document.getElementById('rccApb2').value = RCC_STATE.apb2;

  rccRender();
}
