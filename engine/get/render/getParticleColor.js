'use strict';

/**
 * getParticleColor - Get Particle Color
 *
 * PURPOSE:
 *   Returns particle color rgb array [r, g, b].
 *
 * ARCHITECTURE ROLE:
 *   Part of the one-function-per-file module architecture.
 *   Getter Module: engine/get/render/getParticleColor.js
 *
 * WHY THIS EXISTS:
 *   Provides a consistent accessor for particle shader/color routines and ensures
 *   derived state is refreshed before reads.
 */

// Import render state containing particle color values.
import { renderState } from '@engine/state/render/stateRenderState.js';

// Import derived cache invalidation utility.
import { setRebuildDerivedCache } from '@engine/set/render/physics/setRebuildDerivedCache.js';


/**
 * Returns particle color rgb array [r, g, b].
 * @returns {*} The current value from state.
 */
export function getParticleColor() {
  // Ensure color is up-to-date before returning.
  setRebuildDerivedCache();
  return renderState.particleColor;
}
