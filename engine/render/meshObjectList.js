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
 *   import { getObjectList } from './meshObjectList.js';
 *   const objects = await getObjectList();
 */

"use strict";

/** @type {Array<{key: string, name: string, obj: string}>|null} */
let _cache = null;

/** @type {Promise|null} */
let _pending = null;

/**
 * getObjectList - Returns the list of available mesh objects
 * 
 * Returns a cached result on subsequent calls.
 * 
 * @returns {Promise<Array<{key: string, name: string, obj: string}>>}
 *   Array of mesh objects sorted alphabetically by key
 */
export function getObjectList() {
  if (_cache !== null) return Promise.resolve(_cache);
  
  // Static mesh list (no server API needed for static hosting)
  const meshes = [
    "airplane.obj", "capsule.obj", "cinquefoil-knot.obj", "cone.obj",
    "cube.obj", "cylinder.obj", "diamond.obj", "drone.obj",
    "icosahedron.obj", "jerusalem-cube.obj", "menger-sponge.obj",
    "mobius-strip.obj", "octahedron.obj", "prism.obj", "pyramid.obj",
    "sierpinski-pyramid.obj", "sphere.obj", "spring.obj", "star-prism.obj",
    "torus-knot.obj", "torus.obj", "tree.obj", "wine-glass.obj"
  ];
  
  const list = meshes
    .map(f => ({
      key: f.replace(/\.obj$/, ''),
      name: f.replace(/\.obj$/, '').replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      obj: `/meshes/${f}`
    }))
    .sort((a, b) => a.key.localeCompare(b.key));
  
  _cache = list;
  return Promise.resolve(list);
}
