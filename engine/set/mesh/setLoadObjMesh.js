/**
 * setLoadObjMesh.js - Set OBJ Mesh Loader Callback
 *
 * PURPOSE:
 *   Stores the callback function that loads and parses OBJ mesh files.
 *   Called during app startup, then retrieved when the user selects a shape.
 *
 * ARCHITECTURE ROLE:
 *   Setter for loadObjMeshState.value. The actual OBJ loading logic lives
 *   in the mesh engine; this setter stores the function pointer for deferred
 *   invocation during shape selection.
 *
 * WHY THIS EXISTS:
 *   The OBJ loader depends on the mesh engine being initialized first.
 *   Storing the callback here allows the loading sequence to defer
 *   initialization and avoid tight coupling between startup phases.
 */

"use strict";

// Import the OBJ mesh loader state container
// Holds the callback function for loading and parsing .obj files
import { loadObjMeshState } from '@engine/state/mesh/stateLoadObjMeshState.js';

/**
 * setLoadObjMesh - Stores the OBJ mesh loading callback
 * @param {Function} fn - The callback function that loads and parses OBJ meshes
 */
export function setLoadObjMesh(fn) {
  loadObjMeshState.value = fn;
}
