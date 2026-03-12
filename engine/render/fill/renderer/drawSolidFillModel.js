import { getModelFrameData } from '../../camera/projection/getModelFrameData.js';
import { getModelTriangles } from '../getModelTriangles.js';
import { getModelShadingMode } from '../normals/getModelShadingMode.js';
import { getModelTriCornerNormals } from '../normals/getModelTriCornerNormals.js';
import { sortTriangles } from './sortTriangles.js';
import { renderTrianglesToLayer } from './renderTrianglesToLayer.js';
import { computeTriangleShadeColor } from '../lighting/computeTriangleShadeColor.js';
import { resolveTriangleNormal } from '../lighting/resolveTriangleNormal.js';
import { expandTriangleForSeam } from '../raster/expandTriangleForSeam.js';
import { fillTriangleOnLayer } from '../raster/fillTriangleOnLayer.js';

export function drawSolidFillModel(model, alphaScale = 1) {
  const fillLayerCtx = globalThis.fillLayerCtx;
  const fillLayerCanvas = globalThis.fillLayerCanvas;
  const W = globalThis.W;
  const H = globalThis.H;

  const opacity = globalThis.FILL_OPACITY * alphaScale;
  if (!model || !model.V?.length || opacity <= 0.001) return;
  if (!fillLayerCtx || !fillLayerCanvas) {
    console.warn('[drawSolidFillModel] missing fillLayerCtx/canvas');
    return;
  }

  const frameData = getModelFrameData(model);
  if (!frameData) return;
  const { T, P2 } = frameData;

  const triFaces = getModelTriangles(model);
  if (!triFaces || !triFaces.length) return;

  fillLayerCtx.setTransform(1, 0, 0, 1, 0, 0);
  fillLayerCtx.clearRect(0, 0, W, H);

  const shadingMode = getModelShadingMode(model, triFaces);
  const useSmoothShading = shadingMode === 'smooth';
  let triCornerNormals = null;
  const seamExpandPx = useSmoothShading ? (globalThis.DENSE_SEAM_EXPAND_PX ?? 0) : 0;
  if (useSmoothShading) {
    // compute face normals using the rotated (camera space) vertices in T
    const faceNormals = new Array(triFaces.length);
    for (let i = 0; i < triFaces.length; i++) {
      const [a, b, c] = triFaces[i];
      const v0 = T[a], v1 = T[b], v2 = T[c];
      const ux = v1[0] - v0[0], uy = v1[1] - v0[1], uz = v1[2] - v0[2];
      const vx = v2[0] - v0[0], vy = v2[1] - v0[1], vz = v2[2] - v0[2];
      let nx = uy * vz - uz * vy;
      let ny = uz * vx - ux * vz;
      let nz = ux * vy - uy * vx;
      const nl = Math.hypot(nx, ny, nz);
      if (nl < 1e-9) {
        faceNormals[i] = [0, 0, 1];
      } else {
        faceNormals[i] = [nx / nl, ny / nl, nz / nl];
      }
    }
    // adjacency: which faces meet each vertex
    const Vcount = T.length;
    const vertexToFaces = Array.from({ length: Vcount }, () => []);
    for (let i = 0; i < triFaces.length; i++) {
      const tri = triFaces[i];
      vertexToFaces[tri[0]].push(i);
      vertexToFaces[tri[1]].push(i);
      vertexToFaces[tri[2]].push(i);
    }
    // crease threshold
    const crease = Number.isFinite(model._creaseAngleDeg) ? model._creaseAngleDeg : 62;
    const cosThreshold = Math.cos((crease * Math.PI) / 180);
    triCornerNormals = new Array(triFaces.length);
    for (let i = 0; i < triFaces.length; i++) {
      const tri = triFaces[i];
      const nRef = faceNormals[i];
      const corner = [];
      for (let c = 0; c < 3; c++) {
        const vi = tri[c];
        let nx = 0, ny = 0, nz = 0;
        const adj = vertexToFaces[vi];
        for (let j = 0; j < adj.length; j++) {
          const fn = faceNormals[adj[j]];
          const dot = nRef[0]*fn[0] + nRef[1]*fn[1] + nRef[2]*fn[2];
          if (dot >= cosThreshold) {
            nx += fn[0]; ny += fn[1]; nz += fn[2];
          }
        }
        const nl = Math.hypot(nx, ny, nz);
        if (nl < 1e-9) corner.push(nRef);
        else corner.push([nx / nl, ny / nl, nz / nl]);
      }
      triCornerNormals[i] = corner;
    }
  }

  const triOrder = new Array(triFaces.length);
  for (let i = 0; i < triFaces.length; i++) {
    const tri = triFaces[i];
    triOrder[i] = { tri: tri, triIndex: i, z: (T[tri[0]][2] + T[tri[1]][2] + T[tri[2]][2]) / 3 };
  }
  triOrder.sort((a, b) => b.z - a.z);

  fillLayerCtx.globalCompositeOperation = 'source-over';
  for (const item of triOrder) {
    const [a, b, c] = item.tri;
    const ax = P2[a][0], ay = P2[a][1];
    const bx = P2[b][0], by = P2[b][1];
    const cx = P2[c][0], cy = P2[c][1];

    const area2 = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
    if (Math.abs(area2) < 0.2) continue;

    const normal = resolveTriangleNormal(item, T, triCornerNormals, useSmoothShading);
    if (!normal) continue;

    const shadeColor = computeTriangleShadeColor(normal, useSmoothShading);
    if (window.DEBUG_LOG_FILL && item.triIndex === 0) {
      console.debug('[drawSolidFillModel] sample shadeColor', shadeColor);
    }
    const tri2d = expandTriangleForSeam([[ax, ay], [bx, by], [cx, cy]], seamExpandPx);
    fillTriangleOnLayer(fillLayerCtx, tri2d, shadeColor);
  }

  const ctx = globalThis.ctx;
  if (ctx) {
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = opacity;
    ctx.drawImage(fillLayerCanvas, 0, 0);
    ctx.restore();
  }
}
