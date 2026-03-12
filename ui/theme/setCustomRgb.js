import { clampByte } from '../color-utils/clampByte.js';
import { updateCustomColorUi } from './updateCustomColorUi.js';
import { persistCustomRgb } from './persistCustomRgb.js';
import { applyPalette } from './applyPalette.js';
import { CUSTOM_RGB } from '../dom-state.js';

export function setCustomRgb(rgb, options = {}) {
  const { persist = true, apply = true } = options;
  const newRgb = [clampByte(rgb[0]), clampByte(rgb[1]), clampByte(rgb[2])];
  // update both module-exported binding and globalThis for backwards compatibility
  try { CUSTOM_RGB.length = 0; CUSTOM_RGB.push(...newRgb); } catch (e) {}
  globalThis.CUSTOM_RGB = newRgb;
  updateCustomColorUi();
  if (persist) persistCustomRgb();
  if (apply) applyPalette();
}
