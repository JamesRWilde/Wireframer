/**
 * edgeCost.js - Edge Collapse Cost Calculation
 * 
 * PURPOSE:
 *   Computes the cost of collapsing an edge in the mesh simplification
 *   algorithm. The cost is based on Quadric Error Metrics (QEM), which
 *   measure how much geometric error would be introduced by merging
 *   the two vertices of the edge.
 * 
 * ARCHITECTURE ROLE:
 *   Used by the quadric-based mesh decimation algorithm to prioritize
 *   which edges to collapse first. Lower cost edges are collapsed first,
 *   preserving the mesh's overall shape.
 * 
 * HOW IT WORKS:
 *   1. Compute the optimal position for the merged vertex
 *   2. Evaluate the quadric error at that position for both vertices
 *   3. Sum the errors to get the total cost of the collapse
 * 
 * WHY QUADRICS:
 *   Quadric Error Metrics provide a principled way to measure geometric
 *   error. They capture how far a point is from the planes of the faces
 *   adjacent to the edge, ensuring that important features (edges, corners)
 *   are preserved during simplification.
 */

"use strict";

// Import optimal position calculation for merged vertex
import { optimalPosition } from './optimalPosition.js';

// Import quadric evaluation function
import { evaluateQuadric } from './evaluateQuadric.js';

/**
 * edgeCost - Computes the cost of collapsing an edge
 * 
 * @param {Object} v1 - First vertex with quadric property
 * @param {Object} v2 - Second vertex with quadric property
 * 
 * @returns {number} The cost of collapsing the edge (lower is better)
 * 
 * The cost is the sum of quadric errors at the optimal merged position.
 * This represents how much geometric distortion would result from
 * merging the two vertices.
 */
export function edgeCost(v1, v2) {
  // Compute optimal position for merged vertex
  // This minimizes the total quadric error
  const pos = optimalPosition(v1, v2);
  
  // Evaluate quadric error at optimal position for both vertices
  // Sum to get total cost of the collapse
  return evaluateQuadric(v1.quadric, pos) + evaluateQuadric(v2.quadric, pos);
}
