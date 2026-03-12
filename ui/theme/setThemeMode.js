import { themeMode } from '../dom-state.js';
import { applyPalette } from './applyPalette.js';

export function setThemeMode(mode, options = {}) {
  const { apply = true } = options;
  globalThis.THEME_MODE = mode === 'light' ? 'light' : 'dark';
  if (themeMode) themeMode.value = globalThis.THEME_MODE;
  if (apply) applyPalette();
}
