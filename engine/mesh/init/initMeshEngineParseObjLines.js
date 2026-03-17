/**
 * parseObjLines.js - OBJ Line-by-Line Parser
 * 
 * PURPOSE:
 *   Parses OBJ file lines into structured mesh data. This is the core
 *   parsing logic that handles vertices, normals, UVs, faces, groups,
 *   and other OBJ format elements.
 * 
 * ARCHITECTURE ROLE:
 *   Called by InitMeshEngineToRuntime to perform the actual parsing. Returns a
 *   state object containing all parsed data and any errors encountered.
 * 
 * OBJ FORMAT SUPPORTED:
 *   - v: Vertex positions (x, y, z)
 *   - vn: Vertex normals (nx, ny, nz)
 *   - vt: Texture coordinates (u, v)
 *   - f: Faces (vertex/uv/normal indices)
 *   - g: Groups
 *   - o: Objects
 *   - s: Smoothing groups
 *   - mtllib/usemtl: Material references (ignored)
 */

// Import individual line parsers
import { parseVertex } from ''./initMeshEngineParseVertex.js'';
import { parseNormal } from ''./initMeshEngineParseNormal.js'';
import { parseUv } from ''./initMeshEngineParseUv.js'';
import { parseFace } from ''./initMeshEngineParseFace.js'';

/**
 * parseObjLines - Parses OBJ text lines into mesh data
 * 
 * @param {Array<string>} lines - OBJ file lines
 * @param {Object} overrides - Options for error messages
 * 
 * @returns {Object} Parse state with:
 *   - uniqueVerts: Array of unique vertex positions
 *   - faces: Array of face objects
 *   - failingLines: Array of error messages
 *   - vertices, normals, uvs: Raw parsed data
 */
export function initMeshEngineParseObjLines(lines, overrides) {
  // Initialize parse state
  const state = {
    lineNumber: 0,
    vertices: [],      // Raw vertex positions
    normals: [],       // Raw vertex normals
    uvs: [],           // Raw texture coordinates
    uniqueVerts: [],   // Unique vertex positions (deduplicated)
    vertMap: new Map(), // Map for vertex deduplication
    faces: [],         // Parsed faces
    currentGroup: null,
    currentObject: null,
    currentSmoothing: null,
    failingLines: []   // Error messages
  };

  // Map OBJ line prefixes to handler functions
  const handlers = {
    v: parts => InitMeshEngineParseVertex(parts, state),
    vn: parts => InitMeshEngineParseNormal(parts, state),
    vt: parts => InitMeshEngineParseUv(parts, state),
    f: (parts, line) => InitMeshEngineParseFace(parts, line, state),
    g: parts => { state.currentGroup = parts.length > 1 ? parts.slice(1).join(' ') : null; },
    o: parts => { state.currentObject = parts.length > 1 ? parts.slice(1).join(' ') : null; },
    s: parts => { state.currentSmoothing = parts.length > 1 ? parts[1] : null; },
    mtllib: () => {},  // Material library (ignored)
    usemtl: () => {}   // Material use (ignored)
  };

  // Process each line
  for (const line of lines) {
    state.lineNumber++;
    
    // Skip empty lines and comments
    if (!line || line.startsWith('#')) continue;
    
    try {
      // Split line into parts
      const parts = line.trim().split(/\s+/);
      const prefix = parts[0];
      
      // Find and call handler for this line type
      const handler = handlers[prefix];
      if (handler) handler(parts, line);
    } catch (err) {
      // Log parse error but continue processing
      const fileName = overrides.meshFileName || 'unknown';
      state.failingLines.push(`[${state.lineNumber}] Exception parsing line in OBJ file '${fileName}': '${line}' | Error: ${err?.message ?? err}`);
      console.error(`[InitMeshEngineToRuntime] Exception at line ${state.lineNumber} in OBJ file '${fileName}':`, line, err);
      continue;
    }
  }

  return state;
}