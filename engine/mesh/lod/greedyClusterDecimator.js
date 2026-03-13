import { deepCopyMesh } from './deepCopyMesh.js';
import { normalizeFaces } from './normalizeFaces.js';
import { computeBoundingBox } from './computeBoundingBox.js';
import { computeClusterParams } from './computeClusterParams.js';
import { assignVerticesToCells } from './assignVerticesToCells.js';
import { clusterVertices } from './clusterVertices.js';
import { rebuildFaces } from './rebuildFaces.js';
import { pruneLodCache } from './pruneLodCache.js';

export function greedyClusterDecimator(model, targetFaces) {
  const cacheKey = `${model.V.length}:${targetFaces}`;
  if (!model._lodCache) model._lodCache = new Map();
  if (model._lodCache.has(cacheKey)) {
    return deepCopyMesh(model._lodCache.get(cacheKey));
  }

  const V = model.V;
  const F = normalizeFaces(model.F);

  const { minX, minY, minZ, extent } = computeBoundingBox(V);
  const { cellSize } = computeClusterParams(targetFaces, extent);

  const cellMap = assignVerticesToCells(V, minX, minY, minZ, cellSize);
  const { newVerts, oldToNew } = clusterVertices(V, cellMap);
  const newFaces = rebuildFaces(F, oldToNew);

  const newEdges = globalThis.buildEdgesFromFacesRuntime?.(newFaces) ?? [];
  const decimated = {
    V: newVerts,
    F: newFaces,
    E: newEdges,
    _meshFormat: model._meshFormat,
    _shadingMode: model._shadingMode,
    _creaseAngleDeg: model._creaseAngleDeg,
  };

  model._lodCache.set(cacheKey, decimated);
  pruneLodCache(model._lodCache, 12);

  return deepCopyMesh(decimated);
}
