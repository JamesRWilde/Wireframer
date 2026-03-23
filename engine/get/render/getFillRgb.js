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
 *
 * WHY THIS EXISTS:
 *   Provides consistent color lookup for fill drawing algorithms while
 *   ensuring derived state remains synced.
 */

// Import render color state.
import { renderState } from '@engine/state/render/stateRenderState.js';

// Import derived cache refresh handler for color values.
import { setRebuildDerivedCache } from '@engine/set/render/physics/setRebuildDerivedCache.js';


/**
 * Returns computed fill rgb array [r, g, b].
 * @returns {*} The current value from state.
 */
export function getFillRgb() {
  // Force refresh of derived color data before returning.
  setRebuildDerivedCache();
  return renderState.fillRgb;
}
