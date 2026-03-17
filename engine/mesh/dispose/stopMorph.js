/**
 * stopMorph.js - Morph Animation Cancellation
 * 
 * PURPOSE:
 *   Stops the current morph animation immediately. This is used when a new
 *   morph should start before the current one completes, or when the user
 *   wants to cancel an in-progress animation.
 * 
 * ARCHITECTURE ROLE:
 *   Part of the morph API exposed globally via initMorphApi.js. Can be
 *   called to interrupt a morph animation.
 * 
 * WHY SEPARATE:
 *   Provides a clean way to cancel morphs without needing to manipulate
 *   internal state directly. This is safer and more maintainable.
 */

"use strict";

// Import morph state to update active flag
import { morphState } from '../state/meshMorphState.js';

/**
 * stopMorph - Stops the current morph animation
 * 
 * This function:
 * 1. Marks the morph as inactive
 * 2. Clears the current mesh reference
 * 
 * Note: This does NOT invoke the onComplete callback, as the morph
 * was cancelled rather than completed naturally.
 */
export function stopMorph() {
  // Mark morph as inactive
  morphState.active = false;
  
  // Clear current mesh reference
  morphState.currentMesh = null;
}