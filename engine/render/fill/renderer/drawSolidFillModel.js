import { getModelFrameData } from '../../camera/projection/getModelFrameData.js';
import { getModelTriangles } from '../getModelTriangles.js';
import { getModelShadingMode } from '../normals/getModelShadingMode.js';
import { getModelTriCornerNormals } from '../normals/getModelTriCornerNormals.js';
// ...existing code...
import { computeTriangleShadeColor } from '../lighting/computeTriangleShadeColor.js';
import { resolveTriangleNormal } from '../lighting/resolveTriangleNormal.js';
import { expandTriangleForSeam } from '../raster/expandTriangleForSeam.js';
import { fillTriangleOnLayer } from '../raster/fillTriangleOnLayer.js';

export function drawSolidFillModel(model, alphaScale = 1) {
  const fillLayerCtx = globalThis.fillLayerCtx;
  const fillLayerCanvas = globalThis.fillLayerCanvas;
  const W = globalThis.W;
  const H = globalThis.H;

  let opacity = globalThis.FILL_OPACITY * alphaScale;
  if (!model?.V?.length || opacity <= 0.001) return;
  if (!fillLayerCtx || !fillLayerCanvas) {
    console.warn('[drawSolidFillModel] missing fillLayerCtx/canvas');
    return;
  }

  const frameData = getModelFrameData(model);
  if (!frameData) return;
  const { T, P2 } = frameData;

  const triFaces = getModelTriangles(model);
  if (!triFaces?.length) return;

  fillLayerCtx.setTransform(1, 0, 0, 1, 0, 0);
  fillLayerCtx.clearRect(0, 0, W, H);

  const shadingMode = getModelShadingMode(model, triFaces);
  const useSmoothShading = shadingMode === 'smooth';
  const seamExpandPx = useSmoothShading ? (globalThis.DENSE_SEAM_EXPAND_PX ?? 0) : 0;
  // use the shared helper for corner normals (model-space); this mirrors the
  // reference implementation exactly and avoids subtle camera-space bugs.
  const triCornerNormals = useSmoothShading
    ? getModelTriCornerNormals(model, triFaces)
    : null;

  const triOrder = new Array(triFaces.length);
  for (let i = 0; i < triFaces.length; i++) {
    const tri = triFaces[i];
    triOrder[i] = { tri: tri, triIndex: i, z: (T[tri[0]][2] + T[tri[1]][2] + T[tri[2]][2]) / 3 };
  }
  triOrder.sort((a, b) => b.z - a.z);

  fillLayerCtx.globalCompositeOperation = 'source-over';
  const fillSlider = globalThis.FILL_OPACITY * alphaScale;
  // If fill opacity is 100%, force triangles to be drawn fully opaque
  const fillAlpha = (fillSlider >= 0.999) ? 1 : fillSlider;
  if (globalThis.DEBUG_LOG_FILL) {
    console.debug('[drawSolidFillModel] FILL_OPACITY slider:', globalThis.FILL_OPACITY, 'alphaScale:', alphaScale, 'fillSlider:', fillSlider, 'fillAlpha:', fillAlpha);
  }
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
    if (globalThis.DEBUG_LOG_FILL && item.triIndex === 0) {
      console.debug('[drawSolidFillModel] sample shadeColor', shadeColor, 'fillAlpha used for triangle:', fillAlpha);
    }
    const tri2d = expandTriangleForSeam([[ax, ay], [bx, by], [cx, cy]], seamExpandPx);
    // Guarantee alpha=1 for triangles if fillAlpha is 1
    fillTriangleOnLayer(fillLayerCtx, tri2d, shadeColor, fillAlpha);
  }

  // No need to set globalAlpha here; triangles are drawn with correct alpha
  // The compositing step will use globalAlpha = 1
}
