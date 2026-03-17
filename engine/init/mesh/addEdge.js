/**
 * addEdge.js - Unique Edge Addition
 * 
 * PURPOSE:
 *   Adds an edge to an edge array if it doesn't already exist. Uses a Set
 *   to track unique edges by their canonical key (lower index first).
 * 
 * ARCHITECTURE ROLE:
 *   Helper for edgesFromFacesRuntime. Extracted to follow one-function-per-file
 *   architecture rule.
 * 
 * EDGE DEDUPLICATION:
 *   Edges are stored as [lo, hi] where lo < hi. This ensures that edge (a,b)
 *   and edge (b,a) are treated as the same edge. The key format "lo|hi" is
 *   used for Set-based deduplication.
 */

/**
 * addEdge - Adds a unique edge to the edge array
 * 
 * @param {number} a - First vertex index
 * @param {number} b - Second vertex index
 * @param {Array<Array<number>>} E - Edge array to add to (mutated)
 * @param {Set<string>} edgeSet - Set of edge keys for deduplication (mutated)
 * 
 * @returns {void}
 */
export function addEdge(a, b, E, edgeSet) {
  // Canonical form: lower index first
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  const key = `${lo}|${hi}`;
  
  // Skip if edge already exists
  if (edgeSet.has(key)) return;
  
  // Add to set and array
  edgeSet.add(key);
  E.push([lo, hi]);
}
