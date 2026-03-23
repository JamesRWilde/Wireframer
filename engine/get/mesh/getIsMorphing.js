/**
 * getIsMorphing.js - Morph State Check
 * 
 * PURPOSE:
 *   Checks whether a morph animation is currently in progress. This is used
 *   by renderScene to determine whether to render the regular model or the
 *   interpolated morph mesh.
 * 
 * ARCHITECTURE ROLE:
 *   Called by renderScene each frame to decide which mesh to render.
 *   Part of the morph API exposed globally via morphApi.js.
 * 
 * WHY THIS EXISTS:
 *   Provides a minimal boolean accessor for morph status checks so render
 *   logic stays clear and decoupled from internal morph state representation.
 */

"use strict";

// Import morph state to check active flag and avoid state duplication across modules
import { morphState } from '@engine/state/mesh/stateMorph.js';

/**
 * getIsMorphing - Checks if a morph animation is in progress
 * 
 * @returns {boolean} True if a morph is currently active, false otherwise
 * 
 * Used by renderScene to determine whether to use the interpolated morph
 * mesh or the regular model for rendering.
 */
export function getIsMorphing() {
  return morphState.active;
}
