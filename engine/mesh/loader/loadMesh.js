"use strict";
import { filterValidEdges } from './filterValidEdges.js';
import { validateMesh } from './validateMesh.js';
import { setLodRangeForModel } from './setLodRangeForModel.js';
import { fitCameraToModel } from './fitCameraToModel.js';
import { finalizeModel } from './finalizeModel.js';
// helper for building edges from face lists; register globally so any
// consumer (loader, parser, LOD code) can invoke it without circular imports.
import { buildEdgesFromFacesRuntime } from '../utils/mesh-utilities/buildEdgesFromFacesRuntime.js';
if (!globalThis.buildEdgesFromFacesRuntime) {
  globalThis.buildEdgesFromFacesRuntime = buildEdgesFromFacesRuntime;
}

export function loadMesh(mesh, name = 'Shape', options = {}) {
  console.debug('[loadMesh] called', name, 'mesh', mesh?.V?.length, 'vertices');
  const {
    animateMorph = false,
    detailPercent = 1,
    meshFileName,
    meshType = 'OBJ',
  } = options || {};

  validateMesh(mesh, name, meshFileName, meshType);

  const V = mesh.V;
  const F = mesh.F;
  const E = globalThis.buildEdgesFromFacesRuntime ? globalThis.buildEdgesFromFacesRuntime(F) : [];

  const newModel = {
    V,
    F,
    E: filterValidEdges(E, V),
    _meshFormat: 'obj-style',
    _shadingMode: 'auto',
    _creaseAngleDeg: undefined,
  };
  console.debug('[loadMesh] built model', name, 'V=', V.length, 'F=', F.length, 'E=', newModel.E.length);

  setLodRangeForModel(newModel);

  const clampedDetail = Math.max(0, Math.min(1, Number(detailPercent) || 1));

  const newModelCopy = globalThis.cloneMesh ? globalThis.cloneMesh(newModel) : newModel;

  fitCameraToModel(newModel);

  finalizeModel(newModelCopy, animateMorph, name, clampedDetail);

  // make this mesh the current model so rendering/UI reflect the new object
  if (typeof globalThis.setActiveModel === 'function') {
    try {
      globalThis.setActiveModel(newModelCopy, name);
    } catch (err) {
      console.warn('[loadMesh] setActiveModel failed', err);
    }
  }

  return newModelCopy;
}

// expose for engine modules
globalThis.loadMesh = loadMesh;
