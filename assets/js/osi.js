// ---------- OSI MODEL MODULE ----------

const OSI_LAYERS = [
  { n: 7, name: 'Application', pdu: 'Data', examples: 'HTTP, DNS, SMTP, FTP', desc: 'Where user-facing network software lives — browsers, email clients, apps calling APIs.' },
  { n: 6, name: 'Presentation', pdu: 'Data', examples: 'TLS/SSL, JPEG, character encoding (UTF-8)', desc: 'Formats, encrypts/decrypts, and compresses data so both ends agree on representation.' },
  { n: 5, name: 'Session', pdu: 'Data', examples: 'NetBIOS, RPC, API sessions', desc: 'Opens, manages, and closes a communication session between two hosts.' },
  { n: 4, name: 'Transport', pdu: 'Segment (TCP) / Datagram (UDP)', examples: 'TCP, UDP', desc: 'End-to-end delivery, reliability, ordering, and flow control; introduces port numbers.' },
  { n: 3, name: 'Network', pdu: 'Packet', examples: 'IP, ICMP, routers', desc: 'Logical addressing (IP) and routing across networks — this is the layer the Routing Table module operates at.' },
  { n: 2, name: 'Data Link', pdu: 'Frame', examples: 'Ethernet, Wi-Fi (802.11), MAC addresses, switches', desc: 'Node-to-node delivery on the same physical network segment, with error detection via checksums/CRC.' },
  { n: 1, name: 'Physical', pdu: 'Bit', examples: 'Cables, radio signals, voltage levels, connectors', desc: 'The actual electrical, optical, or radio transmission of raw bits.' }
];

function osiRenderList(selected) {
  const wrap = document.getElementById('osiList');
  wrap.innerHTML = '';
  OSI_LAYERS.forEach(l => {
    const row = document.createElement('div');
    row.className = 'mmap-row' + (l.n === selected ? ' active' : '');
    row.innerHTML = `<span class="mmap-range">L${l.n}</span><span class="mmap-name">${l.name} <span class="dim">(${l.pdu})</span></span>`;
    row.addEventListener('click', () => osiRenderList(l.n));
    wrap.appendChild(row);
  });
  const l = OSI_LAYERS.find(x => x.n === selected);
  document.getElementById('osiDetail').innerHTML = `
    <div class="readout-row">
      <div class="readout"><div class="n">Layer ${l.n}</div><div class="l">${l.name}</div></div>
      <div class="readout accent"><div class="n">${l.pdu}</div><div class="l">PDU name</div></div>
    </div>
    <p class="note"><b>Examples:</b> ${l.examples}</p>
    <p class="note">${l.desc}</p>
  `;
}

function osiRenderEncapsulation() {
  const wrap = document.getElementById('osiEncap');
  const layers = [
    { label: 'L2 frame header/trailer', color: LAB_COLORS.inkSoft },
    { label: 'L3 IP header', color: LAB_COLORS.teal },
    { label: 'L4 TCP/UDP header', color: LAB_COLORS.red },
    { label: 'Application data', color: LAB_COLORS.ink }
  ];
  let html = '', close = '';
  layers.forEach(l => {
    html += `<div class="osi-encap-box" style="border-color:${l.color}"><span class="osi-encap-label" style="color:${l.color}">${l.label}</span>`;
    close = '</div>' + close;
  });
  wrap.innerHTML = html + close;
}

function initOSIModule() {
  osiRenderList(7);
  osiRenderEncapsulation();
}
