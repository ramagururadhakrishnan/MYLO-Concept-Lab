// ---------- ROUTING TABLE SIMULATOR ----------

const ROUTING_STATE = {
  routes: [
    { network: '0.0.0.0', prefix: 0, nextHop: '203.0.113.1', iface: 'eth0 (WAN)', metric: 10 },
    { network: '192.168.1.0', prefix: 24, nextHop: '0.0.0.0 (directly connected)', iface: 'eth1 (LAN)', metric: 0 },
    { network: '192.168.1.128', prefix: 26, nextHop: '192.168.1.254', iface: 'eth1.2', metric: 1 },
    { network: '10.0.0.0', prefix: 8, nextHop: '192.168.1.1', iface: 'eth1', metric: 5 }
  ],
  destIp: '192.168.1.200'
};

function routingCompute(destIp) {
  const destOctets = ipToOctets(destIp);
  if (!destOctets) return null;
  const destInt = octetsToInt(destOctets);
  const matches = ROUTING_STATE.routes.map((r, i) => {
    const netOctets = ipToOctets(r.network);
    if (!netOctets) return { ...r, idx: i, isMatch: false, invalid: true };
    const maskInt = prefixToMaskInt(r.prefix);
    const netInt = (octetsToInt(netOctets) & maskInt) >>> 0;
    const isMatch = ((destInt & maskInt) >>> 0) === netInt;
    return { ...r, idx: i, isMatch };
  });
  const matched = matches.filter(m => m.isMatch).sort((a, b) => b.prefix - a.prefix || a.metric - b.metric);
  return { matches, winner: matched[0] || null };
}

function routingRenderTable() {
  const wrap = document.getElementById('routingTableWrap');
  const table = document.createElement('table');
  table.className = 'subnet-table fa-table';
  table.innerHTML = '<thead><tr><th>Network</th><th>Prefix</th><th>Next hop</th><th>Interface</th><th>Metric</th></tr></thead>';
  const tbody = document.createElement('tbody');
  ROUTING_STATE.routes.forEach((r, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><input type="text" data-i="${i}" data-f="network" value="${r.network}" style="width:110px;"></td>
      <td><input type="number" data-i="${i}" data-f="prefix" value="${r.prefix}" min="0" max="32" style="width:60px;"></td>
      <td><input type="text" data-i="${i}" data-f="nextHop" value="${r.nextHop}" style="width:150px;"></td>
      <td><input type="text" data-i="${i}" data-f="iface" value="${r.iface}" style="width:110px;"></td>
      <td><input type="number" data-i="${i}" data-f="metric" value="${r.metric}" min="0" style="width:50px;"></td>
    `;
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  wrap.innerHTML = '';
  wrap.appendChild(table);
  wrap.querySelectorAll('input').forEach(inp => {
    inp.addEventListener('change', e => {
      const i = parseInt(e.target.dataset.i), f = e.target.dataset.f;
      ROUTING_STATE.routes[i][f] = (f === 'prefix' || f === 'metric') ? parseInt(e.target.value) : e.target.value;
      routingRun();
    });
  });
}

function routingRun() {
  const result = routingCompute(ROUTING_STATE.destIp);
  const resultBox = document.getElementById('routingResultBox');
  if (!result) {
    resultBox.textContent = 'Enter a valid destination IP (e.g. 192.168.1.200).';
    resultBox.className = 'fa-result reject';
    return;
  }
  if (!result.winner) {
    resultBox.textContent = 'No matching route — packet is undeliverable (no default route configured).';
    resultBox.className = 'fa-result reject';
  } else {
    resultBox.innerHTML = `Winning route: <b>${result.winner.network}/${result.winner.prefix}</b> via ${result.winner.nextHop} (${result.winner.iface}) — longest prefix match.`;
    resultBox.className = 'fa-result accept';
  }

  const rowsHtml = document.querySelectorAll('#routingTableWrap tbody tr');
  result.matches.forEach((m, i) => {
    const row = rowsHtml[i];
    if (!row) return;
    row.classList.toggle('routing-match', m.isMatch);
    row.classList.toggle('routing-winner', result.winner && m.idx === result.winner.idx);
  });
}

function initRoutingModule() {
  routingRenderTable();
  document.getElementById('routingDestInput').value = ROUTING_STATE.destIp;
  document.getElementById('routingDestInput').addEventListener('input', e => { ROUTING_STATE.destIp = e.target.value.trim(); });
  document.getElementById('routingFindBtn').addEventListener('click', routingRun);
  document.getElementById('routingDestInput').addEventListener('keydown', e => { if (e.key === 'Enter') routingRun(); });
  routingRun();
}
