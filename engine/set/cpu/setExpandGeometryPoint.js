/**
 * geometryExpandPoint.js - Expand a point outward from centroid
 *
 * PURPOSE:
 *   Moves a 2D point outward from a given centroid by a specified distance.
 *   Used for triangle seam expansion to prevent visible gaps between triangles.
 *
 * @param {number} px - Point X coordinate
 * @param {number} py - Point Y coordinate
 * @param {number} mx - Centroid X coordinate
 * @param {number} my - Centroid Y coordinate
 * @param {number} expandPx - Expansion distance in pixels
 * @returns {Array<number>} Expanded point [x, y]
 *
 * HOW IT WORKS:
 *   - Computes the vector from centroid to point.
 *   - If the point is at the centroid, returns the original point.
 *   - Otherwise, normalizes the direction and moves the point outward by expandPx.
 */
export function setExpandGeometryPoint(px, py, mx, my, expandPx) {
  // Vector from centroid to point
  let dx = px - mx;
  let dy = py - my;
  const dl = Math.hypot(dx, dy);

  // Return original if point is at centroid (avoid division by zero)
  if (dl <= 1e-6) return [px, py];

  // Normalize direction and apply expansion
  dx /= dl;
  dy /= dl;
  return [px + dx * expandPx, py + dy * expandPx];
}
