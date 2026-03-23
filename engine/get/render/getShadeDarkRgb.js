'use strict';

/**
 * getShadeDarkRgb - Get Shade Dark Rgb
 *
 * PURPOSE:
 *   Returns dark shade rgb array [r, g, b].
 *
 * ARCHITECTURE ROLE:
 *   Part of the one-function-per-file module architecture.
 *   Getter Module: engine/get/render/getShadeDarkRgb.js
 *
 * WHY THIS EXISTS:
 *   Consistent accessor for darker shade variation used in style computations.
 */

// Import render state holding color and shade parameters
import { renderState } from '@engine/state/render/stateRenderState.js';

// Ensure derived render state is refreshed before returning shade data
import { setRebuildDerivedCache } from '@engine/set/render/physics/setRebuildDerivedCache.js';


/**
 * Returns dark shade rgb array [r, g, b].
 * @returns {*} The current value from state.
 */
export function getShadeDarkRgb() {
  setRebuildDerivedCache();
  return renderState.shadeDarkRgb;
}
