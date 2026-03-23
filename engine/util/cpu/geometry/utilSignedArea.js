/**
 * signArea.js - Signed Area Calculation for 2D Polygons
 * 
 * PURPOSE:
 *   Computes twice the signed area of a 2D polygon using the shoelace formula.
 *   The sign indicates the polygon's winding order (positive = counter-clockwise,
 *   negative = clockwise). This is used by the ear clipping algorithm to determine
 *   vertex convexity.
 * 
 * ARCHITECTURE ROLE:
 *   Called by triangulateFaceEarClipping to determine the polygon's winding order.
 *   The winding order is needed to correctly interpret the convexity test results.
 * 
 * MATHEMATICAL BASIS:
 *   Uses the shoelace formula (also known as the surveyor's formula):
 *   Area = ½ × Σ(xᵢ × yᵢ₊₁ - xᵢ₊₁ × yᵢ)
 *   We return 2×Area to avoid the division and keep the result as an integer
 *   for exact comparison with cross products.
 */

"use strict";

/**
 * signArea - Computes twice the signed area of a 2D polygon
 * 
 * @param {Array<Array<number>>} poly - Array of 2D vertices [[x,y], ...]
 *   The polygon is assumed to be closed (last vertex connects to first)
 * 
 * @returns {number} Twice the signed area of the polygon
 *   Positive for counter-clockwise winding, negative for clockwise
 *   Zero for degenerate polygons (collinear points)
 * 
 * The factor of 2 is intentional - it avoids division and keeps the result
 * compatible with cross product comparisons in the convexity test.
 */
export function utilSignedArea(poly) {
  let area2 = 0;
  
  // Iterate over all edges of the polygon
  // Each edge connects vertex i to vertex (i+1) mod n
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    
    // Shoelace formula: sum of cross products of consecutive edge vectors
    // This gives twice the signed area
    area2 += a[0] * b[1] - b[0] * a[1];
  }
  
  return area2;
}
