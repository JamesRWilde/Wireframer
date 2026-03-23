/**
 * getCurrentMorph.js - Current Morph Mesh Accessor
 * 
 * PURPOSE:
 *   Returns the current interpolated mesh during a morph animation.
 *   This is called by renderScene to choose frame-by-frame morph output.
 * 
 * ARCHITECTURE ROLE:
 *   Called by renderScene each frame to decide whether to render morph mesh.
 *   Part of the morph API contract in engine/get/mesh.
 * 
 * WHY THIS EXISTS:
 *   Provides a focused getter that abstracts morph state and protects from
 *   direct state access, ensuring consistency in render consumer code.
 */

"use strict";

// Import morph state to determine active morph and output mesh pointer
import { morphState } from '@engine/state/mesh/stateMorph.js';

/**
 * currentMorph - Gets the current interpolated mesh
 * 
 * @returns {Object|null} The current interpolated mesh, or null if no morph is active
 * 
 * During a morph animation, returns intermediate mesh at current progress point.
 * When no morph is active, returns null for fallback to base geometry.
 */
export function getCurrentMorph() {
  // Return current mesh if morph is active, otherwise null
  if (morphState.active) return morphState.currentMesh;
  return null;
}
