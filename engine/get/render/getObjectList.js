/**
 * getObjectList.js - Mesh Object Registry
 * 
 * PURPOSE:
 *   Loads the list of available 3D mesh objects from a static manifest.
 *   Provides metadata (key, display name, file path) for each mesh.
 * 
 * ARCHITECTURE ROLE:
 *   Used by the UI object selector and loader to present available meshes.
 *   Non-blocking async getter in engine/get layer.
 * 
 * WHY THIS EXISTS:
 *   Avoids duplicate fetch logic and ensures a single cached source of object
 *   metadata for consistent object browsing and selection.
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
