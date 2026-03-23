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

import { renderState } from '@engine/state/render/stateRenderState.js';
import { setRebuildDerivedCache } from '@engine/set/render/physics/setRebuildDerivedCache.js';


/**
 * Returns bright shade rgb array [r, g, b].
 * @returns {*} The current value from state.
 */
export function getShadeBrightRgb() {
  setRebuildDerivedCache();
  return renderState.shadeBrightRgb;
}
