/**
 * utilComputeFaceNormals.js - Compute Outward-Facing Face Normals
 *
 * PURPOSE:
 *   Computes unit-length face normals for every triangle in a geometry array,
 *   oriented outward relative to the mesh centroid. Unlike utilFaceNormals
 *   (which checks for a cached _faceNormals on the model), this is a pure
 *   computation function with no caching — it always computes fresh normals.
 *
 * ARCHITECTURE ROLE:
 *   Called by initBakeMesh during the one-time bake phase. The baker stores
 *   the result in the model's _faceNormals field. Subsequent frames call
 *   utilFaceNormals which returns model._faceNormals instantly if the face
 *   count matches — O(1) per frame instead of O(n) recomputation.
 *
 * WHY THIS EXISTS:
 *   Face normals are the foundation of all lighting calculations in the fill
 *   renderer. Without outward-facing normals, triangles would light from the
 *   wrong direction. Computing these requires a cross product per face,
 *   normalisation, and an orientation check against the mesh centroid — work
 *   that should only happen once during baking, not every frame.
 */

"use strict";

/**
 * utilComputeFaceNormals - Compute outward-facing unit normals for every face
 *
 * @param {Array<Array<number>>} V - Clean vertex array [[x,y,z], ...]
 * @param {Array<Array<number>>} triFaces - Triangle face vertex indices [[a,b,c], ...]
 * @returns {Array<Array<number>>} Face normals [[nx,ny,nz], ...] — one unit vector per face,
 *   each oriented outward from the mesh centroid
 *
 * For each face:
 *   1. Extract vertices a, b, c from the face indices
 *   2. Compute edge vectors: u = b-a, v = c-a
 *   3. Cross product u × v gives the unnormalised face normal
 *   4. Compute mesh centroid from all vertices
 *   5. Compute vector from centroid to face centroid
 *   6. If normal dot (face-centre - mesh-centre) < 0, flip the normal outward
 *   7. Normalise to unit length
 */
export function utilComputeFaceNormals(V, triFaces) {
  const len = triFaces.length;
  const normals = new Array(len);

  // Compute mesh centroid (average of all vertex positions).
  // The centroid is the reference point for determining "outward" — a face
  // normal should point away from the center of the mesh.
  let cx = 0, cy = 0, cz = 0;
  for (const v of V) {
    cx += v[0]; cy += v[1]; cz += v[2];
  }
  const inv = V.length > 0 ? 1 / V.length : 0;
  cx *= inv; cy *= inv; cz *= inv;

  // Compute outward-facing unit normal for each triangle face
  for (let i = 0; i < len; i++) {
    const a = V[triFaces[i][0]], b = V[triFaces[i][1]], c = V[triFaces[i][2]];

    // Edge vectors from vertex a — these two vectors define the face plane
    let ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
    let vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];

    // Cross product gives unnormalised face normal (direction depends on
    // vertex winding order — orientation check below corrects this)
    let nx = uy * vz - uz * vy;
    let ny = uz * vx - ux * vz;
    let nz = ux * vy - uy * vx;
    const nl = Math.hypot(nx, ny, nz);

    // Degenerate face (zero area) — assign default up to prevent NaN propagation.
    // These faces render invisible anyway since they have no surface area.
    if (nl < 1e-9) {
      normals[i] = [0, 1, 0];
      continue;
    }

    nx /= nl; ny /= nl; nz /= nl;

    // Orient outward: compute vector from mesh centroid to face centroid.
    // If dot product of normal with this vector is negative, normal points
    // inward — flip it so it points outward from the mesh center.
    const fx = (a[0] + b[0] + c[0]) / 3 - cx;
    const fy = (a[1] + b[1] + c[1]) / 3 - cy;
    const fz = (a[2] + b[2] + c[2]) / 3 - cz;
    if (nx * fx + ny * fy + nz * fz < 0) {
      nx = -nx; ny = -ny; nz = -nz;
    }

    normals[i] = [nx, ny, nz];
  }

  return normals;
}
