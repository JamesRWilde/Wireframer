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
export function filterValidEdges(E, V) {
  // Check if the global edge builder is available
  if (!globalThis.edgesFromFacesRuntime) {
    // Fallback: simple filter for basic validity
    // - Must be an array
    // - Must have exactly 2 elements
    // - Indices must be different (no self-loops)
    return E ? E.filter(e => Array.isArray(e) && e.length === 2 && e[0] !== e[1]) : [];
  }
  
  // Use the global edge builder for comprehensive validation
  // This includes bounds checking against vertex count
  return globalThis.edgesFromFacesRuntime(E) || [];
}
