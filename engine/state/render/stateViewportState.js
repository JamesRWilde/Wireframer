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

// Single source of truth for viewport values.
export const viewportState = {
  W: 0,
  H: 0,
  MODEL_CY: 0,
  Z_HALF: 1,
};
