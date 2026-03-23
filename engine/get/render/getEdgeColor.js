'use strict';

/**
 * getEdgeColor - Get Edge Color
 *
 * PURPOSE:
 *   Returns computed edge color for the current theme.
 *
 * ARCHITECTURE ROLE:
 *   Part of the one-function-per-file module architecture.
 *   Getter Module: engine/get/render/getEdgeColor.js
 */

import { renderState } from '@engine/state/render/renderState.js';
import { setRebuildDerivedCache } from '@engine/set/render/physics/setRebuildDerivedCache.js';


/**
 * Returns computed edge color for the current theme.
 * @returns {*} The current value from state.
 */
export function getEdgeColor() {
  setRebuildDerivedCache();
  return renderState.edgeColor;
}
