import { getModelFrameData } from '../../camera/projection/getModelFrameData.js';
import { getModelTriangles } from '../getModelTriangles.js';
import { getModelShadingMode } from '../normals/getModelShadingMode.js';
import { getModelTriCornerNormals } from '../normals/getModelTriCornerNormals.js';
import { renderFillTriangles } from './renderFillTriangles.js';

export function drawSolidFillModel(model, alphaScale = 1) {
  const fillLayerCtx = globalThis.fillLayerCtx;
  const fillLayerCanvas = globalThis.fillLayerCanvas;
  const W = globalThis.W;
  const H = globalThis.H;

  const opacity = globalThis.FILL_OPACITY * alphaScale;
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

  const triCornerNormals = useSmoothShading
    ? getModelTriCornerNormals(model, triFaces)
    : null;

  const triOrder = new Array(triFaces.length);
  for (let i = 0; i < triFaces.length; i++) {
    const tri = triFaces[i];
    triOrder[i] = {
      tri,
      triIndex: i,
      z: (T[tri[0]][2] + T[tri[1]][2] + T[tri[2]][2]) / 3,
    };
  }
  triOrder.sort((a, b) => b.z - a.z);

  fillLayerCtx.globalCompositeOperation = 'source-over';
  const fillSlider = globalThis.FILL_OPACITY * alphaScale;
  const fillAlpha = fillSlider >= 0.999 ? 1 : fillSlider;
  if (globalThis.DEBUG_LOG_FILL) {
    console.debug(
      '[drawSolidFillModel] FILL_OPACITY slider:',
      globalThis.FILL_OPACITY,
      'alphaScale:',
      alphaScale,
      'fillSlider:',
      fillSlider,
      'fillAlpha:',
      fillAlpha,
    );
  }

  renderFillTriangles({
    triOrder,
    P2,
    T,
    triCornerNormals,
    useSmoothShading,
    seamExpandPx,
    fillLayerCtx,
    fillAlpha,
  });
}
