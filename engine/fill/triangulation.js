import { signedArea2 } from './signedArea2.js';
import { isConvex } from './isConvex.js';
import { pointInTriangle } from './pointInTriangle.js';

export function triangulateFaceEarClipping(face, V) {
  if (!face || face.length < 3) return [];
  if (face.length === 3) return [[face[0], face[1], face[2]]];

  const verts = face.map((idx) => V[idx]);

  // Estimate face normal (Newell method) to choose a stable 2D projection plane.
  let nx = 0, ny = 0, nz = 0;
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

  const proj = verts.map((p) => {
    if (ax >= ay && ax >= az) return [p[1], p[2]];
    if (ay >= ax && ay >= az) return [p[0], p[2]];
    return [p[0], p[1]];
  });

  const area2 = signedArea2(proj);
  if (Math.abs(area2) < 1e-10) return [];

  const n = face.length;
  const idxArr = Array.from({ length: n }, (_, i) => i);
  const triangles = [];
  let guard = 0;
  function clipEarLocal() {
    for (let i = 0; i < idxArr.length; i++) {
      const i0 = idxArr[(i + idxArr.length - 1) % idxArr.length];
      const i1 = idxArr[i];
      const i2 = idxArr[(i + 1) % idxArr.length];
      if (!isConvex(proj, i0, i1, i2, area2)) continue;

      let hasPoint = false;
      for (let j = 0; j < idxArr.length; j++) {
        if (j === (i + idxArr.length - 1) % idxArr.length || j === i || j === (i + 1) % idxArr.length) continue;
        if (pointInTriangle(proj[idxArr[j]], proj[i0], proj[i1], proj[i2])) {
          hasPoint = true;
          break;
        }
      }
      if (hasPoint) continue;

      triangles.push([face[i0], face[i1], face[i2]]);
      idxArr.splice(i, 1);
      return true;
    }
    return false;
  }

  while (idxArr.length > 3 && guard++ < 100) {
    if (!clipEarLocal()) break;
  }
  if (idxArr.length === 3) triangles.push([face[idxArr[0]], face[idxArr[1]], face[idxArr[2]]]);

  return triangles;
}

// Legacy global export removed; import `triangulateFaceEarClipping` where needed.
