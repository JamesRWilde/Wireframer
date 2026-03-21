'use strict';

/**
 * getBgRgb - Get Bg Rgb
 *
 * PURPOSE:
 *   Returns computed background rgb array [r, g, b].
 *
 * ARCHITECTURE ROLE:
 *   Part of the one-function-per-file module architecture.
 *   Getter Module: engine/get/render/getBgRgb.js
 */

import { renderState } from '@engine/state/render/renderState.js';
import { rebuildDerivedCache } from '@engine/set/render/physics/rebuildDerivedCache.js';


/**
 * Returns computed background rgb array [r, g, b].
 * @returns {*} The current value from state.
 */
export function getBgRgb() {
  rebuildDerivedCache();
  return renderState.bgRgb;
}
