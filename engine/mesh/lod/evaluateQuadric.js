/**
 * evaluateQuadric.js - Quadric Error Metric Evaluation
 * 
 * PURPOSE:
 *   Evaluates a quadric error metric at a given 3D point. The quadric
 *   represents the sum of squared distances from the point to a set of
 *   planes (typically the planes of faces adjacent to a vertex).
 * 
 * ARCHITECTURE ROLE:
 *   Used by edgeCost to compute the geometric error introduced by
 *   collapsing an edge. This is the core operation in Quadric Error
 *   Metrics (QEM) mesh simplification.
 * 
 * MATHEMATICAL BASIS:
 *   A quadric Q is represented as a 4x4 symmetric matrix, stored as
 *   the 10 unique elements in the upper triangle:
 *   Q = [a b c d]
 *       [b e f g]
 *       [c f h i]
 *       [d g i j]
 *   
 *   The error at point p = [x, y, z] is:
 *   E(p) = p^T * Q * p
 *        = a*x² + 2*b*x*y + 2*c*x*z + 2*d*x + e*y² + 2*f*y*z + 2*g*y + h*z² + 2*i*z + j
 */

"use strict";

/**
 * evaluateQuadric - Evaluates quadric error metric at a point
 * 
 * @param {Array<number>} q - Quadric as 10-element array [a,b,c,d,e,f,g,h,i,j]
 * @param {Array<number>} p - 3D point [x, y, z]
 * 
 * @returns {number} The quadric error value at the point
 *   Lower values indicate the point is closer to the represented planes
 */
export function evaluateQuadric(q, p) {
  // Extract point coordinates
  const [x, y, z] = p;
  
  // Extract quadric components
  const [a, b, c, d, e, f, g, h, i, j] = q;
  
  // Evaluate the quadratic form: p^T * Q * p
  // This is the sum of squared distances to the represented planes
  return a*x*x + 2*b*x*y + 2*c*x*z + 2*d*x + e*y*y + 2*f*y*z + 2*g*y + h*z*z + 2*i*z + j;
}
