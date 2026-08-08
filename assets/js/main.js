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
});
