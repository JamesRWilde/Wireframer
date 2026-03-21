'use strict';

/**
 * getFillRgb - Get Fill Rgb
 *
 * PURPOSE:
 *   Returns computed fill rgb array [r, g, b].
 *
 * ARCHITECTURE ROLE:
 *   Part of the one-function-per-file module architecture.
 *   Getter Module: engine/get/render/getFillRgb.js
 */

import { renderState } from '@engine/state/render/renderState.js';
import { rebuildDerivedCache } from '@engine/set/render/physics/rebuildDerivedCache.js';


/**
 * Returns computed fill rgb array [r, g, b].
 * @returns {*} The current value from state.
 */
export function getFillRgb() {
  rebuildDerivedCache();
  return renderState.fillRgb;
}
