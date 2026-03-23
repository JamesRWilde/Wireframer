'use strict';

/**
 * getTheme - Get Theme
 *
 * PURPOSE:
 *   Returns active theme object.
 *
 * ARCHITECTURE ROLE:
 *   Part of the one-function-per-file module architecture.
 *   Getter Module: engine/get/render/getTheme.js
 *
 * WHY THIS EXISTS:
 *   Provides a centralized, immutable access point for current theme data.
 */

// Import render state containing theme selection and derived palette values. 
import { renderState } from '@engine/state/render/stateRenderState.js';


/**
 * Returns active theme object.
 * @returns {*} The current value from state.
 */
export function getTheme() {
  return renderState.theme;
}
