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
 */

import { renderState } from '@engine/state/render/renderState.js';
import { setRebuildDerivedCache } from '@engine/set/render/physics/setRebuildDerivedCache.js';


/**
 * Returns particle color rgb array [r, g, b].
 * @returns {*} The current value from state.
 */
export function getParticleColor() {
  setRebuildDerivedCache();
  return renderState.particleColor;
}
