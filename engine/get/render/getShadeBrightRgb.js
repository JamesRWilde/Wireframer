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
 *
 * WHY THIS EXISTS:
 *   Consistent accessor for calculated shade color tier used in rendering.
 */

// Import render state storing shade color values
import { renderState } from '@engine/state/render/stateRenderState.js';

// Ensure derived render state is refreshed on each lookup
import { setRebuildDerivedCache } from '@engine/set/render/physics/setRebuildDerivedCache.js';


/**
 * Returns bright shade rgb array [r, g, b].
 * @returns {*} The current value from state.
 */
export function getShadeBrightRgb() {
  setRebuildDerivedCache();
  return renderState.shadeBrightRgb;
}
