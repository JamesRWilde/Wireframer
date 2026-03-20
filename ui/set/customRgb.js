/**
 * customRgb.js - Custom RGB Setter
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

import { CUSTOM_RGB } from '@ui/state/dom.js';
import { setCustomRgb } from '@ui/set/customRgbState.js';

import { clampByte } from '@ui/get/color/clampByte.js';
import { updateCustomColor }from '@ui/set/updateCustomColor.js';
import { customRgb as readCustomRgb }from '@ui/get/read/customRgb.js';
import { palette }from '@ui/set/apply/palette.js';

export function customRgb(rgb, options = {}) {
  const { persist = true, apply = true } = options;
  const newRgb = [clampByte(rgb[0]), clampByte(rgb[1]), clampByte(rgb[2])];

  // Update module-exported binding (used by other modules) and new state
  try {
    CUSTOM_RGB.length = 0;
    CUSTOM_RGB.push(...newRgb);
  } catch (e) {
    console.warn('[customRgb] failed to update module-held CUSTOM_RGB', e);
  }

  // Set dedicated custom RGB state to avoid globalThis scoping.
  setCustomRgb(newRgb);

  updateCustomColor();
  if (persist) readCustomRgb();
  if (apply) palette();
}
