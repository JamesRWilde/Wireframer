/**
 * transformSync.js - Synchronous Vertex Transform
 *
 * PURPOSE:
 *   Performs vertex rotation and perspective projection on the main
 *   thread as a synchronous fallback when the worker is unavailable.
 *   Rotates vertices by a 3x3 matrix and projects to 2D screen space.
 *
 * ARCHITECTURE ROLE:
 *   Called by frameData.js when the cached worker result is not yet
 *   available. Provides the same computation as the vertex transform
 *   worker but on the main thread.
 *
 * DETAILS:
 *   Uses manual rotation matrix application (dot products with rows)
 *   and perspective division (divide by depth + offset) for projection.
 */

"use strict";

/**
 * transformSync - Synchronously transforms and projects vertices
 *
 * @param {Array<Array<number>>} V - Vertex array [[x,y,z], ...]
 * @param {Array<number>} Rmat - 3x3 rotation matrix as flat 9-element array
 * @param {number} fov - Field of view for perspective projection
 * @param {number} halfW - Half canvas width for screen-space centering
 * @param {number} halfH - Half canvas height for screen-space centering
 * @param {number} modelCy - Model center Y offset
 * @param {number} vertexCount - Number of vertices to transform
 * @returns {{ T: Array<Array<number>>, P2: Array<Array<number>> }}
 *   T: 3D transformed positions, P2: 2D projected positions
 */
export function utilTransformSync(V, Rmat, fov, halfW, halfH, modelCy, vertexCount) {
  // Extract rotation matrix elements (row-major order)
  const r00 = Rmat[0], r01 = Rmat[1], r02 = Rmat[2];
  const r10 = Rmat[3], r11 = Rmat[4], r12 = Rmat[5];
  const r20 = Rmat[6], r21 = Rmat[7], r22 = Rmat[8];

  // Allocate output arrays
  const T = new Array(vertexCount);
  const P2 = new Array(vertexCount);

  // Transform each vertex
  for (let i = 0; i < vertexCount; i++) {
    const vx = V[i][0], vy = V[i][1], vz = V[i][2];

    // Apply rotation matrix (row dot products)
    const tx = r00 * vx + r01 * vy + r02 * vz;
    const ty = r10 * vx + r11 * vy + r12 * vz;
    const tz = r20 * vx + r21 * vy + r22 * vz;

    // Store 3D transformed position
    T[i] = [tx, ty, tz];

    // Orthographic projection: no depth-dependent scaling.
    // The OBJ shape is preserved exactly — no perspective distortion.
    P2[i] = [halfW + tx * fov, halfH - (ty - modelCy) * fov];
  }

  return { T, P2 };
}
