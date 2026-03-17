/**
 * resolveTriangleNormal.js - Surface Normal Resolver for Triangles
 *
 * PURPOSE:
 *   Computes the per-triangle normal to support both flat and smooth shading
 *   in the fill renderer. Used to calculate lighting and face shading.
 *
 * ARCHITECTURE ROLE:
 *   Given triangle vertex indices and optional smooth normals, resolves a
 *   normalized surface normal that is used by lighting and shading passes.
 *
 * DATA FORMAT:
 *   - tri: [a, b, c] indices into the vertex array
 *   - T: Array of transformed 3D vertex positions (e.g. [[x,y,z], ...])
 *   - triCornerNormals: Array of per-triangle per-corner normals
 *     (smooth shading data), structured like [[nA,nB,nC], ...]
 *   - R: Optional 3x3 rotation matrix in row-major order
 *
 * @param {number[]} tri - Triangle vertex indices [a, b, c]
 * @param {number} triIndex - Triangle index for corner normals lookup
 * @param {Array<[number,number,number]>} T - Transformed vertex positions
 * @param {Array<([number,number,number])[]>} triCornerNormals - Per-corner normals for smooth shading
 * @param {boolean} useSmoothShading - Whether smooth shading is enabled
 * @param {number[]|null} R - Optional rotation matrix (row-major) for rotating normals
 * @returns {[number,number,number]|null} Normalized normal or null if degenerate
 */

"use strict";

export function getRenderResolveTriangleNormalGpu(tri, triIndex, T, triCornerNormals, useSmoothShading, R) {
  const [a, b, c] = tri;
  const v0 = T[a], v1 = T[b], v2 = T[c];
  let nx, ny, nz;
  if (useSmoothShading && triCornerNormals?.[triIndex]) {
    const cn = triCornerNormals[triIndex];
    if (R) {
      // Apply rotation to each corner normal before averaging.
      // This is used when normals are in model space and need to be rotated
      // into view space together with vertex positions.
      const rotate = v => [
        R[0]*v[0] + R[1]*v[1] + R[2]*v[2],
        R[3]*v[0] + R[4]*v[1] + R[5]*v[2],
        R[6]*v[0] + R[7]*v[1] + R[8]*v[2],
      ];
      const na = rotate(cn[0]);
      const nb = rotate(cn[1]);
      const nc = rotate(cn[2]);
      // Average corner normals for smooth shading
      nx = na[0] + nb[0] + nc[0];
      ny = na[1] + nb[1] + nc[1];
      nz = na[2] + nb[2] + nc[2];
    } else {
      // Already in the correct space - just average
      nx = cn[0][0] + cn[1][0] + cn[2][0];
      ny = cn[0][1] + cn[1][1] + cn[2][1];
      nz = cn[0][2] + cn[1][2] + cn[2][2];
    }
  } else {
    // Flat shading
    const ux = v1[0] - v0[0], uy = v1[1] - v0[1], uz = v1[2] - v0[2];
    const vx = v2[0] - v0[0], vy = v2[1] - v0[1], vz = v2[2] - v0[2];
    nx = uy * vz - uz * vy;
    ny = uz * vx - ux * vz;
    nz = ux * vy - uy * vx;
  }
  const nl = Math.hypot(nx, ny, nz);
  if (nl < 1e-6) return null;
  return [nx / nl, ny / nl, nz / nl];
}
