/**
 * addQuadrics.js - Quadric Error Metric Addition
 * 
 * PURPOSE:
 *   Adds two quadric error metrics together. Quadrics are 4x4 symmetric matrices
 *   used in mesh simplification algorithms to measure the error introduced by
 *   collapsing edges or merging vertices.
 * 
 * ARCHITECTURE ROLE:
 *   Used by the quadric-based mesh decimation algorithm to accumulate error
 *   metrics when merging vertices. This is a fundamental operation in the
 *   Quadric Error Metrics (QEM) simplification method.
 * 
 * MATHEMATICAL BASIS:
 *   Quadrics are represented as 10-element arrays (upper triangle of 4x4 matrix).
 *   Adding quadrics is simply element-wise addition, which corresponds to
 *   summing the error contributions from multiple faces.
 */

/**
 * addQuadrics - Adds two quadric error metrics
 * 
 * @param {Array<number>} q1 - First quadric (10-element array)
 * @param {Array<number>} q2 - Second quadric (10-element array)
 * 
 * @returns {Array<number>} Sum of the two quadrics (new 10-element array)
 * 
 * The quadrics are stored as the upper triangle of a 4x4 symmetric matrix:
 * [a, b, c, d, e, f, g, h, i, j] represents:
 * [a b c d]
 * [b e f g]
 * [c f h i]
 * [d g i j]
 */
export function addQuadrics(q1, q2) {
  // Element-wise addition of quadric components
  return q1.map((value, idx) => value + q2[idx]);
}
