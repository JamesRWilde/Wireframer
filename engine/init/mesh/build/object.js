/**
 * object.js - Mesh Object Construction
 *
 * PURPOSE:
 *   Constructs the final mesh object from parsed vertex and face data.
 *   Preserves explicit OBJ edge data separately from face-derived edges.
 *   Tracks material sections per face for mesh separation.
 *
 * ARCHITECTURE ROLE:
 *   Called by toRuntime after parsing is complete. Produces the mesh
 *   object format expected by the engine's rendering pipeline.
 *
 * MESH OBJECT STRUCTURE:
 *   - V: Vertex positions (with embedded normals and UVs)
 *   - F: Face index arrays (objects with indices, material, etc.)
 *   - E: Edge index pairs (face-derived, for topology)
 *   - Eobj: Explicit OBJ edges (from "e" lines, author-defined)
 *   - Lobj: Explicit OBJ lines (from "l" lines, author-defined)
 *   - materials/materialSections: Material group metadata
 *   - triangles/triangleNormals: Per-corner rendering data
 */

// Import edge building utility and state API
import { edgesFromFacesRuntime } from '@engine/init/mesh/build/edgesFromFacesRuntime.js';
import { getMeshEdgesFromFacesRuntime } from '@engine/get/mesh/getEdgesFromFacesRuntime.js';
import { setMeshEdgesFromFacesRuntime } from '@engine/set/mesh/setMeshEdgesFromFacesRuntime.js';
import { mergeEdges } from '@engine/init/mesh/build/mergeEdges.js';

// Ensure consumer path resolves through module state (no global object)
if (!getMeshEdgesFromFacesRuntime()) {
  setMeshEdgesFromFacesRuntime(edgesFromFacesRuntime);
}

/**
 * object - Constructs final mesh object from parsed data
 *
 * @param {Array} uniqueVerts - Unique vertex positions [x,y,z,u,v,nx,ny,nz]
 * @param {Array<Object>} faces - Parsed face objects
 * @param {Array} rawEdges - Explicit OBJ edges from "e" lines
 * @param {Array} rawLines - Explicit OBJ lines from "l" lines
 * @param {Array} materialSections - Material section boundaries
 *
 * @returns {Object} Complete mesh object ready for rendering
 */
export function object(uniqueVerts, faces, rawEdges, rawLines, materialSections) {
  rawEdges = rawEdges || [];
  rawLines = rawLines || [];
  materialSections = materialSections || [];

  // Build face-derived edges for topology
  const faceIndexArrays = faces.map(f => f.indices);
  const edgeBuilder = getMeshEdgesFromFacesRuntime();
  const derivedEdges = edgeBuilder ? edgeBuilder(faceIndexArrays) : [];

  // Merge: OBJ edges first, then fill gaps with face-derived
  const hasObjEdges = rawEdges.length > 0;
  const hasObjLines = rawLines.length > 0;

  const finalEdges = hasObjEdges || hasObjLines
    ? mergeEdges([...rawEdges, ...rawLines], derivedEdges)
    : derivedEdges;

  // Collect unique materials from faces
  const materials = Array.from(new Set(faces.map(f => f.material).filter(Boolean)));

  // Finalize material section boundaries (add end marker)
  const finalSections = materialSections.map(s => ({
    material: s.material,
    faceStart: s.faceStart
  }));
  // Close the last section
  if (finalSections.length > 0) {
    finalSections.at(-1).faceEnd = faces.length;
  }

  const meshObj = {
    V: uniqueVerts,
    F: faces,

    // Edges: merged (OBJ + face-derived)
    E: finalEdges,

    // Raw OBJ edge data (for inspection and validation)
    Eobj: rawEdges,
    Lobj: rawLines,
    _hasExplicitEdges: hasObjEdges || hasObjLines,

    // Material metadata
    materials: materials,
    materialSections: finalSections.length > 1 ? finalSections : null,

    // Group/object/smoothing metadata
    groups: Array.from(new Set(faces.map(f => f.group).filter(Boolean))),
    objects: Array.from(new Set(faces.map(f => f.object).filter(Boolean))),
    smoothingGroups: Array.from(new Set(faces.map(f => f.smoothing).filter(Boolean))),

    // Extract triangle indices for rendering
    triangles: faceIndexArrays,

    // Per-triangle metadata
    triangleGroups: faces.map(f => f.group),
    triangleObjects: faces.map(f => f.object),
    triangleSmoothing: faces.map(f => f.smoothing),
    triangleMaterials: faces.map(f => f.material),

    // Per-corner normals and UVs from embedded vertex data
    triangleNormals: faces.map(f => f.indices.map(i => [uniqueVerts[i][5], uniqueVerts[i][6], uniqueVerts[i][7]])),
    triangleUVs: faces.map(f => f.indices.map(i => [uniqueVerts[i][3], uniqueVerts[i][4]])),

    // Winding: will be set by fixWinding if needed
    _windingFixed: false,
    _windingDirection: 'unknown'
  };

  return meshObj;
}
