/**
 * objectList.js - Mesh Object Registry
 * 
 * PURPOSE:
 *   Loads the list of available 3D mesh objects from a static manifest.
 *   Provides metadata (key, display name, file path) for each mesh.
 * 
 * ARCHITECTURE ROLE:
 *   Imported by initObjectSelector and loader.js to populate the mesh dropdown.
 *   The static manifest file (meshes-manifest.json) contains the list of meshes.
 */

"use strict";

/** @type {Array<{key: string, name: string, obj: string}>|null} */
let _cache = null;

/**
 * objectList - Returns the list of available mesh objects
 * 
 * Fetches from /meshes-manifest.json and caches the result.
 * Returns a cached result on subsequent calls.
 * 
 * @returns {Promise<Array<{key: string, name: string, obj: string}>>}
 *   Array of mesh objects sorted alphabetically by key
 */
export async function objectList() {
  if (_cache !== null) return _cache;
  
  const res = await fetch('/meshes-manifest.json');
  const list = await res.json();
  list.sort((a, b) => a.key.localeCompare(b.key));
  
  _cache = list;
  return list;
}
