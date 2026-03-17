/**
 * SetUiCustomRgb.js - Custom RGB Setter
 *
 * PURPOSE:
 *   Updates the application's custom RGB color state, updates the UI, optionally
 *   persists the value, and applies the theme palette.
 *
 * ARCHITECTURE ROLE:
 *   Acts as the single authoritative setter for the custom RGB color used by
 *   the theme system. Keeps module-scoped state and legacy global state in sync.
 *
 * DATA FORMAT:
 *   - rgb: [r, g, b] where each component is 0-255.
 *
 * @param {number[]} rgb - RGB triplet [r, g, b]
 * @param {Object} [options={}] - Options for applying/persisting
 * @param {boolean} [options.persist=true] - Whether to save to localStorage
 * @param {boolean} [options.apply=true] - Whether to reapply the current palette
 */

"use strict";

import { uiColorClampByte } from '../get/uiColorClampByte.js';
import { uiUpdateCustomColor } from './uiUpdateCustomColor.js';
import { uiPersistCustomRgb } from './uiPersistCustomRgb.js';
import { uiApplyPalette } from './uiApplyPalette.js';
import { CUSTOM_RGB } from '../state/uiDom.js';

export function uiCustomRgb(rgb, options = {}) {
  const { persist = true, apply = true } = options;
  const newRgb = [GetUiColorClampByte(rgb[0]), GetUiColorClampByte(rgb[1]), GetUiColorClampByte(rgb[2])];

  // Update module-exported binding (used by other modules) and global fallback.
  try {
    CUSTOM_RGB.length = 0;
    CUSTOM_RGB.push(...newRgb);
  } catch (e) {
    console.warn('[SetUiCustomRgb] failed to update module-held CUSTOM_RGB', e);
  }
  globalThis.CUSTOM_RGB = newRgb;

  SetUiUpdateCustomColor();
  if (persist) SetUiPersistCustomRgb();
  if (apply) SetUiApplyPalette();
}
