// ---------- IP ADDRESSING MODULE ----------

const IP_STATE = { octets: [192, 168, 1, 10] };

function ipClassify(octets) {
  const a = octets[0];
  if (a === 127) return { cls: 'A', clsDesc: 'first bit 0 (0xxxxxxx) — but 127.0.0.0/8 is reserved for loopback' };
  if (a >= 1 && a <= 126) return { cls: 'A', clsDesc: 'first bit is 0 (0xxxxxxx)' };
  if (a >= 128 && a <= 191) return { cls: 'B', clsDesc: 'first two bits are 10 (10xxxxxx)' };
  if (a >= 192 && a <= 223) return { cls: 'C', clsDesc: 'first three bits are 110 (110xxxxx)' };
  if (a >= 224 && a <= 239) return { cls: 'D', clsDesc: 'first four bits are 1110 — reserved for multicast' };
  return { cls: 'E', clsDesc: 'first four bits are 1111 — reserved / experimental' };
}

function ipType(octets) {
  const [a, b, c, d] = octets;
  if (a === 0) return 'Unspecified ("this network")';
  if (a === 127) return 'Loopback (refers to this machine)';
  if (a === 169 && b === 254) return 'Link-local (APIPA — no DHCP found)';
  if (a === 10) return 'Private (RFC 1918, 10.0.0.0/8)';
  if (a === 172 && b >= 16 && b <= 31) return 'Private (RFC 1918, 172.16.0.0/12)';
  if (a === 192 && b === 168) return 'Private (RFC 1918, 192.168.0.0/16)';
  if (a === 255 && b === 255 && c === 255 && d === 255) return 'Limited broadcast';
  if (a >= 224 && a <= 239) return 'Multicast';
  if (a >= 240) return 'Reserved / experimental';
  return 'Public (globally routable)';
}

function ipRenderBits() {
  const wrap = document.getElementById('ipBitsWrap');
  wrap.innerHTML = '';
  IP_STATE.octets.forEach((oct, oi) => {
    const group = document.createElement('div');
    group.className = 'ip-octet';
    const dec = document.createElement('div');
    dec.className = 'ip-octet-dec';
    dec.textContent = oct;
    group.appendChild(dec);
    const bits = document.createElement('div');
    bits.className = 'ip-octet-bits';
    octetToBinary(oct).split('').forEach((bit, bi) => {
      const span = document.createElement('span');
      span.className = 'ip-bit ' + (bit === '1' ? 'on' : 'off');
      span.textContent = bit;
      span.title = `bit value ${2 ** (7 - bi)}`;
      span.addEventListener('click', () => {
        const bits8 = octetToBinary(IP_STATE.octets[oi]).split('');
        bits8[bi] = bits8[bi] === '1' ? '0' : '1';
        IP_STATE.octets[oi] = binaryToOctet(bits8.join(''));
        ipSync();
      });
      bits.appendChild(span);
    });
    group.appendChild(bits);
    wrap.appendChild(group);
  });
}

function ipSync() {
  document.getElementById('ipAddrInput').value = octetsToIp(IP_STATE.octets);
  ipRenderBits();
  const { cls, clsDesc } = ipClassify(IP_STATE.octets);
  document.getElementById('ipClass').textContent = 'Class ' + cls;
  document.getElementById('ipClassDesc').textContent = clsDesc;
  document.getElementById('ipType').textContent = ipType(IP_STATE.octets);
  document.getElementById('ipBinaryFull').textContent = octetsToBinary(IP_STATE.octets).join('.');
}

function initIPAddressModule() {
  document.getElementById('ipAddrInput').addEventListener('change', e => {
    const parsed = ipToOctets(e.target.value);
    if (parsed) { IP_STATE.octets = parsed; } 
    ipSync();
  });
  document.getElementById('ipRandom').addEventListener('click', () => {
    IP_STATE.octets = [0, 0, 0, 0].map(() => Math.floor(Math.random() * 256));
    ipSync();
  });
  ipSync();
}
