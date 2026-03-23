/**
 * setMorph.js - Set Morph Animation API
 *
 * PURPOSE:
 *   Stores the morph animation API function that defines how vertices
 *   interpolate between two states. Called during morph system initialization.
 *
 * ARCHITECTURE ROLE:
 *   Setter for morphState.api. The morph function is provided by the
 *   mesh engine's animation module and stored here for the render loop.
 *
 * WHY THIS EXISTS:
 *   The morph animation function depends on the mesh engine being fully
 *   initialized. Storing it here decouples the animation module from the
 *   startup sequence.
 */

"use strict";

// Import the morph animation state container
// Holds the morph API function and animation parameters
import { morphState } from '@engine/state/mesh/stateMorphState.js';

/**
 * setMorph - Stores the morph animation API function
 * @param {Object} api - The morph API object with interpolation functions
 */
export function setMorph(api) {
  morphState.api = api;
}
