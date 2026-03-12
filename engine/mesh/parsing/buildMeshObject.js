// Given parsed vertex and face arrays, construct the full mesh object with
// auxiliary properties (edges, triangles, groups, etc.).
import { buildEdgesFromFacesRuntime } from '../utils/mesh-utilities/buildEdgesFromFacesRuntime.js';

// register helper globally so callers don't have to import it repeatedly
if (!globalThis.buildEdgesFromFacesRuntime) {
  globalThis.buildEdgesFromFacesRuntime = buildEdgesFromFacesRuntime;
}

export function buildMeshObject(uniqueVerts, faces) {
  const meshObj = {
    V: uniqueVerts, // [x, y, z, u, v, nx, ny, nz]
    F: faces,
    groups: Array.from(new Set(faces.map(f => f.group).filter(Boolean))),
    objects: Array.from(new Set(faces.map(f => f.object).filter(Boolean))),
    smoothingGroups: Array.from(new Set(faces.map(f => f.smoothing).filter(Boolean)))
  };
  // ensure helper is available (parsing may run before loader.js)
  if (!globalThis.buildEdgesFromFacesRuntime) {
    // eslint-disable-next-line import/no-cycle
    const { buildEdgesFromFacesRuntime } = require('../utils/mesh-utilities/buildEdgesFromFacesRuntime.js');
    globalThis.buildEdgesFromFacesRuntime = buildEdgesFromFacesRuntime;
  }
  meshObj.E = globalThis.buildEdgesFromFacesRuntime ? globalThis.buildEdgesFromFacesRuntime(faces.map(f => f.indices)) : [];
  meshObj.triangles = faces.map(f => f.indices);
  meshObj.triangleGroups = faces.map(f => f.group);
  meshObj.triangleObjects = faces.map(f => f.object);
  meshObj.triangleSmoothing = faces.map(f => f.smoothing);
  // per-corner normals and UVs
  meshObj.triangleNormals = faces.map(f => f.indices.map(i => [uniqueVerts[i][5], uniqueVerts[i][6], uniqueVerts[i][7]]));
  meshObj.triangleUVs = faces.map(f => f.indices.map(i => [uniqueVerts[i][3], uniqueVerts[i][4]]));
  return meshObj;
}