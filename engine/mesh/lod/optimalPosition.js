/**
 * optimalPosition.js - Optimal Merged Vertex Position
 * 
 * PURPOSE:
 *   Computes the optimal position for a vertex created by collapsing an edge.
 *   In the simplest case, this is just the midpoint of the two vertices,
 *   which minimizes the maximum distance from the original positions.
 * 
 * ARCHITECTURE ROLE:
 *   Used by edgeCost to determine where the merged vertex should be placed
 *   when computing the cost of an edge collapse.
 * 
 * WHY MIDPOINT:
 *   The midpoint is a simple and effective choice that:
 *   - Minimizes maximum displacement from original vertices
 *   - Is symmetric (order of vertices doesn't matter)
 *   - Is fast to compute
 *   - Works well in practice for most meshes
 * 
 *   More sophisticated approaches could solve for the position that
 *   minimizes quadric error, but the midpoint is a good approximation.
 */

/**
 * optimalPosition - Computes optimal position for merged vertex
 * 
 * @param {Object} v1 - First vertex with position property
 * @param {Object} v2 - Second vertex with position property
 * 
 * @returns {Array<number>} Optimal position [x, y, z] for merged vertex
 *   This is the midpoint between the two input vertices
 */
export function optimalPosition(v1, v2) {
  // Compute midpoint by averaging coordinates
  return [
    (v1.position[0] + v2.position[0]) / 2,
    (v1.position[1] + v2.position[1]) / 2,
    (v1.position[2] + v2.position[2]) / 2,
  ];
}
