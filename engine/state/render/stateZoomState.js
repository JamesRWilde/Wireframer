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

// --- Getters ---

/** Returns zHalf. */
export function getZHalf() { return zoomState.zHalf; }

/** Returns camera zoom level. */
export function getZoom() { return zoomState.zoom; }

/** Returns minimum zoom level. */
export function getZoomMax() { return zoomState.zoomMax; }

/** Returns maximum zoom level. */
export function getZoomMin() { return zoomState.zoomMin; }

// --- Setters ---

/** Sets zHalf. */
export function setZHalf(value) { zoomState.zHalf = value; }

/** Sets camera zoom level. */
export function setZoom(value) { zoomState.zoom = value; }

/** Sets minimum zoom level. */
export function setZoomMax(value) { zoomState.zoomMax = value; }

/** Sets maximum zoom level. */
export function setZoomMin(value) { zoomState.zoomMin = value; }
