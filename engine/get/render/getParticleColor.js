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
import { rebuildDerivedCache } from '@engine/set/render/physics/rebuildDerivedCache.js';


/**
 * Returns particle color rgb array [r, g, b].
 * @returns {*} The current value from state.
 */
export function getParticleColor() {
  rebuildDerivedCache();
  return renderState.particleColor;
}
