/**
 * setMeshClone.js - Set Mesh Clone Callback
 *
 * PURPOSE:
 *   Stores the callback function that clones a mesh (deep copies V, F, E
 *   arrays and metadata). Called during model loading to create working copies.
 *
 * ARCHITECTURE ROLE:
 *   Setter for cloneState.value. Called by the mesh engine initialization
 *   to register the mesh cloning function for deferred use.
 *
 * WHY THIS EXISTS:
 *   Mesh cloning depends on the mesh engine being initialized first.
 *   Storing the callback here allows the loading sequence to defer
 *   cloning until the engine is ready, avoiding tight coupling.
 */

"use strict";

// Import the mesh clone state container
// Holds the callback function for deep-copying mesh objects
import { cloneState } from '@engine/state/mesh/stateCloneState.js';

/**
 * setMeshClone - Stores the mesh cloning callback
 * @param {Function} fn - The callback function that deep-copies a mesh
 */
export function setMeshClone(fn) {
  cloneState.value = fn;
}
