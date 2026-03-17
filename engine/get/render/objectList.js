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
 *   import {objectList}from '@engine/get/render/objectList.js';
 *   const objects = await objectList();
 */

"use strict";

/** @type {Array<{key: string, name: string, obj: string}>|null} */
let _cache = null;

/**
 * objectList - Returns the list of available mesh objects
 * 
 * Fetches from /api/meshes endpoint and caches the result.
 * Returns a cached result on subsequent calls.
 * 
 * @returns {Promise<Array<{key: string, name: string, obj: string}>>}
 *   Array of mesh objects sorted alphabetically by key
 */
export async function objectList() {
  if (_cache !== null) return _cache;
  
  const res = await fetch('/api/meshes');
  const list = await res.json();
  list.sort((a, b) => a.key.localeCompare(b.key));
  
  _cache = list;
  return list;
}
