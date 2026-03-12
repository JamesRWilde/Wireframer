export function getModelFaceNormals(model, triFaces) {
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
