// ---------- SIDEBAR NAV + BOOT ----------
// Adding a new module? Add its init function here, guarded like the ones
// below, so the lab keeps working even if a module's script hasn't loaded.

function initSideNav() {
  document.querySelectorAll('.side-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.side-tab').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.module').forEach(m => m.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('mod-' + btn.dataset.tab).classList.add('active');
      const heading = document.getElementById('lab-heading');
      if (heading) heading.textContent = btn.textContent;
      if (window.innerWidth <= 880) document.body.classList.remove('sidebar-open');
    });
  });

  document.querySelectorAll('.group-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const group = btn.closest('.nav-group');
      group.classList.toggle('collapsed');
    });
  });

  const menuBtn = document.getElementById('sidebarMenuBtn');
  if (menuBtn) {
    menuBtn.addEventListener('click', () => document.body.classList.toggle('sidebar-open'));
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initSideNav();
  if (typeof initLevenshteinModule === 'function') initLevenshteinModule();
  if (typeof initTTRModule === 'function') initTTRModule();
  if (typeof initLinRegModule === 'function') initLinRegModule();
  if (typeof initOverfittingModule === 'function') initOverfittingModule();
  if (typeof initKNNModule === 'function') initKNNModule();
  if (typeof initKMeansModule === 'function') initKMeansModule();
  if (typeof initDecisionBoundaryModule === 'function') initDecisionBoundaryModule();
  if (typeof initConfusionMatrixModule === 'function') initConfusionMatrixModule();
  if (typeof initIPAddressModule === 'function') initIPAddressModule();
  if (typeof initSubnetModule === 'function') initSubnetModule();
  if (typeof initNgramModule === 'function') initNgramModule();
  if (typeof initCosineModule === 'function') initCosineModule();
  if (typeof initTfidfModule === 'function') initTfidfModule();
  if (typeof initBigramModule === 'function') initBigramModule();
  if (typeof initRoutingModule === 'function') initRoutingModule();
  if (typeof initDNSModule === 'function') initDNSModule();
  if (typeof initOSIModule === 'function') initOSIModule();
  if (typeof initEDAModule === 'function') initEDAModule();
  if (typeof initMVLabModule === 'function') initMVLabModule();
  if (typeof initGPIOModule === 'function') initGPIOModule();
  if (typeof initRCCModule === 'function') initRCCModule();
  if (typeof initTimerModule === 'function') initTimerModule();
  if (typeof initUARTModule === 'function') initUARTModule();
  if (typeof initSPII2CModule === 'function') initSPII2CModule();
  if (typeof initNVICModule === 'function') initNVICModule();
  if (typeof initStackFrameModule === 'function') initStackFrameModule();
  if (typeof initMemMapModule === 'function') initMemMapModule();
  if (typeof initBitbandModule === 'function') initBitbandModule();
  if (typeof initADCModule === 'function') initADCModule();
  if (typeof initDMAModule === 'function') initDMAModule();
  if (typeof initRegExplorerModule === 'function') initRegExplorerModule();
  if (typeof initDFAModule === 'function') initDFAModule();
  if (typeof initNFAModule === 'function') initNFAModule();
  if (typeof initN2DModule === 'function') initN2DModule();
  if (typeof initMinimizeModule === 'function') initMinimizeModule();
  if (typeof initRegexModule === 'function') initRegexModule();
  if (typeof initPumpingModule === 'function') initPumpingModule();
  if (typeof initPropertiesModule === 'function') initPropertiesModule();
  if (typeof initFAExamplesModule === 'function') initFAExamplesModule();
});
