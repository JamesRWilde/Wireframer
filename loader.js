'use strict';
import { OBJECTS } from './loader/objectList.js';
import { toRuntimeMesh } from './engine/mesh/parsing/toRuntimeMesh.js';

// Utility to load OBJ file and parse; parser is imported explicitly so its
// code is bundled. After parsing we hand the mesh to the engine loader which
// will update MODEL and UI telemetry.
globalThis.loadObjMesh = async function(objPath, name) {
  const resp = await fetch(objPath);
  if (!resp.ok) throw new Error('Failed to fetch OBJ: ' + objPath);
  const objText = await resp.text();
  const mesh = toRuntimeMesh(objText, { meshFileName: objPath, meshType: 'OBJ' });

  if (globalThis.loadMesh) {
    try {
      // engine.loadMesh returns the normalized model copy and handles BASE_MODEL/LOD
      const result = globalThis.loadMesh(mesh, name || objPath, { animateMorph: true });
      // loadMesh now sets the active model itself, but older versions may not
      if (result && typeof globalThis.setActiveModel === 'function') {
        globalThis.setActiveModel(result, name || objPath);
      }
    } catch (err) {
      console.error('[loadObjMesh] engine.loadMesh failed', err);
    }
  }

  return mesh;
};

globalThis.OBJECTS = OBJECTS;

