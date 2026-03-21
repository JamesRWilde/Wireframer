'use strict';

/**
 * getShadeBrightRgb - Get Shade Bright Rgb
 *
 * PURPOSE:
 *   Returns bright shade rgb array [r, g, b].
 *
 * ARCHITECTURE ROLE:
 *   Part of the one-function-per-file module architecture.
 *   Getter Module: engine/get/render/getShadeBrightRgb.js
 */

import { renderState } from '@engine/state/render/renderState.js';
import { rebuildDerivedCache } from '@engine/set/render/physics/rebuildDerivedCache.js';


/**
 * Returns bright shade rgb array [r, g, b].
 * @returns {*} The current value from state.
 */
export function getShadeBrightRgb() {
  rebuildDerivedCache();
  return renderState.shadeBrightRgb;
}
