import { getModelShadingMode } from './getModelShadingMode.js';
import { getModelFaceNormals } from './getModelFaceNormals.js';

export function getModelTriCornerNormals(model, triFaces) {
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
