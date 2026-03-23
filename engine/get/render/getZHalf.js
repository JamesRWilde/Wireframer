/**
 * getZHalf.js - Zoom state getter
 *
 * PURPOSE:
 *   Reads zoom state property zHalf.
 *
 * ARCHITECTURE ROLE:
 *   Used by render and input code for current zoom values.
 *
 * WHY THIS EXISTS:
 *   Single-function-per-file getter impl.
 */

"use strict";

import { zoomState } from '@engine/state/render/stateZoomState.js';

export function getZHalf() {
  return zoomState.zHalf;
}
