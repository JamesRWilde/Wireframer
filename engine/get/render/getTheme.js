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
 */

import { renderState } from '@engine/state/render/renderState.js';


/**
 * Returns active theme object.
 * @returns {*} The current value from state.
 */
export function getTheme() {
  return renderState.theme;
}
