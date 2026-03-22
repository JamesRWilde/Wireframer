/**
 * getModelFaceNormals.js - Face Normal Computation
 * 
 * PURPOSE:
 *   Computes outward-facing normals for all triangle faces in a model.
 *   Ensures normals point away from mesh center for correct lighting.
 * 
 * ARCHITECTURE ROLE:
 *   Called by getModelTriCornerNormals to compute base face normals.
 *   Results are cached on the model object for reuse.
 * 
 * NORMAL ORIENTATION:
 *   Normals are oriented to point outward by checking dot product with
 *   vector from mesh center to face center. If negative, normal is flipped.
 */

/**
 * getModelFaceNormals - Computes outward-facing normals for all faces
 * 
 * @param {Object} model - Model object with vertex array V
 * @param {Array<Array<number>>} triFaces - Array of triangle face indices
 * 
 * @returns {Array<Array<number>>} Array of normalized face normals [nx, ny, nz]
 * 
 * The function:
 * 1. Returns cached normals if available and valid
 * 2. Computes mesh center for normal orientation
 * 3. For each face, computes normal from edge cross product
 * 4. Orients normal outward using dot product with center-to-face vector
 * 5. Caches result on model for future use
 */
export function faceNormals(model, triFaces) {
  // Return cached normals if available and valid
  if (model._faceNormals?.length === triFaces.length) return model._faceNormals;

  const V = model.V;
  const faceNormals = new Array(triFaces.length);

  // Compute mesh center for normal orientation
  let cx = 0;
  let cy = 0;
  let cz = 0;
  for (const v of V) {
    cx += v[0];
    cy += v[1];
    cz += v[2];
  }
  const invCount = V.length ? 1 / V.length : 1;
  cx *= invCount;
  cy *= invCount;
  cz *= invCount;

  // Compute normal for each face
  for (let i = 0; i < triFaces.length; i++) {
    // Handle both raw arrays and objects with indices property using optional chaining
    const tri = triFaces[i]?.indices ?? triFaces[i];
    const a = V[tri[0]];
    const b = V[tri[1]];
    const c = V[tri[2]];

    // Compute edge vectors
    const ux = b[0] - a[0];
    const uy = b[1] - a[1];
    const uz = b[2] - a[2];
    const vx = c[0] - a[0];
    const vy = c[1] - a[1];
    const vz = c[2] - a[2];

    // Cross product U x V gives face normal
    let nx = uy * vz - uz * vy;
    let ny = uz * vx - ux * vz;
    let nz = ux * vy - uy * vx;
    let nl = Math.hypot(nx, ny, nz);
    
    // Use default up normal for degenerate faces
    if (nl < 1e-9) {
      faceNormals[i] = [0, 1, 0];
      continue;
    }

    // Compute vector from mesh center to face center
    const fx = (a[0] + b[0] + c[0]) / 3 - cx;
    const fy = (a[1] + b[1] + c[1]) / 3 - cy;
    const fz = (a[2] + b[2] + c[2]) / 3 - cz;
    
    // Flip normal if it points inward (dot product with center-to-face is negative)
    if (nx * fx + ny * fy + nz * fz < 0) {
      nx = -nx;
      ny = -ny;
      nz = -nz;
    }

    // Normalize and store
    nl = Math.hypot(nx, ny, nz);
    faceNormals[i] = [nx / nl, ny / nl, nz / nl];
  }

  return faceNormals;
}
