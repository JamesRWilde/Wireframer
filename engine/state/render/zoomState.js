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
 * DEFAULTS:
 *   - zoom: 1.0 (no zoom)
 *   - zoomMin: 0.45 (zoomed out limit)
 *   - zoomMax: 2.75 (zoomed in limit)
 */

"use strict";

// Central zoom state storage.
// This file contains ONLY mutable state variables (no functions).
export const zoomState = {
  zoom: 1,
  zoomMin: 0.45,
  zoomMax: 2.75,
};
