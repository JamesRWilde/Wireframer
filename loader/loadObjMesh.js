'use strict';
import { toRuntimeMesh } from '../engine/mesh-parsing.js';

/**
 * Loads an OBJ file from the specified path, parses it, and returns a runtime mesh.
 * @param {string} objPath - Path to the OBJ file to load
 * @param {string} name - Name of the mesh
 * @returns {Promise<Object>} Promise that resolves to a runtime mesh object
 * @throws {Error} If the fetch fails or parsing encounters an error
 */
export async function loadObjMesh(objPath, name) {
  const resp = await fetch(objPath);
  if (!resp.ok) throw new Error('Failed to fetch OBJ: ' + objPath);
  const objText = await resp.text();
  return toRuntimeMesh(objText, { meshFileName: objPath, meshType: 'OBJ' });
}
