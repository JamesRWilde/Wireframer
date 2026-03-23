/**
 * setZoom.js - Zoom state setter
 *
 * PURPOSE:
 *   Updates zoom state property zoom.
 *
 * ARCHITECTURE ROLE:
 *   Used by init and interaction code for zoom changes.
 *
 * WHY THIS EXISTS:
 *   Single-function-per-file setter impl.
 */

"use strict";

import { zoomState } from '@engine/state/render/stateZoomState.js';

export function setZoom(value) {
  zoomState.zoom = value;
}
