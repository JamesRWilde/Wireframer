/**
 * parseObjLines.js - OBJ Line-by-Line Parser
 * 
 * PURPOSE:
 *   Parses OBJ file lines into structured mesh data. This is the core
 *   parsing logic that handles vertices, normals, UVs, faces, groups,
 *   and other OBJ format elements.
 * 
 * ARCHITECTURE ROLE:
 *   Called by toRuntime to perform the actual parsing. Returns a
 *   state object containing all parsed data and any errors encountered.
 *
 * WHY THIS EXISTS:
 *   Provides a single robust parser entrypoint with extended error
 *   capture and format support for OBJ files.
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
import {parseVertex}from '@engine/init/mesh/parse/initParseVertex.js';
import {parseNormal}from '@engine/init/mesh/parse/initParseNormal.js';
import {parseUv}from '@engine/init/mesh/parse/initParseUv.js';
import {parseFace}from '@engine/init/mesh/parse/initParseFace.js';
import {parseEdge}from '@engine/init/mesh/parse/initParseEdge.js';

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
export function parseObjLines(lines, overrides) {
  // Initialize parse state
  const state = {
    lineNumber: 0,
    vertices: [],      // Raw vertex positions
    normals: [],       // Raw vertex normals
    uvs: [],           // Raw texture coordinates
    uniqueVerts: [],   // Unique vertex positions (deduplicated)
    vertMap: new Map(), // Map for vertex deduplication
    faces: [],         // Parsed faces
    rawEdges: [],      // Explicit OBJ edges (from "e" lines)
    rawLines: [],      // Explicit OBJ lines (from "l" lines)
    materialSections: [], // Material section boundaries
    currentGroup: null,
    currentObject: null,
    currentSmoothing: null,
    currentMaterial: null,
    failingLines: []   // Error messages
  };

  // Map OBJ line prefixes to handler functions
  const handlers = {
    v: parts => parseVertex(parts, state),
    vn: parts => parseNormal(parts, state),
    vt: parts => parseUv(parts, state),
    f: (parts, line) => parseFace(parts, line, state),
    g: parts => { state.currentGroup = parts.length > 1 ? parts.slice(1).join(' ') : null; },
    o: parts => { state.currentObject = parts.length > 1 ? parts.slice(1).join(' ') : null; },
    s: parts => { state.currentSmoothing = parts.length > 1 ? parts[1] : null; },
    e: parts => parseEdge(parts, state),
    l: parts => {
      // Line elements: l v1 v2 [v3 ... vn]
      // Store as pairs of consecutive vertex indices
      for (let i = 1; i < parts.length - 1; i++) {
        const a = Number(parts[i]);
        const b = Number(parts[i + 1]);
        if (!Number.isFinite(a) || a === 0 || !Number.isFinite(b) || b === 0) continue;
        const ai = a > 0 ? a - 1 : state.vertices.length + a;
        const bi = b > 0 ? b - 1 : state.vertices.length + b;
        if (ai < 0 || ai >= state.vertices.length || bi < 0 || bi >= state.vertices.length) continue;
        if (ai === bi) continue;
        state.rawLines.push(ai < bi ? [ai, bi] : [bi, ai]);
      }
    },
    mtllib: () => {},  // Material library (not used for textures)
    usemtl: parts => {
      const matName = parts.length > 1 ? parts.slice(1).join(' ') : null;
      if (matName !== state.currentMaterial) {
        state.currentMaterial = matName;
        // Record material section boundary: faces from this point onward belong to this material
        state.materialSections.push({
          material: matName,
          faceStart: state.faces.length
        });
      }
    }
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
      console.error(`[toRuntime] Exception at line ${state.lineNumber} in OBJ file '${fileName}':`, line, err);
      continue;
    }
  }

  return state;
}