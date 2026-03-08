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
    const out = [];
    for (let i = 1; i < face.length - 1; i++) out.push([face[0], face[i], face[i + 1]]);
    return out;
  }

  const ccw = area2 > 0;
  const order = Array.from({ length: face.length }, (_, i) => i);
  if (!ccw) order.reverse();

  function cross2(a, b, c) {
    return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
  }

  function pointInTri(p, a, b, c) {
    const c1 = cross2(a, b, p);
    const c2 = cross2(b, c, p);
    const c3 = cross2(c, a, p);
    const hasNeg = c1 < -1e-10 || c2 < -1e-10 || c3 < -1e-10;
    const hasPos = c1 > 1e-10 || c2 > 1e-10 || c3 > 1e-10;
    return !(hasNeg && hasPos);
  }

  const tris = [];
  let guard = face.length * face.length;

  while (order.length > 3 && guard-- > 0) {
    let earFound = false;

    for (let i = 0; i < order.length; i++) {
      const ia = order[(i - 1 + order.length) % order.length];
      const ib = order[i];
      const ic = order[(i + 1) % order.length];

      const a = proj[ia];
      const b = proj[ib];
      const c = proj[ic];
      if (cross2(a, b, c) <= 1e-10) continue;

      let contains = false;
      for (let j = 0; j < order.length; j++) {
        const ip = order[j];
        if (ip === ia || ip === ib || ip === ic) continue;
        if (pointInTri(proj[ip], a, b, c)) {
          contains = true;
          break;
        }
      }
      if (contains) continue;

      tris.push([face[ia], face[ib], face[ic]]);
      order.splice(i, 1);
      earFound = true;
      break;
    }

    if (!earFound) {
      for (let i = 1; i < order.length - 1; i++) {
        tris.push([face[order[0]], face[order[i]], face[order[i + 1]]]);
      }
      return tris;
    }
  }

  if (order.length === 3) {
    tris.push([face[order[0]], face[order[1]], face[order[2]]]);
  }

  return tris;
}

function getModelTriangles(model) {
  const faces = model.F || [];
  const tris = [];
  const V = model.V || [];

  for (const face of faces) {
    if (!face || face.length < 3) continue;
    if (face.length === 3) {
      tris.push([face[0], face[1], face[2]]);
    } else if (face.length === 4) {
      tris.push([face[0], face[1], face[2]]);
      tris.push([face[0], face[2], face[3]]);
    } else {
      tris.push(...triangulateFaceEarClipping(face, V));
    }
  }

  return tris;
}
