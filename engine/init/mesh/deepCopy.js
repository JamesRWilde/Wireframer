/**
 * deepCopy.js - Deep Mesh Copy Utility
 * 
 * PURPOSE:
 *   Creates a deep copy of a mesh object, duplicating all arrays and nested
 *   structures. This prevents modifications to the copy from affecting the
 *   original, which is essential for LOD caching and mesh processing.
 * 
 * ARCHITECTURE ROLE:
 *   Used by LOD algorithms to return copies of cached meshes, preventing
 *   cache pollution. Also used when creating modified versions of meshes
 *   without affecting the original.
 * 
 * WHY DEEP COPY:
 *   JavaScript objects are passed by reference. Without deep copying,
 *   modifications to a "copy" would affect the original. This is
 *   especially problematic for LOD caching where we want to preserve
 *   the original mesh for future decimation operations.
 */

"use strict";

/**
 * deepCopy - Creates a deep copy of a mesh object
 * 
 * @param {Object} model - The mesh model to copy
 * 
 * @returns {Object} A deep copy of the mesh with all arrays duplicated
 * 
 * The function copies:
 * - V (vertices): Each vertex array is sliced
 * - F (faces): Each face is sliced (handles both array and object formats)
 * - E (edges): Each edge array is sliced
 * - Metadata: _meshFormat, _shadingMode, _creaseAngleDeg
 * - Optional: groups, objects, smoothingGroups, triangleNormals, triangleUVs
 */
export function deepCopy(model) {
  return {
    // Deep copy vertices: map each vertex and slice its array
    V: model.V.map(v => v.slice()),
    
    // Deep copy faces: handle both array format and object format with indices
    F: model.F.map(f => (Array.isArray(f) ? f.slice() : { ...f, indices: f.indices ? f.indices.slice() : undefined })),
    
    // Deep copy edges (if present)
    E: model.E ? model.E.map(e => e.slice()) : [],
    
    // Copy metadata (primitives, no deep copy needed)
    _meshFormat: model._meshFormat,
    _shadingMode: model._shadingMode,
    _creaseAngleDeg: model._creaseAngleDeg,
    
    // Copy optional arrays (shallow copy is sufficient for these)
    groups: model.groups ? model.groups.slice() : undefined,
    objects: model.objects ? model.objects.slice() : undefined,
    smoothingGroups: model.smoothingGroups ? model.smoothingGroups.slice() : undefined,
    
    // Deep copy nested arrays (normals and UVs are arrays of arrays)
    triangleNormals: model.triangleNormals ? model.triangleNormals.map(n => n.map(x => x.slice())) : undefined,
    triangleUVs: model.triangleUVs ? model.triangleUVs.map(uv => uv.map(x => x.slice())) : undefined,
  };
}