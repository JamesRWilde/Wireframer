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

/** @type {number} Current zoom level */
let _zoom = 1;

/** @type {number} Minimum allowed zoom */
let _zoomMin = 0.45;

/** @type {number} Maximum allowed zoom */
let _zoomMax = 2.75;

// ══════════════════════════════════════════════
// Getters
// ══════════════════════════════════════════════

/** @returns {number} Current zoom level */
export function getZoom() { return _zoom; }

/** @returns {number} Minimum allowed zoom */
export function getZoomMin() { return _zoomMin; }

/** @returns {number} Maximum allowed zoom */
export function getZoomMax() { return _zoomMax; }

// ══════════════════════════════════════════════
// Setters
// ══════════════════════════════════════════════

/** @param {number} v - Current zoom level */
export function setZoom(v) { _zoom = v; }

/** @param {number} v - Minimum allowed zoom */
export function setZoomMin(v) { _zoomMin = v; }

/** @param {number} v - Maximum allowed zoom */
export function setZoomMax(v) { _zoomMax = v; }
