// ---------- GENERIC REGISTER / BIT-FIELD EXPLORER ----------

const REG_DEFS = [
  {
    name: 'RCC_CR', reset: 0x00000083,
    fields: [
      { name: 'PLLI2SRDY', bit: 27, width: 1 }, { name: 'PLLI2SON', bit: 26, width: 1 },
      { name: 'PLLRDY', bit: 25, width: 1 }, { name: 'PLLON', bit: 24, width: 1 },
      { name: 'CSSON', bit: 19, width: 1 }, { name: 'HSEBYP', bit: 18, width: 1 },
      { name: 'HSERDY', bit: 17, width: 1 }, { name: 'HSEON', bit: 16, width: 1 },
      { name: 'HSICAL', bit: 8, width: 8 }, { name: 'HSITRIM', bit: 3, width: 5 },
      { name: 'HSIRDY', bit: 1, width: 1 }, { name: 'HSION', bit: 0, width: 1 }
    ]
  },
  {
    name: 'GPIOx_MODER', reset: 0x00000000,
    fields: Array.from({ length: 16 }, (_, i) => ({ name: `MODER${i}`, bit: i * 2, width: 2 }))
  },
  {
    name: 'GPIOx_OSPEEDR', reset: 0x00000000,
    fields: Array.from({ length: 16 }, (_, i) => ({ name: `OSPEEDR${i}`, bit: i * 2, width: 2 }))
  },
  {
    name: 'USART_CR1 (simplified)', reset: 0x00000000,
    fields: [
      { name: 'OVER8', bit: 15, width: 1 }, { name: 'UE', bit: 13, width: 1 },
      { name: 'M (word length)', bit: 12, width: 1 }, { name: 'PCE (parity enable)', bit: 10, width: 1 },
      { name: 'PS (parity select)', bit: 9, width: 1 }, { name: 'TXEIE', bit: 7, width: 1 },
      { name: 'RXNEIE', bit: 5, width: 1 }, { name: 'TE (tx enable)', bit: 3, width: 1 },
      { name: 'RE (rx enable)', bit: 2, width: 1 }
    ]
  },
  {
    name: 'TIMx_CR1 (simplified)', reset: 0x00000000,
    fields: [
      { name: 'ARPE', bit: 7, width: 1 }, { name: 'CMS', bit: 5, width: 2 },
      { name: 'DIR', bit: 4, width: 1 }, { name: 'OPM', bit: 3, width: 1 },
      { name: 'URS', bit: 2, width: 1 }, { name: 'UDIS', bit: 1, width: 1 },
      { name: 'CEN (counter enable)', bit: 0, width: 1 }
    ]
  }
];

let REG_CURRENT_VALUE = 0;
let REG_SELECTED_IDX = 0;

function regFieldOptions(width) {
  const max = fieldMask(width);
  const opts = [];
  for (let v = 0; v <= max; v++) opts.push(v);
  return opts;
}

function regRenderFields() {
  const def = REG_DEFS[REG_SELECTED_IDX];
  const wrap = document.getElementById('regFieldsWrap');
  wrap.innerHTML = '';
  def.fields.forEach(f => {
    const row = document.createElement('div');
    row.className = 'reg-field-row';
    const current = getBits(REG_CURRENT_VALUE, f.bit, f.width);
    const controlId = 'regField_' + f.name.replace(/\W/g, '_');
    let controlHtml;
    if (f.width <= 4 && f.width > 0) {
      const opts = regFieldOptions(f.width).map(v => `<option value="${v}" ${v === current ? 'selected' : ''}>${v}</option>`).join('');
      controlHtml = `<select id="${controlId}">${opts}</select>`;
    } else {
      controlHtml = `<input type="number" id="${controlId}" min="0" max="${fieldMask(f.width)}" value="${current}">`;
    }
    row.innerHTML = `<span class="reg-field-name">${f.name} <span class="dim">[bit ${f.bit}${f.width > 1 ? '+' + (f.width - 1) : ''}]</span></span><span class="reg-field-control">${controlHtml}</span>`;
    wrap.appendChild(row);
    document.getElementById(controlId).addEventListener('change', e => {
      const v = parseInt(e.target.value);
      REG_CURRENT_VALUE = setBits(REG_CURRENT_VALUE, f.bit, f.width, isNaN(v) ? 0 : v);
      regRenderValue();
    });
  });
}

function regRenderValue() {
  document.getElementById('regHexVal').textContent = toHex(REG_CURRENT_VALUE);
  document.getElementById('regResetVal').textContent = toHex(REG_DEFS[REG_SELECTED_IDX].reset);
  renderBitStrip(document.getElementById('regBitStrip'), REG_CURRENT_VALUE);
}

function regSelectRegister(idx) {
  REG_SELECTED_IDX = idx;
  REG_CURRENT_VALUE = REG_DEFS[idx].reset;
  regRenderFields();
  regRenderValue();
}

function initRegExplorerModule() {
  const select = document.getElementById('regSelect');
  REG_DEFS.forEach((r, i) => {
    const opt = document.createElement('option');
    opt.value = i; opt.textContent = r.name;
    select.appendChild(opt);
  });
  select.addEventListener('change', e => regSelectRegister(parseInt(e.target.value)));
  document.getElementById('regResetBtn').addEventListener('click', () => regSelectRegister(REG_SELECTED_IDX));
  regSelectRegister(0);
}
