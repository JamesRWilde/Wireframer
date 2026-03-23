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
 */

import { renderState } from '@engine/state/render/renderState.js';
import { setRebuildDerivedCache } from '@engine/render/physics/setRebuildDerivedCache.js';


/**
 * Returns dark shade rgb array [r, g, b].
 * @returns {*} The current value from state.
 */
export function getShadeDarkRgb() {
  setRebuildDerivedCache();
  return renderState.shadeDarkRgb;
}
