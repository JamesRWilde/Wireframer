/**
 * objectList.js - Mesh Object Registry
 * 
 * PURPOSE:
 *   Defines the list of available 3D mesh objects for user selection.
 *   Provides metadata (key, display name, file path) for each mesh.
 * 
 * ARCHITECTURE ROLE:
 *   Imported by initObjectSelector to populate the mesh dropdown.
 *   Used by loadObjMesh to resolve mesh file paths.
 * 
 * MESH FORMAT:
 *   Each entry has:
 *   - key: Filename without extension (used as identifier)
 *   - name: Human-readable title case name (for UI display)
 *   - obj: Relative path to OBJ file in meshes/ directory
 */

"use strict";

/**
 * OBJECTS - Array of available mesh objects
 * 
 * @type {Array<{key: string, name: string, obj: string}>}
 * 
 * Each object contains:
 * - key: Filename without .obj extension
 * - name: Title case display name
 * - obj: Relative path to OBJ file
 */
export const OBJECTS = [
  'capsule.obj',
  'cinquefoil-knot.obj',
  'cone.obj',
  'cube.obj',
  'cylinder.obj',
  'diamond.obj',
  'icosahedron.obj',
  'jerusalem-cube.obj',
  'menger-sponge.obj',
  'mobius-strip.obj',
  'octahedron.obj',
  'prism.obj',
  'pyramid.obj',
  'sierpinski-pyramid.obj',
  'sphere.obj',
  'spring.obj',
  'star-prism.obj',
  'torus-knot.obj',
  'torus.obj',
  'wine-glass.obj'
].map(filename => {
  // Extract key by removing .obj extension
  const key = filename.replace(/\.obj$/i, '');
  
  // Convert to Title Case for display:
  // 1. Replace hyphens with spaces
  // 2. Capitalize first letter of each word
  const name = key.replaceAll('-', ' ').replaceAll(/\b\w/g, c => c.toUpperCase());
  
  return { key, name, obj: `meshes/${filename}` };
});
