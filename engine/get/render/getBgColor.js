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
import { setRebuildDerivedCache } from '@engine/render/physics/setRebuildDerivedCache.js';


/**
 * Returns computed background color for the current theme.
 * @returns {*} The current value from state.
 */
export function getBgColor() {
  setRebuildDerivedCache();
  return renderState.bgColor;
}
