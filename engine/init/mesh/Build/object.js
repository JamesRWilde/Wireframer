/**
 * InitMeshEngineBuildObject.js - Mesh Object Construction
 * 
 * PURPOSE:
 *   Constructs the final mesh object from parsed vertex and face data.
 *   This includes computing edges, extracting triangle data, and building
 *   per-corner normals and UVs for rendering.
 * 
 * ARCHITECTURE ROLE:
 *   Called by InitMeshEngineToRuntime after parsing is complete. Produces the mesh
 *   object format expected by the engine's rendering pipeline.
 * 
 * MESH OBJECT STRUCTURE:
 *   - V: Vertex positions (with embedded normals and UVs)
 *   - F: Face index arrays
 *   - E: Edge index pairs (computed from faces)
 *   - groups/objects/smoothingGroups: Metadata
 *   - triangles/triangleGroups/etc.: Per-triangle data
 *   - triangleNormals/triangleUVs: Per-corner rendering data
 */

// Import edge building utility
import { edgesFromFacesRuntime }from '@engine/init/mesh/Build/edgesFromFacesRuntime.js';

// Register helper globally so callers don't have to import it repeatedly
if (!globalThis.InitMeshEngineBuildEdgesFromFacesRuntime) {
  globalThis.InitMeshEngineBuildEdgesFromFacesRuntime = InitMeshEngineBuildEdgesFromFacesRuntime;
}

/**
 * InitMeshEngineBuildObject - Constructs final mesh object from parsed data
 * 
 * @param {Array<Array<number>>} uniqueVerts - Unique vertex positions
 *   Each vertex is [x, y, z, u, v, nx, ny, nz] (position, UV, normal)
 * @param {Array<Object>} faces - Parsed face objects with indices and metadata
 * 
 * @returns {Object} Complete mesh object ready for rendering
 */
export function object(uniqueVerts, faces) {
  // Build base mesh object with vertices and faces
  const meshObj = {
    V: uniqueVerts,  // [x, y, z, u, v, nx, ny, nz]
    F: faces,
    // Extract unique groups, objects, and smoothing groups from faces
    groups: Array.from(new Set(faces.map(f => f.group).filter(Boolean))),
    objects: Array.from(new Set(faces.map(f => f.object).filter(Boolean))),
    smoothingGroups: Array.from(new Set(faces.map(f => f.smoothing).filter(Boolean)))
  };
  
  // Ensure edge builder is available (parsing may run before loader.js)
  if (!globalThis.InitMeshEngineBuildEdgesFromFacesRuntime) {
    // eslint-disable-next-line import/no-cycle
    const { edgesFromFacesRuntime } = require(''./edgesFromFacesRuntime.js');
    globalThis.InitMeshEngineBuildEdgesFromFacesRuntime = InitMeshEngineBuildEdgesFromFacesRuntime;
  }
  
  // Build edges from face indices for wireframe rendering
  meshObj.E = globalThis.InitMeshEngineBuildEdgesFromFacesRuntime ? globalThis.InitMeshEngineBuildEdgesFromFacesRuntime(faces.map(f => f.indices)) : [];
  
  // Extract triangle indices for rendering
  meshObj.triangles = faces.map(f => f.indices);
  
  // Extract per-triangle metadata
  meshObj.triangleGroups = faces.map(f => f.group);
  meshObj.triangleObjects = faces.map(f => f.object);
  meshObj.triangleSmoothing = faces.map(f => f.smoothing);
  
  // Build per-corner normals and UVs for rendering
  // These are extracted from the embedded vertex data
  meshObj.triangleNormals = faces.map(f => f.indices.map(i => [uniqueVerts[i][5], uniqueVerts[i][6], uniqueVerts[i][7]]));
  meshObj.triangleUVs = faces.map(f => f.indices.map(i => [uniqueVerts[i][3], uniqueVerts[i][4]]));
  
  return meshObj;
}