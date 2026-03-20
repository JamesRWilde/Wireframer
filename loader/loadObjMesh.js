/**
 * loadObjMesh.js - Load and Parse OBJ Mesh File
 *
 * PURPOSE:
 *   Asynchronously fetches an OBJ file, parses it into engine format,
 *   and initializes it as the active model.
 *
 * ARCHITECTURE ROLE:
 *   Primary mesh loading entry point. Called by UI when user selects a shape.
 *
 * USAGE:
 *   import { loadObjMesh } from '@loader/loadObjMesh.js';
 *   const mesh = await loadObjMesh('/meshes/cube.obj', 'Cube');
 */

"use strict";

import { objectList } from '@engine/get/render/objectList.js';
import { toRuntime } from '@engine/init/mesh/toRuntime.js';
import { getInitMeshEngineLoad } from '@engine/get/mesh/getInitMeshEngineLoad.js';
import { setActiveModel } from '@engine/set/render/physics/model.js';

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
