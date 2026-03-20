/**
 * loader.js - OBJ Mesh Loader and Object List Export
 * 
 * PURPOSE:
 *   Provides the primary mesh loading functionality for OBJ format files and
 *   exports the list of available 3D objects to the global scope.
 * 
 * ARCHITECTURE ROLE:
 *   Loaded after registry.js but before engine modules. It imports the object
 *   list (which defines all available shapes) and the OBJ parser, then exposes
 *   a global loadObjMesh function that other modules can use to dynamically
 *   load OBJ files at runtime.
 * 
 * DATA FLOW:
 *   1. OBJ file fetched from meshes/ directory
 *   2. Raw text parsed by toRuntime() into engine format
 *   3. Parsed mesh handed to engine's InitMeshEngineLoad() for normalization
 *   4. Engine updates MODEL and UI telemetry automatically
 */

"use strict";

import { objectList } from '@engine/get/render/objectList.js';
import { toRuntime } from '@engine/init/mesh/toRuntime.js';
import { getInitMeshEngineLoad } from '@engine/get/mesh/getInitMeshEngineLoad.js';
import { setActiveModel } from '@engine/state/render/model.js';

/**
 * loadObjMesh - Asynchronously loads and parses an OBJ file
 * 
 * @async
 * @param {string} objPath - Path to the OBJ file
 * @param {string} [name] - Optional display name for the mesh
 * @returns {Promise<Object>} The parsed mesh in engine format { V, F, E }
 */
export async function loadObjMesh(objPath, name) {
  const resp = await fetch(objPath);
  if (!resp.ok) throw new Error('Failed to fetch OBJ: ' + objPath);
  const objText = await resp.text();

  const mesh = toRuntime(objText, { meshFileName: objPath, meshType: 'OBJ' });

  const engineLoad = getInitMeshEngineLoad();
  if (engineLoad) {
    try {
      const result = engineLoad(mesh, name || objPath, { animateMorph: true });
      if (result) {
        setActiveModel(result, name || objPath);
      }
    } catch (err) {
      console.error('[loadObjMesh] engine load failed', err);
    }
  }

  return mesh;
}

export async function loadObjects() {
  try {
    return await objectList();
  } catch (err) {
    console.error('[loader] Failed to load object list:', err);
    return [];
  }
}

