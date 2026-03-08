/**
 * interpolateInSphere.js - Vertex interpolation preserving the unit sphere law
 *
 * One function per file module.
 */

"use strict";

/**
 * interpolateInSphere - Interpolates between two 3D positions on or inside the unit sphere.
 *
 * Uses different strategies depending on vertex position:
 *
 * - Surface vertices (r >= 0.95): Uses slerp (spherical linear interpolation).
 *   The vertex moves along the sphere surface, never cutting through the
 *   interior. Normalises the result to radius 1 to eliminate floating-point drift.
 *
 * - Interior vertices (r < 0.95): Uses lerp (linear interpolation) followed
 *   by a hard clamp if the result exceeds the sphere radius.
 *
 * @param {number[]} a - Start position [x, y, z], normalised to unit sphere
 * @param {number[]} b - End position [x, y, z], normalised to unit sphere
 * @param {number} t - Interpolation factor (0 = start, 1 = end)
 * @returns {number[]} Interpolated position [x, y, z], guaranteed inside unit sphere
 */
export function interpolateInSphere(a, b, t) {
  if (t <= 0) return [a[0], a[1], a[2]];
  if (t >= 1) return [b[0], b[1], b[2]];

  const rA = Math.hypot(a[0], a[1], a[2]);
  const rB = Math.hypot(b[0], b[1], b[2]);

  // Surface vertices: slerp along the sphere arc
  if (rA > 0.95 && rB > 0.95) {
    const dot = a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
    const angle = Math.acos(Math.min(1, Math.max(-1, dot)));
    const sinA = Math.sin(angle);

    if (sinA < 1e-6) {
      const r = Math.hypot(a[0]+b[0], a[1]+b[1], a[2]+b[2]) || 1;
      return [(a[0]+b[0])/r, (a[1]+b[1])/r, (a[2]+b[2])/r];
    }

    const wA = Math.sin((1 - t) * angle) / sinA;
    const wB = Math.sin(t * angle) / sinA;
    const x = wA*a[0] + wB*b[0];
    const y = wA*a[1] + wB*b[1];
    const z = wA*a[2] + wB*b[2];
    const r = Math.hypot(x, y, z) || 1;
    return [x/r, y/r, z/r];
  }

  // Interior vertices: lerp + sphere clamp
  const x = a[0] + (b[0] - a[0]) * t;
  const y = a[1] + (b[1] - a[1]) * t;
  const z = a[2] + (b[2] - a[2]) * t;
  const r2 = x*x + y*y + z*z;
  if (r2 > 1) {
    const r = Math.sqrt(r2);
    return [x/r, y/r, z/r];
  }
  return [x, y, z];
}
