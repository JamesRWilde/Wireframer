/**
 * expandTriangleForSeam.js - Triangle Seam Expansion
 * 
 * PURPOSE:
 *   Expands triangle vertices outward from centroid to prevent visible seams
 *   between adjacent triangles in smooth-shaded meshes.
 * 
 * ARCHITECTURE ROLE:
 *   Called by fill renderer before rasterizing triangles.
 *   Eliminates thin gaps that can appear between triangles due to rounding.
 * 
 * WHY EXPANSION IS NEEDED:
 *   When triangles share edges, sub-pixel rounding can leave tiny gaps.
 *   Expanding each triangle slightly ensures edges overlap, eliminating gaps.
 */

/**
 * expandTriangleForSeam - Expands triangle vertices outward from centroid
 * 
 * @param {Array<Array<number>>} tri2d - Triangle vertices [[x1,y1], [x2,y2], [x3,y3]]
 * @param {number} seamExpandPx - Expansion distance in pixels (0 = no expansion)
 * 
 * @returns {Array<Array<number>>} Expanded triangle vertices
 * 
 * The function:
 * 1. Returns original vertices if expansion is disabled
 * 2. Computes triangle centroid
 * 3. Moves each vertex outward from centroid by seamExpandPx pixels
 */
export function expandTriangleForSeam(tri2d, seamExpandPx) {
  // Extract vertex coordinates
  const ax = tri2d[0][0];
  const ay = tri2d[0][1];
  const bx = tri2d[1][0];
  const by = tri2d[1][1];
  const cx = tri2d[2][0];
  const cy = tri2d[2][1];

  // Return original vertices if expansion is disabled
  if (!(seamExpandPx > 0)) {
    return [[ax, ay], [bx, by], [cx, cy]];
  }

  // Compute triangle centroid
  const mx = (ax + bx + cx) / 3;
  const my = (ay + by + cy) / 3;

  /**
   * expandPoint - Moves a point outward from centroid
   * @param {number} px - Point X coordinate
   * @param {number} py - Point Y coordinate
   * @returns {Array<number>} Expanded point [x, y]
   */
  function expandPoint(px, py) {
    // Vector from centroid to point
    let dx = px - mx;
    let dy = py - my;
    const dl = Math.hypot(dx, dy);
    
    // Return original if point is at centroid (avoid division by zero)
    if (dl <= 1e-6) return [px, py];
    
    // Normalize direction and apply expansion
    dx /= dl;
    dy /= dl;
    return [px + dx * seamExpandPx, py + dy * seamExpandPx];
  }

  // Expand all three vertices
  return [expandPoint(ax, ay), expandPoint(bx, by), expandPoint(cx, cy)];
}
