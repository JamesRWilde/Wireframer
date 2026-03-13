import { deepCopyMesh } from './deepCopyMesh.js';

export function greedyClusterDecimator(model, targetFaces) {
    const cacheKey = `${model.V.length}:${targetFaces}`;
    if (!model._lodCache) model._lodCache = new Map();
    if (model._lodCache.has(cacheKey)) {
        return deepCopyMesh(model._lodCache.get(cacheKey));
    }
    const V = model.V;
    // Support both array-of-arrays and array-of-objects with .indices
    const F = Array.isArray(model.F) && typeof model.F[0] === 'object' && model.F[0].indices ? model.F.map(f => f.indices) : model.F;
    // Bounding box
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;
    for (const [x, y, z] of V) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      if (z < minZ) minZ = z;
      if (z > maxZ) maxZ = z;
    }
    const extent = Math.max(maxX - minX, maxY - minY, maxZ - minZ) || 1;
    // Choose cluster resolution proportional to target faces
    const clusterCount = Math.max(2, Math.cbrt(targetFaces * 2));
    const cellSize = extent / clusterCount;
    const cellMap = new Map();

    function cellKey(x, y, z) {
      const gx = Math.floor((x - minX) / cellSize);
      const gy = Math.floor((y - minY) / cellSize);
      const gz = Math.floor((z - minZ) / cellSize);
      return `${gx},${gy},${gz}`;
    }

    // Assign vertices to cells
    for (let i = 0; i < V.length; i++) {
      const key = cellKey(V[i][0], V[i][1], V[i][2]);
      if (!cellMap.has(key)) cellMap.set(key, []);
      cellMap.get(key).push(i);
    }

    const oldToNew = new Map();
    const newVerts = [];
    for (const [key, indices] of cellMap.entries()) {
      if (!indices.length) continue;
      let sx = 0, sy = 0, sz = 0;
      for (const idx of indices) {
        sx += V[idx][0]; sy += V[idx][1]; sz += V[idx][2];
      }
      const newIdx = newVerts.length;
      newVerts.push([sx / indices.length, sy / indices.length, sz / indices.length]);
      for (const idx of indices) oldToNew.set(idx, newIdx);
    }

    // Rebuild faces and drop degenerate triangles
    const newFaces = [];
    for (const face of F) {
      const tri = face.map(idx => oldToNew.get(idx));
      if (tri.includes(undefined)) continue;
      if ((new Set(tri)).size === 3) newFaces.push(tri);
    }

    const newEdges = window.buildEdgesFromFacesRuntime ? window.buildEdgesFromFacesRuntime(newFaces) : [];
    const decimated = {
        V: newVerts,
        F: newFaces,
        E: newEdges,
        _meshFormat: model._meshFormat,
        _shadingMode: model._shadingMode,
        _creaseAngleDeg: model._creaseAngleDeg,
    };
    model._lodCache.set(cacheKey, decimated);
    if (model._lodCache.size > 12) {
        const firstKey = Array.from(model._lodCache.keys())[0];
        model._lodCache.delete(firstKey);
    }
    return deepCopyMesh(decimated);
}