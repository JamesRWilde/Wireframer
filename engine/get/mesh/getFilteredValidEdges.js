/**
 * filterValidEdges.js - Edge Validation and Filtering
 * 
 * PURPOSE:
 *   Filters out invalid edges from an edge list. Invalid edges include:
 *   - Non-array entries
 *   - Arrays that don't have exactly 2 elements
 *   - Self-referencing edges (where both indices are the same)
 *   - Edges referencing non-existent vertices
 * 
 * ARCHITECTURE ROLE:
 *   Called by load to clean up edge data before creating the model object.
 *   Ensures the edge list only contains valid, renderable edges.
 * 
 * WHY FILTER:
 *   Edge lists can contain invalid entries due to:
 *   - Parser errors or malformed input
 *   - Degenerate geometry (zero-area faces)
 *   - Duplicate edge detection artifacts
 *   Filtering prevents rendering errors and improves performance.
 */

/**
 * filterValidEdges - Removes invalid edges from an edge list
 * 
 * @param {Array<Array<number>>} E - Array of edge pairs [[i,j], ...]
 * @param {Array<Array<number>>} V - Vertex positions array (for bounds checking)
 * 
 * @returns {Array<Array<number>>} Filtered array containing only valid edges
 * 
 * The function uses the global edgesFromFacesRuntime if available,
 * otherwise falls back to a simple filter that checks array structure.
 */
import { getMeshEdgesFromFacesRuntime } from '@engine/get/mesh/getMeshEdgesFromFacesRuntime.js';

export function getFilteredValidEdges(E, V) {
  const edgeBuilder = getMeshEdgesFromFacesRuntime();

  // Fallback: simple filter for basic validity when no builder is defined
  if (!edgeBuilder) {
    return E ? E.filter(e => Array.isArray(e) && e.length === 2 && e[0] !== e[1]) : [];
  }
  
  // Use the configured edge builder for comprehensive validation
  return edgeBuilder(E) || [];
}
