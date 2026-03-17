/**
 * InitMeshEngineClone.js - Deep Mesh Clone for Morphing
 * 
 * PURPOSE:
 *   Creates a deep copy of a mesh object for use in morphing operations.
 *   This is similar to the LOD InitMeshEngineDeepCopy but optimized for morphing
 *   needs, ensuring all arrays are properly cloned to prevent mutation
 *   of the original meshes during interpolation.
 * 
 * ARCHITECTURE ROLE:
 *   Used by InitMeshEngineStartMorph to clone source and target meshes, and by
 *   InitMeshEngineAdvanceMorphFrame to create the final mesh when morph completes.
 * 
 * WHY DEEP CLONE:
 *   During morphing, vertex positions are interpolated in-place. Without
 *   deep cloning, the original meshes would be corrupted by the interpolation
 *   process, causing visual artifacts and data loss.
 */

"use strict";

/**
 * InitMeshEngineClone - Creates a deep copy of a mesh object
 * 
 * @param {Object} mesh - The mesh to clone
 * 
 * @returns {Object} A deep copy of the mesh with all arrays duplicated
 * 
 * The function clones:
 * - V (vertices): Each vertex array is sliced
 * - F (faces): Each face is sliced (handles both array and object formats)
 * - E (edges): Each edge array is sliced
 * - Metadata: _shadingMode, _creaseAngleDeg
 * - Optional: groups, objects, smoothingGroups, triangleNormals, triangleUVs
 */
export function InitMeshEngineClone(mesh) {
  return {
    // Deep copy vertices: map each vertex and slice its array
    V: mesh.V.map(v => v.slice()),
    
    // Deep copy faces: handle both array format and object format with indices
    F: mesh.F.map(f => (Array.isArray(f) ? f.slice() : { ...f, indices: f.indices ? f.indices.slice() : undefined })),
    
    // Deep copy edges
    E: mesh.E.map(e => e.slice()),
    
    // Copy metadata (primitives, no deep copy needed)
    _shadingMode: mesh._shadingMode,
    _creaseAngleDeg: mesh._creaseAngleDeg,
    
    // Copy optional arrays (shallow copy is sufficient for these)
    groups: mesh.groups ? mesh.groups.slice() : undefined,
    objects: mesh.objects ? mesh.objects.slice() : undefined,
    smoothingGroups: mesh.smoothingGroups ? mesh.smoothingGroups.slice() : undefined,
    
    // Deep copy nested arrays (normals and UVs are arrays of arrays)
    triangleNormals: mesh.triangleNormals ? mesh.triangleNormals.map(n => n.map(x => x.slice())) : undefined,
    triangleUVs: mesh.triangleUVs ? mesh.triangleUVs.map(uv => uv.map(x => x.slice())) : undefined,
  };
}
