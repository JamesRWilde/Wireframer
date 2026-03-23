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
 *
 * WHY THIS EXISTS:
 *   Provides a single source-of-truth accessor for edge color across
 *   wireframe and fill rendering paths.
 */

// Import render state containing current edge color.
import { renderState } from '@engine/state/render/stateRenderState.js';

// Import cache invalidation triggers for derived render values.
import { setRebuildDerivedCache } from '@engine/set/render/physics/setRebuildDerivedCache.js';


/**
 * Returns computed edge color for the current theme.
 * @returns {*} The current value from state.
 */
export function getEdgeColor() {
  // Ensure derived render values are updated before returning color.
  setRebuildDerivedCache();
  return renderState.edgeColor;
}
