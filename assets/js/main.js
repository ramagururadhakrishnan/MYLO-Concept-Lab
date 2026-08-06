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
});
