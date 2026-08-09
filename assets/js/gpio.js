// ---------- GPIO REGISTER SIMULATOR ----------

const GPIO_STATE = { pin: 5, moder: 1, otyper: 0, ospeedr: 0, pupdr: 0, odr: 0, idr: 0 };
const GPIO_MODE_NAMES = ['Input', 'Output', 'Alternate Function', 'Analog'];
const GPIO_SPEED_NAMES = ['Low', 'Medium', 'Fast', 'High'];
const GPIO_PUPD_NAMES = ['None', 'Pull-up', 'Pull-down'];

function gpioComputeRegister(fieldWidth, fieldValueForPin) {
  // All other pins assumed at reset value 0 for clarity.
  return setBits(0, GPIO_STATE.pin * fieldWidth, fieldWidth, fieldValueForPin);
}

function gpioRender() {
  const { pin, moder, otyper, ospeedr, pupdr, odr, idr } = GPIO_STATE;

  document.getElementById('gpioModeLabel').textContent = GPIO_MODE_NAMES[moder];
  document.getElementById('gpioOtyperLabel').textContent = otyper ? 'Open-drain' : 'Push-pull';
  document.getElementById('gpioOspeedrLabel').textContent = GPIO_SPEED_NAMES[ospeedr];
  document.getElementById('gpioPupdrLabel').textContent = GPIO_PUPD_NAMES[pupdr];
  document.getElementById('gpioOdrLabel').textContent = odr ? 'HIGH (1)' : 'LOW (0)';
  document.getElementById('gpioIdrLabel').textContent = idr ? 'HIGH (1)' : 'LOW (0)';

  document.getElementById('gpioOtyperRow').style.display = moder === 1 || moder === 2 ? '' : 'none';
  document.getElementById('gpioOspeedrRow').style.display = moder === 1 || moder === 2 ? '' : 'none';
  document.getElementById('gpioOdrRow').style.display = moder === 1 ? '' : 'none';
  document.getElementById('gpioIdrRow').style.display = moder === 0 ? '' : 'none';

  // LED / pin visual
  const led = document.getElementById('gpioLed');
  let lit = false, ledColor = LAB_COLORS.rule;
  if (moder === 1) { lit = odr === 1; }
  else if (moder === 0) { lit = idr === 1; }
  led.style.background = lit ? '#c0392b' : '#3a3a38';
  led.style.boxShadow = lit ? '0 0 14px 4px rgba(180,57,44,0.65)' : 'none';

  document.getElementById('gpioPinLabel').textContent = `PA${pin}`;

  // register readouts + bit strips
  const moderReg = gpioComputeRegister(2, moder);
  const otyperReg = gpioComputeRegister(1, otyper);
  const ospeedrReg = gpioComputeRegister(2, ospeedr);
  const pupdrReg = gpioComputeRegister(2, pupdr);
  const odrReg = gpioComputeRegister(1, odr);
  const idrReg = gpioComputeRegister(1, idr);

  document.getElementById('gpioModerHex').textContent = toHex(moderReg);
  document.getElementById('gpioOtyperHex').textContent = toHex(otyperReg);
  document.getElementById('gpioOspeedrHex').textContent = toHex(ospeedrReg);
  document.getElementById('gpioPupdrHex').textContent = toHex(pupdrReg);
  document.getElementById('gpioOdrHex').textContent = toHex(odrReg);
  document.getElementById('gpioIdrHex').textContent = toHex(idrReg);

  renderBitStrip(document.getElementById('gpioModerStrip'), moderReg, { highlightRange: [pin * 2, pin * 2 + 1] });
}

function gpioCycle(field, count) {
  GPIO_STATE[field] = (GPIO_STATE[field] + 1) % count;
  gpioRender();
}

function initGPIOModule() {
  const pinSelect = document.getElementById('gpioPinSelect');
  for (let i = 0; i < 16; i++) {
    const opt = document.createElement('option');
    opt.value = i; opt.textContent = `Pin ${i} (PA${i})`;
    pinSelect.appendChild(opt);
  }
  pinSelect.value = GPIO_STATE.pin;
  pinSelect.addEventListener('change', e => { GPIO_STATE.pin = parseInt(e.target.value); gpioRender(); });

  document.getElementById('gpioModeBtn').addEventListener('click', () => gpioCycle('moder', 4));
  document.getElementById('gpioOtyperBtn').addEventListener('click', () => gpioCycle('otyper', 2));
  document.getElementById('gpioOspeedrBtn').addEventListener('click', () => gpioCycle('ospeedr', 4));
  document.getElementById('gpioPupdrBtn').addEventListener('click', () => gpioCycle('pupdr', 3));
  document.getElementById('gpioOdrBtn').addEventListener('click', () => { GPIO_STATE.odr = GPIO_STATE.odr ? 0 : 1; gpioRender(); });
  document.getElementById('gpioIdrBtn').addEventListener('click', () => { GPIO_STATE.idr = GPIO_STATE.idr ? 0 : 1; gpioRender(); });

  gpioRender();
}
