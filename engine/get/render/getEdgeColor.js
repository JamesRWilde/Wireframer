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
import { rebuildDerivedCache } from '@engine/set/render/physics/rebuildDerivedCache.js';


/**
 * Returns computed edge color for the current theme.
 * @returns {*} The current value from state.
 */
export function getEdgeColor() {
  rebuildDerivedCache();
  return renderState.edgeColor;
}
