/**
 * setFillOpacity.js - Set Fill Opacity
 *
 * PURPOSE:
 *   Sets the opacity level for triangle fill rendering (0-1 range).
 *   This value modulates the transparency of the fill color when
 *   rendering the 3D model's solid surfaces.
 *
 * ARCHITECTURE ROLE:
 *   Setter for renderState.fillOpacity. Read by the GPU and CPU renderers
 *   to apply fill transparency during mesh drawing.
 *
 * WHY THIS EXISTS:
 *   Fill opacity controls how transparent the model's surfaces appear.
 *   It's set via the HUD slider and stored here so both GPU and CPU
 *   renderers can read the same value.
 */

"use strict";

// Import the render state container
// Holds rendering parameters (opacity, wire width, colors) shared by both pipelines
import { renderState } from '@engine/state/render/stateRenderState.js';

/**
 * setFillOpacity - Sets the fill opacity level
 * @param {number} v - Opacity value from 0 (transparent) to 1 (opaque)
 */
export function setFillOpacity(v) {
  renderState.fillOpacity = v;
}
