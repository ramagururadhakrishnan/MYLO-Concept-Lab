// ---------- STM32F407 MEMORY MAP EXPLORER ----------

const MMAP_REGIONS = [
  { name: 'Cortex-M4 Internal Peripherals', start: 0xE0000000, end: 0xE00FFFFF, desc: 'NVIC, SysTick, SCB, FPU, debug (ITM/DWT) — part of the ARM core, not ST-specific.' },
  { name: 'AHB2 Peripherals', start: 0x50000000, end: 0x5003FFFF, desc: 'USB OTG FS, camera interface (DCMI), RNG.' },
  { name: 'AHB1 Peripherals', start: 0x40020000, end: 0x4007FFFF, desc: 'GPIOA–GPIOI, DMA1/DMA2, RCC (0x4002 3800), CRC, Ethernet MAC.' },
  { name: 'APB2 Peripherals', start: 0x40010000, end: 0x40017FFF, desc: 'USART1, USART6, SPI1, TIM1, TIM8, ADC1-3, SYSCFG, EXTI.' },
  { name: 'APB1 Peripherals', start: 0x40000000, end: 0x40007FFF, desc: 'TIM2-7, USART2/3, UART4/5, SPI2/3, I2C1-3, PWR, IWDG, WWDG.' },
  { name: 'SRAM', start: 0x20000000, end: 0x2001FFFF, desc: '128 KB total on STM32F407 (112 KB main SRAM1 + 16 KB SRAM2), also aliased at the bit-band alias region 0x2200 0000+.' },
  { name: 'Flash memory', start: 0x08000000, end: 0x080FFFFF, desc: 'Up to 1 MB of program flash on F407. Reset vector table starts here; the initial SP and reset handler address live at 0x0800 0000 / 0x0800 0004.' },
  { name: 'Aliased boot memory', start: 0x00000000, end: 0x000FFFFF, desc: 'Mirrors whichever boot memory is selected via the BOOT pins (Flash, system memory bootloader, or embedded SRAM) — this is what the core actually executes from address 0 after reset.' }
];

function mmapRender(selectedIdx) {
  const list = document.getElementById('mmapList');
  list.innerHTML = '';
  MMAP_REGIONS.forEach((r, i) => {
    const row = document.createElement('div');
    row.className = 'mmap-row' + (i === selectedIdx ? ' active' : '');
    row.innerHTML = `<span class="mmap-range">${toHex(r.start)} – ${toHex(r.end)}</span><span class="mmap-name">${r.name}</span>`;
    row.addEventListener('click', () => mmapRender(i));
    list.appendChild(row);
  });

  const detail = document.getElementById('mmapDetail');
  const r = MMAP_REGIONS[selectedIdx];
  const sizeBytes = r.end - r.start + 1;
  const sizeLabel = sizeBytes >= 1024 * 1024 ? (sizeBytes / (1024 * 1024)) + ' MB' : (sizeBytes / 1024) + ' KB';
  detail.innerHTML = `
    <div class="readout-row">
      <div class="readout"><div class="n">${toHex(r.start)}</div><div class="l">start address</div></div>
      <div class="readout"><div class="n">${toHex(r.end)}</div><div class="l">end address</div></div>
      <div class="readout accent"><div class="n">${sizeLabel}</div><div class="l">region size</div></div>
    </div>
    <p class="note">${r.desc}</p>
  `;
}

function initMemMapModule() {
  mmapRender(6); // default to Flash
}
