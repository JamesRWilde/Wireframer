/**
 * drawSolidFillModel.js - Solid Fill Model Renderer
 * 
 * PURPOSE:
 *   Draws shaded triangles for the 3D model to an offscreen fill layer canvas.
 *   Uses back-to-front sorting (painter's algorithm) and Blinn-Phong lighting.
 * 
 * ARCHITECTURE ROLE:
 *   Called by renderCpuPath to render the solid fill portion of the model.
 *   Results are composited onto the main canvas with opacity blending.
 * 
 * OPTIMIZATION:
 *   Uses Web Worker with OffscreenCanvas when available for parallel rendering.
 *   Falls back to main-thread rendering if worker is unavailable.
 */

import { getModelFrameData } from './getModelFrameData.js';
import { getModelTriangles } from './getModelTriangles.js';
import { getModelShadingMode } from './getModelShadingMode.js';
import { getModelTriCornerNormals } from './getModelTriCornerNormals.js';
import { renderFillTriangles } from './renderFillTriangles.js';
import { initFillWorker, sendRenderCommand, getCachedFrame, isFillWorkerAvailable } from './fillRenderBridge.js';
import { state } from '../loop/loopState.js';

// Track if worker has been initialized
let workerInitialized = false;

/**
 * drawSolidFillModel - Draws solid shaded triangles for the model
 * 
 * @param {Object} model - Model with V, F, E data
 * @param {number} [alphaScale=1] - Opacity multiplier
 */
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

  const shadingMode = getModelShadingMode(model, triFaces);
  const useSmoothShading = shadingMode === 'smooth';
  const seamExpandPx = useSmoothShading ? (globalThis.DENSE_SEAM_EXPAND_PX ?? 0) : 0;

  const triCornerNormals = useSmoothShading
    ? getModelTriCornerNormals(model, triFaces)
    : null;

  const fillSlider = globalThis.FILL_OPACITY * alphaScale;
  const fillAlpha = fillSlider >= 0.999 ? 1 : fillSlider;

  // Try to use worker for parallel rendering
  if (!workerInitialized) {
    workerInitialized = initFillWorker(W, H);
  }

  if (isFillWorkerAvailable()) {
    // Send current frame data to worker
    const R = globalThis.PHYSICS_STATE?.R;
    const theme = globalThis.THEME ?? { shadeDark: '#000000', shadeBright: '#ffffff' };

    sendRenderCommand({
      T,
      P2,
      triFaces,
      triCornerNormals,
      useSmoothShading,
      theme,
      fillAlpha,
      seamExpandPx,
      R
    }, state.RENDER_FRAME_ID);

    // Draw cached frame from previous render
    const cached = getCachedFrame();
    if (cached?.imageBitmap) {
      fillLayerCtx.setTransform(1, 0, 0, 1, 0, 0);
      fillLayerCtx.clearRect(0, 0, W, H);
      fillLayerCtx.globalCompositeOperation = 'source-over';
      fillLayerCtx.drawImage(cached.imageBitmap, 0, 0);
      return;
    }
    // No cached frame yet, fall through to sync rendering
  }

  // Synchronous fallback rendering (main thread)
  fillLayerCtx.setTransform(1, 0, 0, 1, 0, 0);
  fillLayerCtx.clearRect(0, 0, W, H);

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
