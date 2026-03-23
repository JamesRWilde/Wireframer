/**
 * setInitMeshEngineLoad - Set Init Mesh Engine Load
 *
 * PURPOSE:
 *   Sets callback to initialize the mesh engine.
 *
 * ARCHITECTURE ROLE:
 *   Part of the one-function-per-file module architecture.
 *   Setter Module: engine/set/mesh/setInitMeshEngineLoad.js
 */

import { initMeshEngineLoadState } from '@engine/state/mesh/stateInitMeshEngineLoadState.js';


/**
 * Sets callback to initialize the mesh engine.
 * @param {*} fn - The value to set.
 */
export function setInitMeshEngineLoad(fn) {
  initMeshEngineLoadState.value = fn;
}
