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

"use strict";

// Import fill worker initialization for lazy worker creation
import { fillWorker } from '@engine/init/cpu/fillWorker.js';

// Import frame data getter for vertex transforms
import { frameData }from '@engine/get/render/model/frameData.js';

// Import triangle face getter for mesh geometry
import { triangles as modelTriangles }from '@engine/get/render/model/triangles.js';

// Import shading mode detection for flat vs smooth shading
import { shadingMode as getShadingMode }from '@engine/get/cpu/model/shadingMode.js';

// Import per-corner normal computation for smooth shading
import { triCornerNormals as getTriCornerNormals }from '@engine/get/render/model/triCornerNormals.js';

// Import CPU triangle rasterizer for main-thread fallback
import { trianglesCpu }from '@engine/set/render/fill/trianglesCpu.js';

// Import worker command sender for async fill rendering
import { sendRenderCommand }from '@engine/set/cpu/fill/sendRenderCommand.js';

// Import cached frame getter for worker-rendered results
import { fillCachedFrame }from '@engine/get/cpu/fillCachedFrame.js';

// Import worker availability check for render path selection
import { isFillWorkerAvailable }from '@engine/get/cpu/isFillWorkerAvailable.js';

// Import render loop state for frame ID tracking
import { state }from '@engine/state/engine/loop.js';
import { getFillOpacity, getTheme }from '@engine/state/render/renderState.js';
import { getRotation }from '@engine/state/render/physicsState.js';

// Track if worker has been initialized to avoid redundant setup
let workerInitialized = false;

/**
 * drawSolidFillModel - Draws solid shaded triangles for the model
 *
 * @param {Object} model - Model with V, F, E data
 * @param {number} [alphaScale=1] - Opacity multiplier for fill rendering
 * @returns {void}
 */
export function drawSolidFillModel(model, alphaScale = 1) {
  const fillLayerCtx = globalThis.fillLayerCtx;
  const fillLayerCanvas = globalThis.fillLayerCanvas;
  const W = globalThis.W;
  const H = globalThis.H;

  // Compute effective opacity from slider and alpha scale
  const opacity = getFillOpacity() * alphaScale;

  // Guard: skip if model has no vertices or opacity is negligible
  if (!model?.V?.length || opacity <= 0.001) return;

  // Guard: ensure fill layer canvas and context are available
  if (!fillLayerCtx || !fillLayerCanvas) {
    console.warn('[drawSolidFillModel] missing fillLayerCtx/canvas');
    return;
  }

  // Get transformed vertex data (2D projections + 3D positions)
  const fd = frameData(model);
  if (!fd) return;
  const { T, P2 } = fd;

  // Get triangle faces for the model
  const triFaces = modelTriangles(model);
  if (!triFaces?.length) return;

  // Determine shading mode and compute corner normals if needed
  const shadingMode = getShadingMode(model, triFaces);
  const useSmoothShading = shadingMode === 'smooth';
  const seamExpandPx = useSmoothShading ? (globalThis.DENSE_SEAM_EXPAND_PX ?? 0) : 0;

  const triCornerNormalsResult = useSmoothShading
    ? getTriCornerNormals(model, triFaces)
    : null;

  // Compute fill alpha (1.0 for opaque, <1 for transparent fills)
  const fillSlider = getFillOpacity() * alphaScale;
  const fillAlpha = fillSlider >= 0.999 ? 1 : fillSlider;

  // Lazy-initialize the fill render worker
  if (!workerInitialized) {
    workerInitialized = fillWorker(W, H);
  }

  // Try to use worker for parallel rendering
  if (isFillWorkerAvailable()) {
    // Send current frame data to worker for async rendering
    const R = getRotation();
    const workerTheme = getTheme() ?? { shadeDark: [0,0,0], shadeBright: [255,255,255] };

    sendRenderCommand({
      T,
      P2,
      triFaces,
      triCornerNormalsResult,
      useSmoothShading,
      theme: workerTheme,
      fillAlpha,
      seamExpandPx,
      R
    }, state.RENDER_FRAME_ID);

    // Draw cached frame from previous render (pipeline latency hiding)
    const cached = fillCachedFrame();
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

  // Sort triangles back-to-front (painter's algorithm) by average Z depth
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

  // Debug logging for fill opacity values
  if (globalThis.DEBUG_LOG_FILL) {
    console.debug(
      '[drawSolidFillModel] FILL_OPACITY slider:',
      getFillOpacity(),
      'alphaScale:',
      alphaScale,
      'fillSlider:',
      fillSlider,
      'fillAlpha:',
      fillAlpha,
    );
  }

  // Rasterize triangles on the CPU
  trianglesCpu({
    triOrder,
    P2,
    T,
    triCornerNormalsResult,
    useSmoothShading,
    seamExpandPx,
    fillLayerCtx,
    fillAlpha,
  });
}
