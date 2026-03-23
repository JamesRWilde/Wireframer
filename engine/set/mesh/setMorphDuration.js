/**
 * setMorphDuration.js - Set Morph Animation Duration
 *
 * PURPOSE:
 *   Sets the duration of morph animations in milliseconds. This value
 *   controls how long a morph transition takes from start to finish.
 *
 * ARCHITECTURE ROLE:
 *   Setter for morphState.durationMs. Called during morph system
 *   initialization and can be updated at runtime via the morph API.
 *
 * WHY THIS EXISTS:
 *   Different morph animations may require different durations. Storing
 *   the duration in shared state allows the render loop to read it
 *   without threading it through every animation frame.
 */

"use strict";

// Import the morph animation state container
// Holds the morph API function and animation parameters
import { morphState } from '@engine/state/mesh/stateMorphState.js';

/**
 * setMorphDuration - Stores the morph animation duration
 * @param {number} ms - Duration in milliseconds (e.g. 1600 for 1.6 seconds)
 */
export function setMorphDuration(ms) {
  morphState.durationMs = ms;
}
