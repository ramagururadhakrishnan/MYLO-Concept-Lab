// ---------- DNS RESOLUTION SIMULATOR ----------

const DNS_STATE = { domain: 'www.example.com', step: 0, steps: [] };

function dnsHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}
function dnsFakeIp(seed) {
  const h = dnsHash(seed);
  return [(h >>> 24) & 255, (h >>> 16) & 255, (h >>> 8) & 255, h & 255].join('.');
}

function dnsBuildSteps(domain) {
  const parts = domain.split('.').filter(Boolean);
  const tld = parts[parts.length - 1] || 'com';
  const sld = parts.length >= 2 ? parts[parts.length - 2] + '.' + tld : tld;
  const tldIp = dnsFakeIp('tld:' + tld);
  const authIp = dnsFakeIp('auth:' + sld);
  const finalIp = dnsFakeIp('a:' + domain);
  return [
    { actor: 'client', desc: `Client wants to reach "${domain}". It checks its local DNS cache — nothing cached yet.` },
    { actor: 'resolver', desc: `Client asks its configured recursive resolver (usually your ISP's or a public one like 1.1.1.1) to look up "${domain}".` },
    { actor: 'root', desc: `Resolver has no cached answer, so it asks a root server: "who handles .${tld}?"` },
    { actor: 'root', desc: `Root server doesn't know the final answer either — it refers the resolver to the TLD server for .${tld} (${tldIp}).` },
    { actor: 'tld', desc: `Resolver asks the .${tld} TLD server: "who is authoritative for ${sld}?"` },
    { actor: 'tld', desc: `TLD server refers the resolver to the authoritative name server for ${sld} (${authIp}).` },
    { actor: 'auth', desc: `Resolver asks the authoritative server directly: "what is the A record for ${domain}?"` },
    { actor: 'auth', desc: `Authoritative server answers: ${domain} = ${finalIp}.` },
    { actor: 'resolver', desc: `Resolver caches ${domain} → ${finalIp} for its TTL, and returns the answer to the client.` },
    { actor: 'client', desc: `Client now has the IP address ${finalIp} and can open a connection to it directly — no more DNS needed for this lookup.` }
  ];
}

function dnsRenderFlow() {
  const wrap = document.getElementById('dnsFlow');
  const actors = [['client', 'Client'], ['resolver', 'Resolver'], ['root', 'Root'], ['tld', 'TLD'], ['auth', 'Authoritative']];
  const currentActor = DNS_STATE.steps[DNS_STATE.step] ? DNS_STATE.steps[DNS_STATE.step].actor : null;
  wrap.innerHTML = actors.map(([key, label], i) => {
    const box = `<div class="cf-box${key === currentActor ? ' dns-active' : ''}">${label}</div>`;
    return i < actors.length - 1 ? box + '<span class="cf-arrow">&harr;</span>' : box;
  }).join('');
}

function dnsRenderStep() {
  const s = DNS_STATE;
  const step = s.steps[s.step];
  document.getElementById('dnsStepDesc').textContent = step ? step.desc : '';
  document.getElementById('dnsStepCount').textContent = `step ${s.step + 1} / ${s.steps.length}`;
  document.getElementById('dnsBack').disabled = s.step === 0;
  document.getElementById('dnsFwd').disabled = s.step >= s.steps.length - 1;
  dnsRenderFlow();
}

function dnsRun() {
  DNS_STATE.domain = document.getElementById('dnsDomain').value.trim() || 'www.example.com';
  DNS_STATE.steps = dnsBuildSteps(DNS_STATE.domain);
  DNS_STATE.step = 0;
  dnsRenderStep();
}

function initDNSModule() {
  document.getElementById('dnsDomain').value = DNS_STATE.domain;
  document.getElementById('dnsRunBtn').addEventListener('click', dnsRun);
  document.getElementById('dnsBack').addEventListener('click', () => { if (DNS_STATE.step > 0) { DNS_STATE.step--; dnsRenderStep(); } });
  document.getElementById('dnsFwd').addEventListener('click', () => { if (DNS_STATE.step < DNS_STATE.steps.length - 1) { DNS_STATE.step++; dnsRenderStep(); } });
  dnsRun();
}
