// ---------- REGULAR LANGUAGES: PUMPING LEMMA ----------

const PUMP_STATE = { lang: 'anbn', p: 4, yLen: 1, yStart: 0, k: 2 };

function pumpBuildString(lang, p) {
  if (lang === 'anbn') return 'a'.repeat(p) + 'b'.repeat(p);
  return 'ab'.repeat(p); // regular language: (ab)^p, always in language regardless of pumping
}

function pumpInLanguage(lang, s) {
  if (lang === 'anbn') {
    const m = s.match(/^(a*)(b*)$/);
    if (!m) return false;
    return m[1].length === m[2].length && m[1].length + m[2].length === s.length;
  }
  // regular language demo: strings that are a repetition of "ab" one or more times, i.e. (ab)+
  return /^(ab)+$/.test(s);
}

function pumpRun() {
  const s = PUMP_STATE;
  const w = pumpBuildString(s.lang, s.p);
  const maxXY = Math.min(s.p, w.length);
  s.yStart = Math.min(s.yStart, maxXY - 1);
  s.yLen = Math.min(s.yLen, maxXY - s.yStart);
  if (s.yLen < 1) s.yLen = 1;

  const x = w.slice(0, s.yStart);
  const y = w.slice(s.yStart, s.yStart + s.yLen);
  const z = w.slice(s.yStart + s.yLen);
  const pumped = x + y.repeat(s.k) + z;
  const stillInLanguage = pumpInLanguage(s.lang, pumped);

  document.getElementById('pumpWord').innerHTML = `w = <span class="pump-x">${x || 'ε'}</span><span class="pump-y">${y}</span><span class="pump-z">${z || 'ε'}</span> &nbsp; (|w| = ${w.length}, p = ${s.p})`;
  document.getElementById('pumpConstraint').textContent = `|xy| = ${x.length + y.length} ${x.length + y.length <= s.p ? '≤' : '>'} p, |y| = ${y.length} ${y.length >= 1 ? '≥ 1 ✓' : '< 1 ✗'}`;
  document.getElementById('pumpedWord').innerHTML = `xy<sup>${s.k}</sup>z = <span class="pump-x">${x || 'ε'}</span><span class="pump-y">${y.repeat(s.k)}</span><span class="pump-z">${z || 'ε'}</span>`;
  const verdict = document.getElementById('pumpVerdict');
  if (s.lang === 'anbn') {
    verdict.textContent = stillInLanguage
      ? 'Still in the language for this particular split — try a different y-position/length, or notice: for THIS language, every valid split (|xy|≤p) forces y to be all a\'s, so pumping always breaks the a-count = b-count property. That contradiction is what proves L is not regular.'
      : `xy${s.k}z = "${pumped}" is NOT in {aⁿbⁿ} — pumping broke the language. Since the pumping lemma says a regular language MUST tolerate this for every valid split, this contradiction proves {aⁿbⁿ} is not regular.`;
    verdict.className = 'note ' + (stillInLanguage ? '' : 'pump-bad');
  } else {
    verdict.textContent = stillInLanguage
      ? `xy${s.k}z = "${pumped}" is still in (ab)+ — for a genuinely regular language, pumping the loop-forming part of any accepting run always stays in the language. That's the whole point: regular languages always survive this test.`
      : `Not in the language for this split — (ab)+ is regular, so some other split (not this one) would need to work; the pumping lemma only requires that SOME valid split survives pumping, not every split.`;
    verdict.className = 'note';
  }
}

function initPumpingModule() {
  document.getElementById('pumpLang').addEventListener('change', e => { PUMP_STATE.lang = e.target.value; PUMP_STATE.yStart = 0; PUMP_STATE.yLen = 1; pumpRun(); });
  document.getElementById('pumpP').addEventListener('input', e => { PUMP_STATE.p = parseInt(e.target.value); document.getElementById('pumpPVal').textContent = PUMP_STATE.p; pumpRun(); });
  document.getElementById('pumpYStart').addEventListener('input', e => { PUMP_STATE.yStart = parseInt(e.target.value); pumpRun(); });
  document.getElementById('pumpYLen').addEventListener('input', e => { PUMP_STATE.yLen = parseInt(e.target.value); pumpRun(); });
  document.getElementById('pumpK').addEventListener('input', e => { PUMP_STATE.k = parseInt(e.target.value); document.getElementById('pumpKVal').textContent = PUMP_STATE.k; pumpRun(); });
  pumpRun();
}
