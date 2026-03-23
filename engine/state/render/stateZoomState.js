/**
 * zoomState.js - Camera Zoom State
 *
 * PURPOSE:
 *   Centralized state for camera zoom level and its clamping bounds.
 *   Provides getters and setters so consumers use module state directly.
 *
 * ARCHITECTURE ROLE:
 *   Single source of truth for zoom state. The render pipeline reads the
 *   zoom value to compute field-of-view. Input handlers write zoom on wheel
 *   events. FitCamera writes zoom + bounds after model load.
 *
 * WHY THIS EXISTS:
 *   Completes header standardization and clarifies zoom state responsibilities
 *   for future refactors.
 *
 * DEFAULTS:
 *   - zoom: 1.0 (no zoom)
 *   - zoomMin: 0.45 (zoomed out limit)
 *   - zoomMax: 2.75 (zoomed in limit)
 */

"use strict";

/** Centralized zoom state storage. */
export const zoomState = {
  zoom: 1,
  zHalf: 0,
  zoomMin: 0.45,
  zoomMax: 2.75,
};

// This file stores only zoom state and does not export any accessors.
// Getters and setters are implemented in dedicated one-function-per-file
// modules in engine/get/render and engine/set/render.

// End of stateZoomState.js

