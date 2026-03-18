/**
 * viewportState.js - Canvas and Viewport Dimensions
 *
 * PURPOSE:
 *   Centralized state for canvas/viewport width and height, plus projection
 *   parameters (MODEL_CY, Z_HALF) that depend on the loaded model.
 *
 * ARCHITECTURE ROLE:
 *   Single source of truth for rendering dimensions. Written by canvas init
 *   and resize handlers; read by projection, clearing, and GPU setup code.
 *
 * DEFAULTS:
 *   - W/H: Set from window.innerWidth/innerHeight during canvas init
 *   - MODEL_CY: 0 (model centred at origin per sphere law)
 *   - Z_HALF: 1 (unit sphere radius = 1)
 */

"use strict";

/** @type {number} Canvas/viewport width in pixels */
let _W = 0;

/** @type {number} Canvas/viewport height in pixels */
let _H = 0;

/** @type {number} Model vertical center for projection */
let _MODEL_CY = 0;

/** @type {number} Half-depth for depth calculations */
let _Z_HALF = 1;

// ══════════════════════════════════════════════
// Getters
// ══════════════════════════════════════════════

/** @returns {number} Canvas/viewport width */
export function getW() { return _W; }

/** @returns {number} Canvas/viewport height */
export function getH() { return _H; }

/** @returns {number} Model vertical center for projection */
export function getModelCy() { return _MODEL_CY; }

/** @returns {number} Half-depth for depth calculations */
export function getZHalf() { return _Z_HALF; }

// ══════════════════════════════════════════════
// Setters
// ══════════════════════════════════════════════

/** @param {number} w - Canvas/viewport width */
export function setW(w) { _W = w; }

/** @param {number} h - Canvas/viewport height */
export function setH(h) { _H = h; }

/** @param {number} cy - Model vertical center */
export function setModelCy(cy) { _MODEL_CY = cy; }

/** @param {number} z - Half-depth value */
export function setZHalf(z) { _Z_HALF = z; }
