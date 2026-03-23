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
 *
 * WHY THIS EXISTS:
 *   Allow rendering paths to sample the active background color in normalized
 *   RGB form in a single, encapsulated accessor.
 */

// Import render state that holds all resolved background color values
import { renderState } from '@engine/state/render/stateRenderState.js';

// Import utility that ensures derived render values are recalculated
import { setRebuildDerivedCache } from '@engine/set/render/physics/setRebuildDerivedCache.js';


/**
 * Returns computed background rgb array [r, g, b].
 * @returns {*} The current value from state.
 */
export function getBgRgb() {
  // Ensure any stale derivations are refreshed before reading value.
  setRebuildDerivedCache();

  // Return the canonical background RGB used by render pipelines.
  return renderState.bgRgb;
}
