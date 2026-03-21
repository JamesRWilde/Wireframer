'use strict';

/**
 * getBgColor - Get Bg Color
 *
 * PURPOSE:
 *   Returns computed background color for the current theme.
 *
 * ARCHITECTURE ROLE:
 *   Part of the one-function-per-file module architecture.
 *   Getter Module: engine/get/render/getBgColor.js
 */

import { renderState } from '@engine/state/render/renderState.js';
import { rebuildDerivedCache } from '@engine/set/render/physics/rebuildDerivedCache.js';


/**
 * Returns computed background color for the current theme.
 * @returns {*} The current value from state.
 */
export function getBgColor() {
  rebuildDerivedCache();
  return renderState.bgColor;
}
