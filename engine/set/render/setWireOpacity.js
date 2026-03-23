/**
 * setWireOpacity.js - Set Wire Opacity
 *
 * PURPOSE:
 *   Sets the opacity level for wireframe line rendering (0-1 range).
 *   This value modulates the transparency of the wireframe edges
 *   when rendering the 3D model's wire mesh.
 *
 * ARCHITECTURE ROLE:
 *   Setter for renderState.wireOpacity. Read by the GPU and CPU renderers
 *   to apply wire transparency during mesh drawing.
 *
 * WHY THIS EXISTS:
 *   Wire opacity controls how visible the wireframe edges appear.
 *   It's set via the HUD slider and stored here so both GPU and CPU
 *   renderers can read the same value.
 */

"use strict";

// Import the render state container
// Holds rendering parameters (opacity, wire width, colors) shared by both pipelines
import { renderState } from '@engine/state/render/stateRenderState.js';

/**
 * setWireOpacity - Sets the wireframe opacity level
 * @param {number} v - Opacity value from 0 (transparent) to 1 (opaque)
 */
export function setWireOpacity(v) {
  renderState.wireOpacity = v;
}
