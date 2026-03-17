/**
 * InitMeshEngineBuildEdgesFromFacesRuntime.js - Edge Extraction from Face Data
 * 
 * PURPOSE:
 *   Extracts unique edges from face index arrays at runtime. Each face is
 *   decomposed into its constituent edges, with duplicates removed.
 * 
 * ARCHITECTURE ROLE:
 *   Called during mesh loading to build the edge array (E) from face data (F).
 *   The edge array is used by wireframe rendering and edge classification.
 * 
 * EDGE EXTRACTION:
 *   For each face with indices [a, b, c, ...], edges are:
 *   (a,b), (b,c), (c,...), ..., (last,a)
 *   Edges are deduplicated so shared edges between faces appear only once.
 */

import { initMeshEngineAddEdge } from './initMeshEngineAddEdge.js';

/**
 * InitMeshEngineBuildEdgesFromFacesRuntime - Extracts unique edges from face arrays
 * 
 * @param {Array} faces - Array of face objects or index arrays
 *   Each face can be:
 *   - An object with .indices property
 *   - A flat array of vertex indices [a, b, c, ...]
 *   - A nested array [[a, b, c, ...]]
 * 
 * @returns {Array<Array<number>>} Array of unique edges as [lo, hi] pairs
 *   where lo < hi for consistent deduplication
 */
export function initMeshEngineBuildEdgesFromFacesRuntime(faces) {
  const E = [];
  const edgeSet = new Set();

  for (const face of faces || []) {
    // Extract indices from face (handles object with .indices or raw array)
    let indices = face?.indices ?? face;
    
    // Flatten nested arrays (handles [[a, b, c]] format)
    if (Array.isArray(indices) && indices.length === 1 && Array.isArray(indices[0])) {
      indices = indices[0];
    }
    
    // Skip invalid faces
    if (!Array.isArray(indices) || indices.length < 2) continue;
    
    // Extract edges: (0,1), (1,2), ..., (n-1,0)
    for (let i = 0; i < indices.length; i++) {
      InitMeshEngineAddEdge(indices[i], indices[(i + 1) % indices.length], E, edgeSet);
    }
  }

  return E;
}
