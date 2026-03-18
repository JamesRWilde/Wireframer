/**
 * fixWinding.js - Face Winding Detection and Correction
 *
 * PURPOSE:
 *   Detects whether face normals in a mesh point inward or outward
 *   relative to the mesh center, and flips inverted faces. OBJ files
 *   from different exporters may use CW or CCW winding — this
 *   normalizes them to point outward.
 *
 * APPROACH:
 *   1. Compute the bounding box center
 *   2. For each face, compute the normal (cross product of edges)
 *   3. Check if the normal points toward or away from center
 *   4. If majority point inward, flip all faces
 *
 * This is conservative: it only flips if a clear majority (>50%) of
 * faces point inward. Mixed winding files are left as-is (the user
 * should fix the source).
 */

/**
 * Computes the face normal (non-normalized) from three vertex positions.
 * Uses the cross product of edge vectors.
 */
function faceNormal(a, b, c) {
  const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
  const vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
  return [
    uy * vz - uz * vy,
    uz * vx - ux * vz,
    ux * vy - uy * vx
  ];
}

/**
 * Dot product of two 3D vectors.
 */
function dot3(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

/**
 * fixWinding - Detects and corrects inverted face normals
 *
 * @param {Object} meshObj - Mesh with V (vertices) and F (faces)
 * @returns {Object} The same meshObj with corrected face winding.
 *   Sets meshObj._windingFixed = true and meshObj._windingDirection = 'cw' or 'ccw'
 */
export function fixWinding(meshObj) {
  const V = meshObj.V;
  const F = meshObj.F;
  if (!V?.length || !F?.length) return meshObj;

  // Step 1: Compute bounding box center
  let cx = 0, cy = 0, cz = 0;
  for (let i = 0; i < V.length; i++) {
    cx += V[i][0];
    cy += V[i][1];
    cz += V[i][2];
  }
  cx /= V.length;
  cy /= V.length;
  cz /= V.length;

  // Step 2: Count inward vs outward pointing faces
  let inwardCount = 0;
  let outwardCount = 0;

  for (let i = 0; i < F.length; i++) {
    const face = F[i];
    const indices = face.indices || face;
    if (!Array.isArray(indices) || indices.length < 3) continue;

    const a = V[indices[0]];
    const b = V[indices[1]];
    const c = V[indices[2]];

    // Normal from cross product
    const n = faceNormal(a, b, c);

    // Vector from face center to bounding box center
    const fx = (a[0] + b[0] + c[0]) / 3;
    const fy = (a[1] + b[1] + c[1]) / 3;
    const fz = (a[2] + b[2] + c[2]) / 3;
    const toCenter = [cx - fx, cy - fy, cz - fz];

    // If dot product is positive, normal points toward center (inward)
    const d = dot3(n, toCenter);
    if (d > 0) inwardCount++;
    else outwardCount++;
  }

  // Step 3: If majority point inward, flip all faces
  const total = inwardCount + outwardCount;
  if (total === 0) return meshObj;

  const inwardRatio = inwardCount / total;

  if (inwardRatio > 0.5) {
    // Majority inward → flip all faces
    for (const face of F) {
      const indices = face.indices || face;
      if (Array.isArray(indices)) {
        // Swap [0] and [2] to reverse winding
        const tmp = indices[0];
        indices[0] = indices[2];
        indices[2] = tmp;
      }
    }
    // Also flip triangleNormals if they exist (they'll be recalculated, but just in case)
    if (meshObj.triangleNormals) {
      for (const cornerNorms of meshObj.triangleNormals) {
        if (Array.isArray(cornerNorms) && cornerNorms.length >= 3) {
          const tmp = cornerNorms[0];
          cornerNorms[0] = cornerNorms[2];
          cornerNorms[2] = tmp;
        }
      }
    }
    meshObj._windingFixed = true;
    meshObj._windingDirection = 'ccw'; // Flipped from CW to CCW
  } else {
    meshObj._windingFixed = false;
    meshObj._windingDirection = inwardRatio < 0.3 ? 'ccw' : 'mixed';
  }

  return meshObj;
}
