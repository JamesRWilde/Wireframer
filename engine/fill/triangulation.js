'use strict';

function triangulateFaceEarClipping(face, V) {
  if (!face || face.length < 3) return [];
  if (face.length === 3) return [[face[0], face[1], face[2]]];

  const verts = face.map((idx) => V[idx]);

  // Estimate face normal (Newell method) to choose a stable 2D projection plane.
  let nx = 0;
  let ny = 0;
  let nz = 0;
  for (let i = 0; i < verts.length; i++) {
    const a = verts[i];
    const b = verts[(i + 1) % verts.length];
    nx += (a[1] - b[1]) * (a[2] + b[2]);
    ny += (a[2] - b[2]) * (a[0] + b[0]);
    nz += (a[0] - b[0]) * (a[1] + b[1]);
  }

  const ax = Math.abs(nx);
  const ay = Math.abs(ny);
  const az = Math.abs(nz);

  // Drop the dominant axis to project to 2D with maximal area.
  const proj = verts.map((p) => {
    if (ax >= ay && ax >= az) return [p[1], p[2]];
    if (ay >= ax && ay >= az) return [p[0], p[2]];
    return [p[0], p[1]];
  });

  function signedArea2(poly) {
    let area2 = 0;
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i];
      const b = poly[(i + 1) % poly.length];
      area2 += a[0] * b[1] - b[0] * a[1];
    }
    return area2;
  }

  const area2 = signedArea2(proj);
  if (Math.abs(area2) < 1e-10) {
    // Degenerate face, cannot triangulate
    return [];
  }

  // Ear clipping algorithm for simple polygons
  // Returns array of [a, b, c] indices into face[]
  const n = indices.length;
  const idxArr = Array.from({ length: n }, (_, i) => i);
  const triangles = [];
  let guard = 0;
  function isConvex(i0, i1, i2) {
    const a = proj[i0], b = proj[i1], c = proj[i2];
    // Cross product to check if angle is convex (CCW for positive area)
    return ((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])) * area2 > 0;
  }
  function pointInTriangle(p, a, b, c) {
    // Barycentric test
    const v0 = [c[0] - a[0], c[1] - a[1]];
    const v1 = [b[0] - a[0], b[1] - a[1]];
    const v2 = [p[0] - a[0], p[1] - a[1]];
    const dot00 = v0[0] * v0[0] + v0[1] * v0[1];
    const dot01 = v0[0] * v1[0] + v0[1] * v1[1];
    const dot02 = v0[0] * v2[0] + v0[1] * v2[1];
    const dot11 = v1[0] * v1[0] + v1[1] * v1[1];
    const dot12 = v1[0] * v2[0] + v1[1] * v2[1];
    const invDenom = 1 / (dot00 * dot11 - dot01 * dot01);
    const u = (dot11 * dot02 - dot01 * dot12) * invDenom;
    const v = (dot00 * dot12 - dot01 * dot02) * invDenom;
    return u >= -1e-8 && v >= -1e-8 && (u + v) <= 1 + 1e-8;
  }
  while (idxArr.length > 3 && guard++ < 100) {
    let earFound = false;
    for (let i = 0; i < idxArr.length; i++) {
      const i0 = idxArr[(i + idxArr.length - 1) % idxArr.length];
      const i1 = idxArr[i];
      const i2 = idxArr[(i + 1) % idxArr.length];
      if (!isConvex(i0, i1, i2)) continue;
      // Check if any other point is inside the triangle
      let hasPoint = false;
      for (let j = 0; j < idxArr.length; j++) {
        if (j === (i + idxArr.length - 1) % idxArr.length || j === i || j === (i + 1) % idxArr.length) continue;
        if (pointInTriangle(proj[idxArr[j]], proj[i0], proj[i1], proj[i2])) {
          hasPoint = true;
          break;
        }
      }
      if (hasPoint) continue;
      // Ear found
      triangles.push([indices[i0], indices[i1], indices[i2]]);
      idxArr.splice(i, 1);
      earFound = true;
      break;
    }
    if (!earFound) break; // No ear found, probably non-simple polygon
  }
  if (idxArr.length === 3) {
    triangles.push([indices[idxArr[0]], indices[idxArr[1]], indices[idxArr[2]]]);
  }
  return triangles;
}
// Expose for engine modules
window.triangulateFaceEarClipping = triangulateFaceEarClipping;
