/**
 * normalizeVector3.js - Vector3 Normalization Utility
 *
 * PURPOSE:
 *   Normalizes a 3D vector to unit length, with fallback to a default
 *   vector if the input is null, undefined, or has near-zero magnitude.
 *   Uses a pre-allocated output array to avoid per-frame allocation.
 *
 * ARCHITECTURE ROLE:
 *   Called by sceneModel.js to normalize light direction and view
 *   direction vectors before uploading to GPU uniforms.
 */

"use strict";

/**
 * normalizeVector3 - Normalizes a 3D vector in place
 *
 * @param {Float32Array} out - Pre-allocated output array (3 elements)
 * @param {Array<number>|null} v - Source vector [x, y, z] to normalize
 * @param {Array<number>} fallback - Fallback vector if input is invalid
 * @returns {Float32Array} The output array with normalized values
 */
export function normalizeVector3(out, v, fallback) {
  // Extract components with safe access
  const x = Number(v?.[0]);
  const y = Number(v?.[1]);
  const z = Number(v?.[2]);

  // Compute vector magnitude
  const l = Math.hypot(x, y, z);

  // Use fallback if vector is invalid or near-zero
  if (!Number.isFinite(l) || l < 1e-6) {
    out[0] = fallback[0]; out[1] = fallback[1]; out[2] = fallback[2];
    return out;
  }

  // Normalize to unit length
  out[0] = x / l; out[1] = y / l; out[2] = z / l;
  return out;
}
