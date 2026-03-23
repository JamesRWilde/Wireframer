/**
 * setInitMeshEngineLoad.js - Set Mesh Engine Initialization Callback
 *
 * PURPOSE:
 *   Stores the callback function that initializes the mesh engine (OBJ parser,
 *   edge builders, morph system). Called during startup after mesh engine load.
 *
 * ARCHITECTURE ROLE:
 *   Setter for initMeshEngineLoadState.value. Called by mesh.js to store the
 *   initialization callback, retrieved by the loading sequence when needed.
 *
 * WHY THIS EXISTS:
 *   The mesh engine initialization is deferred until after the core engine
 *   is ready. This setter stores the callback so the startup sequence can
 *   invoke it at the right time without tight coupling.
 */

"use strict";

// Import the mesh engine load state container
// Holds the callback function for initializing the mesh engine
import { initMeshEngineLoadState } from '@engine/state/mesh/stateInitMeshEngineLoadState.js';

/**
 * setInitMeshEngineLoad - Stores the mesh engine initialization callback
 * @param {Function} fn - The callback function that initializes the mesh engine
 */
export function setInitMeshEngineLoad(fn) {
  initMeshEngineLoadState.value = fn;
}
