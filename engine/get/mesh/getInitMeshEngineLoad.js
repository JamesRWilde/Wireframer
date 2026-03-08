/**
 * getInitMeshEngineLoad - Get Init Mesh Engine Load
 *
 * PURPOSE:
 *   Returns callback to initialize the mesh engine.
 *
 * ARCHITECTURE ROLE:
 *   Part of the one-function-per-file module architecture.
 *   Getter Module: engine/get/mesh/getInitMeshEngineLoad.js
 */

import { initMeshEngineLoadState } from '@engine/state/mesh/initMeshEngineLoadState.js';


/**
 * Returns callback to initialize the mesh engine.
 * @returns {*} The current value from state.
 */
export function getInitMeshEngineLoad() {
  return initMeshEngineLoadState.value;
}
