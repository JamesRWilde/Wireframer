/**
 * resolveTriangleNormal.js - Triangle Normal Resolution
 * 
 * PURPOSE:
 *   Resolves the surface normal for a triangle, supporting both flat and smooth shading.
 *   For smooth shading, averages corner normals; for flat, computes face normal.
 * 
 * ARCHITECTURE ROLE:
 *   Called by fill renderer to get normals for lighting calculations.
 *   Handles rotation of model-space normals to view space.
 * 
 * SHADING MODES:
 *   - Flat: Computes face normal from edge cross product
 *   - Smooth: Averages pre-computed corner normals, rotated to view space
 */

import { getRotation } from '@engine/state/render/physicsState.js';

/**
 * resolveTriangleNormal - Resolves surface normal for a triangle
 * 
 * @param {Array<number>} tri - Triangle vertex indices [a, b, c]
 * @param {number} triIndex - Index of this triangle in the face array
 * @param {Array<Array<number>>} T - Transformed vertex positions in view space
 * @param {Array<Array<Array<number>>>} triCornerNormals - Per-corner normals in model space
 * @param {boolean} useSmoothShading - Whether to use smooth shading
 *
 * @returns {Array<number>|null} Normalized normal vector [nx, ny, nz], or null if degenerate
 *
 * The function:
 * 1. For smooth shading: rotates corner normals to view space and averages
 * 2. For flat shading: computes face normal from edge cross product
 * 3. Normalizes the result
 * 4. Returns null if normal is degenerate (near-zero length)
 */
export function triangleNormalCpu(tri, triIndex, T, triCornerNormals, useSmoothShading) {
  // Get triangle vertex indices
  const [a, b, c] = tri;
  const v0 = T[a];
  const v1 = T[b];
  const v2 = T[c];

  // Compute edge vectors for flat shading fallback
  const ux = v1[0] - v0[0];
  const uy = v1[1] - v0[1];
  const uz = v1[2] - v0[2];
  const vx = v2[0] - v0[0];
  const vy = v2[1] - v0[1];
  const vz = v2[2] - v0[2];

  let nx, ny, nz;
  
  if (useSmoothShading) {
    // Smooth shading: use pre-computed corner normals
    // Corner normals are stored in model space; rotate them to view space
    // so lighting behaves as if the object spins under a fixed light source
    const cn = triCornerNormals[triIndex];
    const R = getRotation();
    
    if (R) {
      // Rotate each corner normal by current physics rotation matrix
      const rotate = v => [
        R[0]*v[0] + R[1]*v[1] + R[2]*v[2],
        R[3]*v[0] + R[4]*v[1] + R[5]*v[2],
        R[6]*v[0] + R[7]*v[1] + R[8]*v[2],
      ];
      const na = rotate(cn[0]);
      const nb = rotate(cn[1]);
      const nc = rotate(cn[2]);
      
      // Sum rotated corner normals (will normalize below)
      nx = na[0] + nb[0] + nc[0];
      ny = na[1] + nb[1] + nc[1];
      nz = na[2] + nb[2] + nc[2];
    } else {
      // No rotation matrix available, use corner normals as-is
      const na = cn[0], nb = cn[1], nc = cn[2];
      nx = na[0] + nb[0] + nc[0];
      ny = na[1] + nb[1] + nc[1];
      nz = na[2] + nb[2] + nc[2];
    }
  } else {
    // Flat shading: compute face normal from edge cross product
    // U x V gives perpendicular to triangle plane
    nx = uy * vz - uz * vy;
    ny = uz * vx - ux * vz;
    nz = ux * vy - uy * vx;
  }
  
  // Normalize the normal vector
  const nl = Math.hypot(nx, ny, nz);
  
  // Return null if degenerate (near-zero length normal)
  if (nl < 1e-6) return null;
  
  return [nx / nl, ny / nl, nz / nl];
}
