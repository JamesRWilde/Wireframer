import { parseVertex } from './parseVertex.js';
import { parseNormal } from './parseNormal.js';
import { parseUv } from './parseUv.js';
import { parseFace } from './parseFace.js';

// Walks OBJ text lines and builds mesh state. Returns object containing
// uniqueVerts, faces, failingLines etc. This keeps toRuntimeMesh small.
export function parseObjLines(lines, overrides) {
  const state = {
    lineNumber: 0,
    vertices: [],
    normals: [],
    uvs: [],
    uniqueVerts: [],
    vertMap: new Map(),
    faces: [],
    currentGroup: null,
    currentObject: null,
    currentSmoothing: null,
    failingLines: []
  };

  const handlers = {
    v: parts => parseVertex(parts, state),
    vn: parts => parseNormal(parts, state),
    vt: parts => parseUv(parts, state),
    f: (parts, line) => parseFace(parts, line, state),
    g: parts => { state.currentGroup = parts.length > 1 ? parts.slice(1).join(' ') : null; },
    o: parts => { state.currentObject = parts.length > 1 ? parts.slice(1).join(' ') : null; },
    s: parts => { state.currentSmoothing = parts.length > 1 ? parts[1] : null; },
    mtllib: () => {},
    usemtl: () => {}
  };

  for (const line of lines) {
    state.lineNumber++;
    if (!line || line.startsWith('#')) continue;
    try {
      const parts = line.trim().split(/\s+/);
      const prefix = parts[0];
      const handler = handlers[prefix];
      if (handler) handler(parts, line);
    } catch (err) {
      const fileName = overrides.meshFileName || 'unknown';
      state.failingLines.push(`[${state.lineNumber}] Exception parsing line in OBJ file '${fileName}': '${line}' | Error: ${err?.message ?? err}`);
      console.error(`[toRuntimeMesh] Exception at line ${state.lineNumber} in OBJ file '${fileName}':`, line, err);
      continue;
    }
  }

  return state;
}