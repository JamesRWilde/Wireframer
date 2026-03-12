import { buildCustomTheme } from './buildCustomTheme.js';
import { CUSTOM_RGB } from '../dom-state.js';

export function applyPalette() {
  const palette = buildCustomTheme(CUSTOM_RGB);
  globalThis.THEME = palette;
  for (const [k, v] of Object.entries(palette.uiVars)) {
    document.documentElement.style.setProperty(k, v);
  }
}
