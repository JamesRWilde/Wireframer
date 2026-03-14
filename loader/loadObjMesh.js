"use strict";

import { toRuntimeMesh } from '../engine/mesh-parsing.js';

/**
 * loadObjMesh.js - OBJ File Loader
 *
 * PURPOSE:
 *   Loads an OBJ file from the network, parses it into the engine's runtime mesh
 *   representation, and returns it as a Promise.
 *
 * ARCHITECTURE ROLE:
 *   Used by the loader system to convert static OBJ assets into runtime meshes
 *   that the rendering engine can operate on.
 *
 * DATA FORMAT:
 *   - OBJ text is parsed into a runtime mesh object containing vertex, face, and
 *     normal data in the format expected by the engine.
 *
 * @param {string} objPath - Path to the OBJ file to load
 * @param {string} name - Name of the mesh (for logging/display)
 * @returns {Promise<Object>} Promise that resolves to a runtime mesh object
 * @throws {Error} If the fetch fails or parsing encounters an error
 */
export async function loadObjMesh(objPath, name) {
  const resp = await fetch(objPath);
  if (!resp.ok) throw new Error('Failed to fetch OBJ: ' + objPath);
  const objText = await resp.text();
  return toRuntimeMesh(objText, { meshFileName: objPath, meshType: 'OBJ' });
}
