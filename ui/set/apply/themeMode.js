export function themeMode(modeOrState, options = {}) {
  const el = document.getElementById('theme-mode');
  const mode = typeof modeOrState === 'string' ? modeOrState : modeOrState?.themeMode;
  if (!el || !mode) return;
  el.value = mode === 'light' ? 'light' : 'dark';
}
