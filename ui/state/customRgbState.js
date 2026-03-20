/**
 * customRgbState.js - Custom RGB application state
 *
 * PURPOSE:
 *   Centralizes custom RGB state for theme/palette/particle rendering.
 *   Replaces direct use of legacy global external color state with module state.
 */

"use strict";

/** @type {number[]} Custom user RGB color (0-255 each). */
let _customRgb = [95, 188, 230];

export function getCustomRgbState() {
  return _customRgb.slice();
}

export function setCustomRgbState(rgb) {
  if (!Array.isArray(rgb) || rgb.length !== 3) return;
  _customRgb = [rgb[0], rgb[1], rgb[2]];
}
