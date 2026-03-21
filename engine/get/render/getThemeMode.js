'use strict';

/**
 * getThemeMode - Get Theme Mode
 *
 * PURPOSE:
 *   Returns current theme mode ("light" or "dark").
 *
 * ARCHITECTURE ROLE:
 *   Part of the one-function-per-file module architecture.
 *   Getter Module: engine/get/render/getThemeMode.js
 */

import { renderState } from '@engine/state/render/renderState.js';


/**
 * Returns current theme mode ("light" or "dark").
 * @returns {*} The current value from state.
 */
export function getThemeMode() {
  return renderState.themeMode;
}
