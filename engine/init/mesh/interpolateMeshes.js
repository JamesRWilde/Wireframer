/**
 * interpolateMeshes.js - Morph Vertex Interpolation with Spatial Mapping
 *
 * PURPOSE:
 *   Interpolates vertex positions between two meshes using a precomputed
 *   nearest-neighbor morph map. Each source vertex slides toward its
 *   closest counterpart on the target mesh, producing an organic morph
 *   instead of the streaking "polygonal cloud" effect.
 *
 * HOW IT WORKS:
 *   1. The morph map (precomputed by computeMorphMap) maps each source
 *      vertex to the index of the nearest target vertex
 *   2. For each frame, lerp each source vertex toward its target counterpart
 *   3. Use the source mesh's face/edge structure throughout (swaps to
 *      target's structure at morph completion in advanceMorphFrame)
 */

"use strict";

/**
 * interpolateMeshes - Interpolates between two meshes using spatial mapping
 *
 * @param {Object} fromMesh - Source mesh { V, F, E, ... }
 * @param {Object} toMesh - Target mesh { V, F, E, ... }
 * @param {number} t - Interpolation factor (0-1)
 * @param {number[]|null} morphMap - Precomputed nearest-target-vertex indices
 *
 * @returns {Object} Interpolated mesh using source face structure
 */
export function interpolateMeshes(fromMesh, toMesh, t, morphMap) {
  const fromV = fromMesh.V;
  const toV = toMesh.V;
  const V = [];

  if (morphMap && morphMap.length === fromV.length) {
    // Spatial mapping: each vertex interpolates toward its nearest target vertex
    for (let i = 0; i < fromV.length; i++) {
      const a = fromV[i];
      const b = toV[morphMap[i]];
      if (!b) { V.push(a.slice()); continue; }

      V.push([
        a[0] + (b[0] - a[0]) * t,
        a[1] + (b[1] - a[1]) * t,
        a[2] + (b[2] - a[2]) * t,
      ]);
    }
  } else {
    // Fallback: index-based interpolation (old behavior)
    const n = Math.max(fromV.length, toV.length);
    for (let i = 0; i < n; i++) {
      const a = fromV[i % fromV.length];
      const b = toV[i % toV.length];
      V.push([
        a[0] + (b[0] - a[0]) * t,
        a[1] + (b[1] - a[1]) * t,
        a[2] + (b[2] - a[2]) * t,
      ]);
    }
  }

  // Use source mesh face structure during morph
  return {
    V,
    F: fromMesh.F.map(f => (Array.isArray(f) ? f.slice() : { ...f, indices: f.indices ? f.indices.slice() : undefined })),
    E: fromMesh.E.map(e => e.slice()),
    _shadingMode: fromMesh._shadingMode,
    _creaseAngleDeg: fromMesh._creaseAngleDeg,
    groups: fromMesh.groups ? fromMesh.groups.slice() : undefined,
    objects: fromMesh.objects ? fromMesh.objects.slice() : undefined,
    smoothingGroups: fromMesh.smoothingGroups ? fromMesh.smoothingGroups.slice() : undefined,
    triangleNormals: fromMesh.triangleNormals ? fromMesh.triangleNormals.map(n => n.map(x => x.slice())) : undefined,
    triangleUVs: fromMesh.triangleUVs ? fromMesh.triangleUVs.map(uv => uv.map(x => x.slice())) : undefined,
  };
}
