/**
 * setModelCy.js - Set Model Center Y
 *
 * PURPOSE:
 *   Sets the model's vertical center (center-Y) for projection calculations.
 *   This offset is used by the GPU projection matrix to position the model
 *   correctly in the viewport.
 *
 * ARCHITECTURE ROLE:
 *   Setter for viewportState.MODEL_CY. Written during model initialization
 *   (initFitCameraToModel) and read by the GPU renderer for projection setup.
 *
 * WHY THIS EXISTS:
 *   The model's bounding box center-Y is needed for the projection matrix
 *   to center the model on screen. It's stored in viewportState alongside
 *   the width and height since it's a viewport-relative parameter.
 */

"use strict";

// Import the viewport state container
// Holds width, height, and projection parameters used by the renderers
import { viewportState } from '@engine/state/render/stateViewportState.js';

/**
 * setModelCy - Stores the model's vertical center for projection
 * @param {number} v - The model's center-Y coordinate in world space
 */
export function setModelCy(v) {
  viewportState.MODEL_CY = v;
}
