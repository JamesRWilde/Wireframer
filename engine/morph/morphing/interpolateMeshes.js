/**
 * interpolateMeshes.js - Mesh Vertex Interpolation
 * 
 * PURPOSE:
 *   Interpolates vertex positions between two meshes to create a smooth
 *   transition. This is the core operation of morphing, computing intermediate
 *   vertex positions at a given progress point.
 * 
 * ARCHITECTURE ROLE:
 *   Called by advanceMorphFrame each frame to compute the current interpolated
 *   mesh. Uses linear interpolation (lerp) for each vertex coordinate.
 * 
 * HOW IT WORKS:
 *   1. Determine the maximum vertex count between source and target
 *   2. For each vertex index, interpolate between corresponding vertices
 *   3. Use modulo to handle meshes with different vertex counts
 *   4. Copy face/edge structure from target mesh
 */

/**
 * interpolateMeshes - Interpolates between two meshes
 * 
 * @param {Object} fromMesh - Source mesh
 * @param {Object} toMesh - Target mesh
 * @param {number} t - Interpolation factor (0-1)
 * 
 * @returns {Object} Interpolated mesh with blended vertex positions
 */
export function interpolateMeshes(fromMesh, toMesh, t) {
  // Use maximum vertex count to ensure all vertices are interpolated
  const n = Math.max(fromMesh.V.length, toMesh.V.length);
  const V = [];
  
  // Interpolate each vertex position
  for (let i = 0; i < n; i++) {
    // Use modulo to handle different vertex counts
    const a = fromMesh.V[i % fromMesh.V.length];
    const b = toMesh.V[i % toMesh.V.length];
    
    // Linear interpolation: a + (b - a) * t
    V.push([
      a[0] + (b[0] - a[0]) * t,
      a[1] + (b[1] - a[1]) * t,
      a[2] + (b[2] - a[2]) * t,
    ]);
  }
  
  // Build interpolated mesh with target's face/edge structure
  return {
    V,
    F: toMesh.F.map(f => (Array.isArray(f) ? f.slice() : { ...f, indices: f.indices ? f.indices.slice() : undefined })),
    E: toMesh.E.map(e => e.slice()),
    _shadingMode: toMesh._shadingMode,
    _creaseAngleDeg: toMesh._creaseAngleDeg,
    groups: toMesh.groups ? toMesh.groups.slice() : undefined,
    objects: toMesh.objects ? toMesh.objects.slice() : undefined,
    smoothingGroups: toMesh.smoothingGroups ? toMesh.smoothingGroups.slice() : undefined,
    triangleNormals: toMesh.triangleNormals ? toMesh.triangleNormals.map(n => n.map(x => x.slice())) : undefined,
    triangleUVs: toMesh.triangleUVs ? toMesh.triangleUVs.map(uv => uv.map(x => x.slice())) : undefined,
  };
}
