// ---------- TAB SWITCHING + BOOT ----------
// Adding a new module? Add its init function here, guarded like the ones
// below, so the lab keeps working even if a module's script hasn't loaded.

function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.module').forEach(m => m.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('mod-' + btn.dataset.tab).classList.add('active');
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  if (typeof initLevenshteinModule === 'function') initLevenshteinModule();
  if (typeof initTTRModule === 'function') initTTRModule();
  if (typeof initLinRegModule === 'function') initLinRegModule();
  if (typeof initOverfittingModule === 'function') initOverfittingModule();
  if (typeof initKNNModule === 'function') initKNNModule();
  if (typeof initKMeansModule === 'function') initKMeansModule();
  if (typeof initDecisionBoundaryModule === 'function') initDecisionBoundaryModule();
  if (typeof initConfusionMatrixModule === 'function') initConfusionMatrixModule();
});
