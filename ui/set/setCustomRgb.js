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
import { setCustomRgbState } from '@ui/set/setCustomRgbState.js';

import { getClampByte } from '@ui/get/color/getClampByte.js';
import { setUpdateCustomColor }from '@ui/set/setUpdateCustomColor.js';
import { getCustomRgb }from '@ui/get/read/getCustomRgb.js';
import { setPalette }from '@ui/set/apply/setPalette.js';

export function setCustomRgb(rgb, options = {}) {
  const { persist = true, apply = true } = options;
  const newRgb = [getClampByte(rgb[0]), getClampByte(rgb[1]), getClampByte(rgb[2])];

  // Update module-exported binding (used by other modules) and new state
  try {
    CUSTOM_RGB.length = 0;
    CUSTOM_RGB.push(...newRgb);
  } catch (e) {
    console.warn('[customRgb] failed to update module-held CUSTOM_RGB', e);
  }

  // Set dedicated custom RGB state to avoid global variable scoping.
  setCustomRgbState(newRgb);

  setUpdateCustomColor();
  if (persist) getCustomRgb();
  if (apply) setPalette();
}
