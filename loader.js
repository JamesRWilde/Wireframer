/**
 * loader.js - OBJ Mesh Loader and Object List Export
 * 
 * PURPOSE:
 *   Provides the primary mesh loading functionality for OBJ format files and
 *   exports the list of available 3D objects to the global scope. This module
 *   bridges the gap between static OBJ files on disk and the engine's internal
 *   mesh representation.
 * 
 * ARCHITECTURE ROLE:
 *   Loaded after registry.js but before engine modules. It imports the object
 *   list (which defines all available shapes) and the OBJ parser, then exposes
 *   a global loadObjMesh function that other modules can use to dynamically
 *   load OBJ files at runtime.
 * 
 * DATA FLOW:
 *   1. OBJ file fetched from meshes/ directory
 *   2. Raw text parsed by InitMeshEngineToRuntime() into engine format
 *   3. Parsed mesh handed to engine's InitMeshEngineLoad() for normalization
 *   4. Engine updates MODEL and UI telemetry automatically
 */

"use strict";

// Import the dynamic mesh list loader
// Fetches available .obj files from the server's /api/meshes endpoint
import { getObjectList } from './engine/get/renderEngineObjectList.js';

// Import the OBJ parser that converts raw OBJ text to engine mesh format
// This is imported explicitly (not dynamically) so it's bundled in the output
import { meshEngineToRuntime } from './engine/init/meshEngineToRuntime.js';

/**
 * loadObjMesh - Asynchronously loads and parses an OBJ file
 * 
 * @async
 * @param {string} objPath - Path to the OBJ file (relative to server root, e.g., 'meshes/cube.obj')
 * @param {string} [name] - Optional display name for the mesh (defaults to objPath)
 * @returns {Promise<Object>} The parsed mesh in engine format { V, F, E }
 * @throws {Error} If the fetch fails or the engine's InitMeshEngineLoad encounters an error
 * 
 * This function is exposed globally so it can be called from anywhere in the app,
 * including from UI event handlers or dynamic loading scenarios.
 */
globalThis.loadObjMesh = async function(objPath, name) {
  // Step 1: Fetch the OBJ file from the server
  // We use fetch() which works with both local servers and file:// protocol
  const resp = await fetch(objPath);
  
  // Check for HTTP errors (404, 500, etc.)
  if (!resp.ok) throw new Error('Failed to fetch OBJ: ' + objPath);
  
  // Step 2: Read the response as plain text
  // OBJ format is human-readable text with vertices, faces, and normals
  const objText = await resp.text();
  
  // Step 3: Parse the OBJ text into the engine's internal mesh format
  // InitMeshEngineToRuntime handles vertex/face extraction, normal computation, etc.
  // The options object provides context for error messages and format hints
  const mesh = InitMeshEngineToRuntime(objText, { meshFileName: objPath, meshType: 'OBJ' });

  // Step 4: Hand the parsed mesh to the engine for normalization and activation
  // The engine's InitMeshEngineLoad handles LOD setup, caching, and MODEL state updates
  if (globalThis.InitMeshEngineLoad) {
    try {
      // engine.InitMeshEngineLoad returns the normalized model copy and handles BASE_MODEL/LOD
      // animateMorph: true triggers a smooth morph transition to the new shape
      const result = globalThis.InitMeshEngineLoad(mesh, name || objPath, { animateMorph: true });
      
      // Fallback: InitMeshEngineLoad should set the active model itself, but older versions may not
      // This ensures backward compatibility if the engine module hasn't been updated
      if (result && typeof globalThis.setActiveModel === 'function') {
        globalThis.setActiveModel(result, name || objPath);
      }
    } catch (err) {
      // Log but don't throw - the mesh was parsed successfully even if activation failed
      // This allows the app to continue running and potentially recover
      console.error('[loadObjMesh] engine.InitMeshEngineLoad failed', err);
    }
  }

  // Return the parsed mesh regardless of activation success
  // Callers may want to inspect or cache the mesh even if it wasn't activated
  return mesh;
};

// Load the dynamic object list and expose it globally
// getObjectList() fetches from /api/meshes which scans the meshes/ directory
try {
  globalThis.OBJECTS = await getObjectList();
} catch (err) {
  console.error('[loader] Failed to load object list:', err);
  globalThis.OBJECTS = [];
}

