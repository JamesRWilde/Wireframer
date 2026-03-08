/**
 * setLoadObjMesh - Set Load Obj Mesh
 *
 * PURPOSE:
 *   Sets callback function for loading obj meshes.
 *
 * ARCHITECTURE ROLE:
 *   Part of the one-function-per-file module architecture.
 *   Setter Module: engine/set/mesh/setLoadObjMesh.js
 */

import { loadObjMeshState } from '@engine/state/mesh/loadObjMeshState.js';


/**
 * Sets callback function for loading obj meshes.
 * @param {*} fn - The value to set.
 */
export function setLoadObjMesh(fn) {
  loadObjMeshState.value = fn;
}
