/**
 * cloneMesh.js - Deep Mesh Clone for Morphing and Baker Shelf
 *
 * PURPOSE:
 *   Creates a deep copy of a mesh object for use in morphing operations
 *   and for cloning the baker's shelf model during the load pipeline.
 *   This is similar to the LOD deepCopy but optimized for morphing
 *   needs, ensuring all arrays are properly cloned to prevent mutation
 *   of the original meshes during interpolation.
 *
 * ARCHITECTURE ROLE:
 *   Used by startMorph to clone source and target meshes, by
 *   advanceMorphFrame to create the final mesh when morph completes,
 *   and by initLoad to create the working pipeline copy from the baker's
 *   pristine shelf model. The clone gets its _bakedShelfModel reference
 *   wired so that any downstream operation can always find the pristine
 *   original without re-parsing the OBJ.
 *
 * WHY THIS EXISTS:
 *   Ensures morph operations never mutate original mesh data by providing a
 *   reusable deep-clone helper.
 *
 * WHY DEEP CLONE:
 *   During morphing, vertex positions are interpolated in-place. Without
 *   deep cloning, the original meshes would be corrupted by the interpolation
 *   process, causing visual artifacts and data loss.
 */

"use strict";

/**
 * cloneMesh - Creates a deep copy of a mesh object
 *
 * @param {Object} mesh - The mesh to clone (baked shelf model or working copy)
 * @param {Object} [shelfModel] - The baker's shelf model. When provided, the
 *   clone's _bakedShelfModel is set to this reference so downstream operations
 *   can always find the pristine original without re-parsing the OBJ. If omitted,
 *   the clone inherits mesh._bakedShelfModel if it exists.
 *
 * @returns {Object} A deep copy of the mesh with all geometry arrays duplicated
 *
 * What is cloned:
 * - V (vertices): Each vertex array is sliced
 * - F (faces): Each face is sliced (handles both array and object formats)
 * - E (edges): Each edge array is sliced
 * - Metadata: _shadingMode, _creaseAngleDeg
 * - Optional: groups, objects, smoothingGroups, triangleNormals, triangleUVs
 * - _bakedShelfModel: Set to shelfModel (or inherited from mesh)
 *
 * What is NOT copied:
 * - triFaces, _faceNormals, _vertexToFaces, _triCornerNormals: these are
 *   baked geometry that becomes invalid when V/F differ from the original.
 *   Clones that have mutated geometry compute their own via utilBakeDerived.
 */
export function cloneMesh(mesh, shelfModel) {
  // Pre-compute deep-copied arrays before building the clone object.
  // Each array and sub-array must be an independent copy because
  // downstream operations (morphing, decimation) mutate in-place.

  // Deep copy vertices: map each vertex and slice its array.
  // If the clone mutated the original's vertex array during morphing,
  // the baker's shelf would be corrupted and all future operations
  // would work from a degraded mesh, not the pristine original.
  const V = mesh.V.map(v => v.slice());

  // Deep copy faces: handle both array format and object format with indices.
  // Faces carry vertex indices that must be independent copies because
  // decimation and morphing rewrite indices in-place on clones.
  const F = mesh.F.map(f => (Array.isArray(f) ? f.slice() : { ...f, indices: f.indices ? f.indices.slice() : undefined }));

  // Deep copy edges. Edges reference vertex indices by position in V,
  // so they must be cloned when V changes.
  const E = mesh.E.map(e => e.slice());

  return {
    // Assign the pre-computed deep copies
    V, F, E,

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

    // Set the baker's shelf reference on the clone.
    // This is the lifeline that prevents re-parsing OBJ — any operation that
    // needs a fresh start (e.g. detail slider going up after decimation)
    // grabs a new clone from this reference instead of going back to raw OBJ.
    // Priority: explicit shelfModel param > mesh._bakedShelfModel > null.
    _bakedShelfModel: shelfModel ?? mesh._bakedShelfModel ?? null,
  };
}
