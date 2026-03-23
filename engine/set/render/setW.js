/**
 * setW.js - Set Viewport Width
 *
 * PURPOSE:
 *   Stores the current viewport width in CSS pixels. Read by the rendering
 *   pipeline to set canvas dimensions, viewport uniforms, and projection.
 *
 * ARCHITECTURE ROLE:
 *   Setter for viewportState.W. Written by setSyncCanvasSize during
 *   initialization and window resize. Read by GPU and CPU renderers
 *   for viewport setup and projection calculations.
 *
 * WHY THIS EXISTS:
 *   The viewport width is needed by multiple rendering stages (canvas sizing,
 *   GPU viewport, projection matrix). This setter ensures it's stored in one
 *   shared location and updated atomically alongside the height.
 */

"use strict";

// Import the viewport state container
// Holds width, height, and projection parameters used by the renderers
import { viewportState } from '@engine/state/render/stateViewportState.js';

/**
 * setW - Stores the viewport width in CSS pixels
 * @param {number} v - The viewport width in CSS pixels
 */
export function setW(v) {
  viewportState.W = v;
}
