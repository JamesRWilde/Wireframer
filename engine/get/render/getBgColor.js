'use strict';

/**
 * getBgColor - Get Bg Color
 *
 * PURPOSE:
 *   Returns computed background color for the current theme.
 *   Ensures derived render metadata is refreshed before usage.
 *
 * ARCHITECTURE ROLE:
 *   Getter layer for render color state, isolated in one-function-per-file style.
 *   Keeps render theme details aligned with current state updates.
 *
 * WHY THIS EXISTS:
 *   Read-only access point for background color used by rendering routines.
 *   Centralizes cache rebuild trigger so dependent modules remain consistent.
 */

// Import state container for render settings
// Used by getBgColor to retrieve authoritative theme value
import { renderState } from '@engine/state/render/stateRenderState.js';

// Import utility to mark derived cache invalidated, required before reading render data
import { setRebuildDerivedCache } from '@engine/set/render/physics/setRebuildDerivedCache.js';

/**
 * Returns computed background color for the current theme.
 * @returns {*} The current value from state.
 */
export function getBgColor() {
  // Ensure derived values are recalculated if stale.
  setRebuildDerivedCache();

  // Return the canonical background color from render state.
  return renderState.bgColor;
}
