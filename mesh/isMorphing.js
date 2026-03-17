/**
 * isMorphing.js - Morph State Check
 * 
 * PURPOSE:
 *   Checks whether a morph animation is currently in progress. This is used
 *   by renderScene to determine whether to render the regular model or the
 *   interpolated morph mesh.
 * 
 * ARCHITECTURE ROLE:
 *   Called by renderScene each frame to decide which mesh to render.
 *   Part of the morph API exposed globally via initMorphApi.js.
 * 
 * WHY SEPARATE:
 *   This simple accessor provides a clean boolean check without exposing
 *   internal state details. It's more readable than checking morphState.active
 *   directly throughout the codebase.
 */

"use strict";

// Import morph state to check active flag
import { morphState } from './morphState.js';

/**
 * isMorphing - Checks if a morph animation is in progress
 * 
 * @returns {boolean} True if a morph is currently active, false otherwise
 * 
 * Used by renderScene to determine whether to use the interpolated morph
 * mesh or the regular model for rendering.
 */
export function isMorphing() {
  return morphState.active;
}
