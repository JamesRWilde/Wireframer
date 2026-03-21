/**
 * getLoadObjMesh - Get Load Obj Mesh
 *
 * PURPOSE:
 *   Returns callback function for loading obj meshes.
 *
 * ARCHITECTURE ROLE:
 *   Part of the one-function-per-file module architecture.
 *   Getter Module: engine/get/mesh/getLoadObjMesh.js
 */

import { loadObjMeshState } from '@engine/state/mesh/loadObjMeshState.js';


/**
 * Returns callback function for loading obj meshes.
 * @returns {*} The current value from state.
 */
export function getLoadObjMesh() {
  return loadObjMeshState.value;
}
