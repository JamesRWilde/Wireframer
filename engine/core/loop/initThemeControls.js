import { initPresetSwatches } from '../../../ui/theme/initPresetSwatches.js';
import { readCustomRgb } from '../../../ui/theme/readCustomRgb.js';
import { setCustomRgb } from '../../../ui/theme/setCustomRgb.js';
import { setThemeMode } from '../../../ui/theme/setThemeMode.js';
import { persistUiState } from '../../../ui/controls/persistUiState.js';

export function initThemeControls() {
  try {
    initPresetSwatches();
    const saved = readCustomRgb();
    if (saved) setCustomRgb(saved, { persist: false, apply: true });

    if (typeof document !== 'undefined' && document.getElementById('theme-mode')) {
      const tm = document.getElementById('theme-mode');
      setThemeMode(tm.value, { apply: true });

      tm.addEventListener('input', () => {
        setThemeMode(tm.value, { apply: true });
        try {
          persistUiState();
        } catch {
          // ignore
        }
      });
      tm.addEventListener('change', () => tm.dispatchEvent(new Event('input')));
    }
  } catch (e) {
    // Non-critical: keep app running if theme init fails
    // eslint-disable-next-line no-console
    console.warn('Theme init failed', e);
  }
}
