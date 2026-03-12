import { getModelTriCornerNormals } from './getModelTriCornerNormals.js';

export function getModelVertexNormals(model, triFaces) {
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
