'use strict';

function getModelShadingMode(model, triFaces) {
  // Engine-owned mesh only
  const mode = (model && model._shadingMode) || 'auto';
  if (mode === 'flat' || mode === 'smooth') return mode;
  return triFaces.length > 80 ? 'smooth' : 'flat';
}

function getModelFaceNormals(model, triFaces) {
  if (model._faceNormals && model._faceNormals.length === triFaces.length) return model._faceNormals;

  const V = model.V;
  const faceNormals = new Array(triFaces.length);

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

  for (let i = 0; i < triFaces.length; i++) {
    const tri = triFaces[i] && triFaces[i].indices ? triFaces[i].indices : triFaces[i];
    const a = V[tri[0]];
    const b = V[tri[1]];
    const c = V[tri[2]];

    const ux = b[0] - a[0];
    const uy = b[1] - a[1];
    const uz = b[2] - a[2];
    const vx = c[0] - a[0];
    const vy = c[1] - a[1];
    const vz = c[2] - a[2];

    let nx = uy * vz - uz * vy;
    let ny = uz * vx - ux * vz;
    let nz = ux * vy - uy * vx;
    let nl = Math.hypot(nx, ny, nz);
    if (nl < 1e-9) {
      faceNormals[i] = [0, 1, 0];
      continue;
    }

    const fx = (a[0] + b[0] + c[0]) / 3 - cx;
    const fy = (a[1] + b[1] + c[1]) / 3 - cy;
    const fz = (a[2] + b[2] + c[2]) / 3 - cz;
    if (nx * fx + ny * fy + nz * fz < 0) {
      nx = -nx;
      ny = -ny;
      nz = -nz;
    }

    nl = Math.hypot(nx, ny, nz);
    faceNormals[i] = [nx / nl, ny / nl, nz / nl];
  }

  return faceNormals;
}

function getModelTriCornerNormals(model, triFaces) {
  const shadingMode = getModelShadingMode(model, triFaces);
  const crease = Number.isFinite(model._creaseAngleDeg) ? model._creaseAngleDeg : 62;
  const key = `${shadingMode}|${Math.round(crease * 100)}`;
  if (model._triCornerNormals && model._triCornerNormalsKey === key && model._triCornerNormals.length === triFaces.length) {
    return model._triCornerNormals;
  }

  const faceNormals = getModelFaceNormals(model, triFaces);
  const cornerNormals = new Array(triFaces.length);

  if (model.triangleNormals) {
    for (let i = 0; i < triFaces.length; i++) {
      cornerNormals[i] = model.triangleNormals[i];
    }
    return cornerNormals;
  }
  if (shadingMode === 'flat') {
    for (let i = 0; i < triFaces.length; i++) {
      const n = faceNormals[i];
      cornerNormals[i] = [[n[0], n[1], n[2]], [n[0], n[1], n[2]], [n[0], n[1], n[2]]];
    }
    return cornerNormals;
  }

  const V = model.V;
  const vertexToFaces = Array.from({ length: V.length }, () => []);
  for (let i = 0; i < triFaces.length; i++) {
    const tri = triFaces[i];
    vertexToFaces[tri[0]].push(i);
    vertexToFaces[tri[1]].push(i);
    vertexToFaces[tri[2]].push(i);
  }

  const cosThreshold = shadingMode === 'smooth' ? -1 : Math.cos((crease * Math.PI) / 180);

  for (let i = 0; i < triFaces.length; i++) {
    const tri = triFaces[i];
    const nRef = faceNormals[i];
    const triCorner = new Array(3);

    for (let c = 0; c < 3; c++) {
      const vi = tri[c];
      let nx = 0;
      let ny = 0;
      let nz = 0;

      const adjacent = vertexToFaces[vi];
      for (let j = 0; j < adjacent.length; j++) {
        const fi = adjacent[j];
        const n = faceNormals[fi];
        const dot = nRef[0] * n[0] + nRef[1] * n[1] + nRef[2] * n[2];
        if (dot >= cosThreshold) {
          nx += n[0];
          ny += n[1];
          nz += n[2];
        }
      }

      let nl = Math.hypot(nx, ny, nz);
      if (nl < 1e-9) {
        triCorner[c] = [nRef[0], nRef[1], nRef[2]];
      } else {
        triCorner[c] = [nx / nl, ny / nl, nz / nl];
      }
    }

    cornerNormals[i] = triCorner;
  }

  return cornerNormals;
}

function getModelVertexNormals(model, triFaces) {
  const V = model.V;
  let normals = Array.from({ length: V.length }, () => [0, 0, 0]);

  const cornerNormals = getModelTriCornerNormals(model, triFaces);
  const counts = new Uint16Array(V.length);

  for (let i = 0; i < triFaces.length; i++) {
    const tri = triFaces[i];
    const cn = cornerNormals[i];
    for (let c = 0; c < 3; c++) {
      const vi = tri[c];
      normals[vi][0] += cn[c][0];
      normals[vi][1] += cn[c][1];
      normals[vi][2] += cn[c][2];
      counts[vi]++;
    }
  }

  for (let i = 0; i < normals.length; i++) {
    let nx = normals[i][0];
    let ny = normals[i][1];
    let nz = normals[i][2];
    let nl = Math.hypot(nx, ny, nz);
    if (nl < 1e-9 || counts[i] === 0) {
      normals[i] = [0, 1, 0];
      continue;
    }
    normals[i] = [nx / nl, ny / nl, nz / nl];
  }

  return normals;
}
