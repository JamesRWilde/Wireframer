/**
 * objectList.js - Mesh Object Registry
 * 
 * PURPOSE:
 *   Dynamically loads the list of available 3D mesh objects by scanning
 *   the meshes/ directory via the server's /api/meshes endpoint.
 *   Provides metadata (key, display name, file path) for each mesh.
 * 
 * ARCHITECTURE ROLE:
 *   Imported by initObjectSelector and loader.js to populate the mesh dropdown.
 *   The server scans the meshes/ directory and returns all .obj files.
 * 
 * USAGE:
 *   import { getObjectList } from './objectList.js';
 *   const objects = await getObjectList();
 */

"use strict";

/** @type {Array<{key: string, name: string, obj: string}>|null} */
let _cache = null;

/** @type {Promise|null} */
let _pending = null;

/**
 * getObjectList - Fetches the list of available mesh objects from the server
 * 
 * Returns a cached result on subsequent calls. The server scans the meshes/
 * directory and returns all .obj files with transformed display names.
 * 
 * @returns {Promise<Array<{key: string, name: string, obj: string}>>}
 *   Array of mesh objects sorted alphabetically by key
 */
export function getObjectList() {
  // Return cached result immediately
  if (_cache) return Promise.resolve(_cache);
  
  // Return in-flight request if one is already pending
  if (_pending) return _pending;
  
  // Fetch from server endpoint
  _pending = fetch('/api/meshes')
    .then(resp => {
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      return resp.json();
    })
    .then(list => {
      _cache = list;
      _pending = null;
      return list;
    })
    .catch(err => {
      console.warn('[objectList] Failed to load mesh list from server:', err.message);
      _cache = [];
      _pending = null;
      return [];
    });
  
  return _pending;
}
