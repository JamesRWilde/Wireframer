/**
 * getInitMeshEngineLoad - Get Init Mesh Engine Load
 *
 * PURPOSE:
 *   Returns callback to initialize the mesh engine.
 *
 * ARCHITECTURE ROLE:
 *   Part of the one-function-per-file module architecture.
 *   Getter Module: engine/get/mesh/getInitMeshEngineLoad.js
 *
 * WHY THIS EXISTS:
 *   Provides a single guarded entry point for mesh engine startup logic,
 *   so callers don't need to access internal state nodes directly.
 */

"use strict";

// Import initialization callback state container.
import { initMeshEngineLoadState } from '@engine/state/mesh/stateInitMeshEngineLoadState.js';


/**
 * Returns callback to initialize the mesh engine.
 * @returns {*} The current value from state.
 */
export function getInitMeshEngineLoad() {
  return initMeshEngineLoadState.value;
}
