/**
 * setH.js - Set Viewport Height
 *
 * PURPOSE:
 *   Stores the current viewport height in CSS pixels. Read by the rendering
 *   pipeline to set canvas dimensions, viewport uniforms, and projection.
 *
 * ARCHITECTURE ROLE:
 *   Setter for viewportState.H. Written by setSyncCanvasSize during
 *   initialization and window resize. Read by GPU and CPU renderers
 *   for viewport setup and projection calculations.
 *
 * WHY THIS EXISTS:
 *   The viewport height is needed by multiple rendering stages (canvas sizing,
 *   GPU viewport, projection matrix). This setter ensures it's stored in one
 *   shared location and updated atomically alongside the width.
 */

"use strict";

// Import the viewport state container
// Holds width, height, and projection parameters used by the renderers
import { viewportState } from '@engine/state/render/stateViewportState.js';

/**
 * setH - Stores the viewport height in CSS pixels
 * @param {number} v - The viewport height in CSS pixels
 */
export function setH(v) {
  viewportState.H = v;
}
