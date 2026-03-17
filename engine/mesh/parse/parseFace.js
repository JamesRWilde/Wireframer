/**
 * parseFace.js - OBJ Face Line Parser
 * 
 * PURPOSE:
 *   Parses an OBJ face line ("f") into triangles. OBJ faces can have any
 *   number of vertices (triangles, quads, n-gons). This function handles
 *   all cases by fan-triangulating polygons with more than 3 vertices.
 * 
 * ARCHITECTURE ROLE:
 *   Called by parseObjLines for each "f" line in the OBJ file. Produces
 *   triangle face objects with indices and metadata (group, object, smoothing).
 * 
 * FAN TRIANGULATION:
 *   For polygons with more than 3 vertices, we use fan triangulation:
 *   - Triangle 1: vertices [0, 1, 2]
 *   - Triangle 2: vertices [0, 2, 3]
 *   - Triangle 3: vertices [0, 3, 4]
 *   - etc.
 *   
 *   This is simple and works well for convex polygons.
 */

// Import token parser for extracting vertex/uv/normal indices
import { idxFromToken } from './idxFromToken.js';

// Import vertex deduplication helper
import { getOrCreateVertIdx } from '../get/getOrCreateVertIdx.js';

/**
 * parseFace - Parses an OBJ face line into triangles
 * 
 * @param {Array<string>} parts - Line parts (e.g., ["f", "1/2/3", "4/5/6", "7/8/9"])
 * @param {string} originalLine - Original line text for error messages
 * @param {Object} state - Parse state with vertices, faces, etc.
 */
export function parseFace(parts, originalLine, state) {
  // Extract face vertex tokens (everything after "f")
  const rawTokens = parts.slice(1);
  
  // Validate: face must have at least 3 vertices
  if (rawTokens.length < 3) {
    state.failingLines.push(`[${state.lineNumber}] Malformed face (too few indices): '${originalLine}'`);
    return;
  }
  
  // Parse each token into vertex/uv/normal indices
  const faceVerts = rawTokens.map(tok => idxFromToken(tok, state));
  
  // Check for out-of-bounds vertex indices
  const outOfBounds = faceVerts.filter(i => i.v < 0 || i.v >= state.vertices.length);
  if (outOfBounds.length) {
    state.failingLines.push(`[${state.lineNumber}] Out-of-bounds face indices: '${originalLine}' | Invalid indices: ${outOfBounds.map(x=>x.v).join(', ')}`);
    return;
  }
  
  // Fan triangulation: convert polygon to triangles
  // For a polygon with vertices [0, 1, 2, 3, 4], create triangles:
  // [0,1,2], [0,2,3], [0,3,4]
  for (let i = 1; i < faceVerts.length - 1; i++) {
    // Get or create unique vertex indices for this triangle
    const tri = [
      getOrCreateVertIdx(faceVerts[0].v, faceVerts[0].vt, faceVerts[0].vn, state),
      getOrCreateVertIdx(faceVerts[i].v, faceVerts[i].vt, faceVerts[i].vn, state),
      getOrCreateVertIdx(faceVerts[i+1].v, faceVerts[i+1].vt, faceVerts[i+1].vn, state)
    ];
    
    // Only add triangle if all 3 vertices are unique (skip degenerate triangles)
    if ((new Set(tri)).size === 3) {
      state.faces.push({
        indices: tri,
        group: state.currentGroup,
        object: state.currentObject,
        smoothing: state.currentSmoothing
      });
    }
  }
}

