// ---------- SUBNETTING MODULE ----------

const SUBNET_STATE = { ipOctets: [192, 168, 1, 10], prefix: 24 };

function subnetCompute() {
  const ipInt = octetsToInt(SUBNET_STATE.ipOctets);
  const prefix = SUBNET_STATE.prefix;
  const maskInt = prefixToMaskInt(prefix);
  const networkInt = (ipInt & maskInt) >>> 0;
  const wildcardInt = (~maskInt) >>> 0;
  const broadcastInt = (networkInt | wildcardInt) >>> 0;
  let usable, firstInt, lastInt;
  if (prefix >= 31) {
    usable = prefix === 32 ? 1 : 2;
    firstInt = networkInt;
    lastInt = broadcastInt;
  } else {
    usable = Math.max(0, Math.pow(2, 32 - prefix) - 2);
    firstInt = networkInt + 1;
    lastInt = broadcastInt - 1;
  }
  return {
    ip: SUBNET_STATE.ipOctets,
    mask: intToOctets(maskInt),
    network: intToOctets(networkInt),
    broadcast: intToOctets(broadcastInt),
    first: intToOctets(firstInt),
    last: intToOctets(lastInt),
    usable, prefix
  };
}

function subnetRenderBitBar() {
  const wrap = document.getElementById('subnetBitBar');
  wrap.innerHTML = '';
  let bitIndex = 0;
  octetsToBinary(SUBNET_STATE.ipOctets).forEach(octStr => {
    const group = document.createElement('div');
    group.className = 'ip-octet-bitgroup';
    octStr.split('').forEach(bit => {
      const span = document.createElement('span');
      const isNetwork = bitIndex < SUBNET_STATE.prefix;
      span.className = 'ip-bit ' + (isNetwork ? 'net' : 'host');
      span.textContent = bit;
      group.appendChild(span);
      bitIndex++;
    });
    wrap.appendChild(group);
  });
}

function subnetRenderTable(r) {
  const rows = [
    ['IP address', r.ip], ['Subnet mask', r.mask],
    ['Network address', r.network], ['Broadcast address', r.broadcast],
    ['First usable host', r.first], ['Last usable host', r.last]
  ];
  const tbody = document.getElementById('subnetTableBody');
  tbody.innerHTML = '';
  rows.forEach(([label, octets]) => {
    const tr = document.createElement('tr');
    const tdLabel = document.createElement('td');
    tdLabel.className = 'st-label';
    tdLabel.textContent = label;
    const tdDec = document.createElement('td');
    tdDec.className = 'st-dec';
    tdDec.textContent = octetsToIp(octets);
    const tdBin = document.createElement('td');
    tdBin.className = 'st-bin';
    tdBin.textContent = octetsToBinary(octets).join('.');
    tr.append(tdLabel, tdDec, tdBin);
    tbody.appendChild(tr);
  });
}

function subnetSync() {
  const r = subnetCompute();
  document.getElementById('subnetIpInput').value = octetsToIp(SUBNET_STATE.ipOctets);
  document.getElementById('subnetPrefixVal').textContent = '/' + SUBNET_STATE.prefix;
  document.getElementById('subnetUsable').textContent = r.usable.toLocaleString();
  subnetRenderBitBar();
  subnetRenderTable(r);
}

function initSubnetModule() {
  document.getElementById('subnetIpInput').addEventListener('change', e => {
    const parsed = ipToOctets(e.target.value);
    if (parsed) SUBNET_STATE.ipOctets = parsed;
    subnetSync();
  });
  document.getElementById('subnetPrefix').addEventListener('input', e => {
    SUBNET_STATE.prefix = parseInt(e.target.value);
    subnetSync();
  });
  document.querySelectorAll('.prefix-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      SUBNET_STATE.prefix = parseInt(btn.dataset.prefix);
      document.getElementById('subnetPrefix').value = SUBNET_STATE.prefix;
      subnetSync();
    });
  });
  subnetSync();
}
