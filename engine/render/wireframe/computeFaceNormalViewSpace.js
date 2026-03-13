/**
 * computeFaceNormalViewSpace.js - View-Space Face Normal Computation
 * 
 * PURPOSE:
 *   Computes the outward-facing normal for a single triangle face in view space.
 *   Ensures normal points away from mesh center for correct orientation.
 * 
 * ARCHITECTURE ROLE:
 *   Called by computeFaceNormals for each triangle.
 *   Used by edge classification to determine face orientation.
 * 
 * NORMAL ORIENTATION:
 *   Normal is flipped if it points toward mesh center (dot product > 0).
 *   This ensures normals always point outward from the mesh.
 */

/**
 * computeFaceNormalViewSpace - Computes outward-facing normal for a triangle
 * 
 * @param {Array<Array<number>>} T - Transformed vertex positions in view space
 * @param {number} a - Index of first vertex
 * @param {number} b - Index of second vertex
 * @param {number} c - Index of third vertex
 * @param {number} cx - Mesh center X coordinate
 * @param {number} cy - Mesh center Y coordinate
 * @param {number} cz - Mesh center Z coordinate
 * 
 * @returns {Array<number>|null} Normalized normal vector [nx, ny, nz], or null if degenerate
 * 
 * The function:
 * 1. Gets vertex positions from transformed array
 * 2. Computes edge vectors
 * 3. Cross product gives face normal
 * 4. Normalizes the normal
 * 5. Flips if pointing toward mesh center
 */
export function computeFaceNormalViewSpace(T, a, b, c, cx, cy, cz) {
  // Get vertex positions
  const ax = T[a][0], ay = T[a][1], az = T[a][2];
  const bx = T[b][0], by = T[b][1], bz = T[b][2];
  const ccx = T[c][0], ccy = T[c][1], ccz = T[c][2];

  // Compute edge vectors
  const ux = bx - ax, uy = by - ay, uz = bz - az;
  const vx = ccx - ax, vy = ccy - ay, vz = ccz - az;

  // Cross product U x V gives face normal
  let nx = uy * vz - uz * vy;
  let ny = uz * vx - ux * vz;
  let nz = ux * vy - uy * vx;

  // Normalize
  const nl = Math.hypot(nx, ny, nz);
  if (nl < 1e-9) return null; // Degenerate triangle
  nx /= nl; ny /= nl; nz /= nl;

  // Compute face center
  const faceCenterX = (ax + bx + ccx) / 3;
  const faceCenterY = (ay + by + ccy) / 3;
  const faceCenterZ = (az + bz + ccz) / 3;
  
  // Vector from face center to mesh center
  const toCenterX = cx - faceCenterX;
  const toCenterY = cy - faceCenterY;
  const toCenterZ = cz - faceCenterZ;
  
  // Flip normal if it points toward mesh center
  const dot = nx * toCenterX + ny * toCenterY + nz * toCenterZ;
  if (dot > 0) {
    nx = -nx; ny = -ny; nz = -nz;
  }

  return [nx, ny, nz];
}
