/**
 * getCurrentMorphMesh.js - Current Morph Mesh Accessor
 * 
 * PURPOSE:
 *   Returns the current interpolated mesh during a morph animation. This is
 *   called by renderScene to get the mesh to render each frame while a morph
 *   is in progress.
 * 
 * ARCHITECTURE ROLE:
 *   Called by renderScene each frame to determine which mesh to render.
 *   Part of the morph API exposed globally via initMorphApi.js.
 * 
 * WHY SEPARATE:
 *   This accessor provides a clean interface for checking morph state and
 *   getting the current mesh without exposing internal state details.
 */

"use strict";

// Import morph state to check if morph is active
import { morphState } from '../state/meshMorphState.js';

/**
 * getCurrentMorphMesh - Gets the current interpolated mesh
 * 
 * @returns {Object|null} The current interpolated mesh, or null if no morph is active
 * 
 * During a morph animation, this returns the intermediate mesh at the current
 * progress point. When no morph is active, returns null so renderScene knows
 * to use the regular model.
 */
export function getCurrentMorphMesh() {
  // Return current mesh if morph is active, otherwise null
  if (morphState.active) return morphState.currentMesh;
  return null;
}
