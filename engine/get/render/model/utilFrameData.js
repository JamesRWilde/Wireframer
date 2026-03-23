/**
 * frameData.js - Per-Frame Vertex Transform and Projection Data
 *
 * PURPOSE:
 *   Computes (or retrieves cached) transformed and projected vertex data
 *   for the current frame. Handles rotation, perspective projection, and
 *   worker caching to avoid redundant computation.
 *
 * ARCHITECTURE ROLE:
 *   Central data provider for renderers that need 3D-transformed and
 *   2D-projected vertex positions. Called by setDrawSolidFillModel and
 *   other render modules each frame.
 *
 * DETAILS:
 *   1. Returns cached data if frame ID matches (avoids recomputation)
 *   2. Sends flat vertex data to the transform worker for async processing
 *   3. Falls back to synchronous transform if worker result isn't ready
 *   4. Caches result on the model object for this frame
 */

"use strict";

// Import render loop state for frame ID tracking
import { state }from '@engine/state/loop.js';

// Import worker command sender for async transforms
import { setSendToWorker }from '@engine/set/render/setSendToWorker.js';

// Import cached transform result getter
import { getCachedTransformResult }from '@engine/get/render/getCachedTransformResult.js';

// Import flat-to-nested converter for worker results
import { utilFlatNested }from '@engine/get/render/utilFlatNested.js';

// Import synchronous transform fallback
import { utilTransformSync }from '@engine/get/render/utilTransformSync.js';
import { getRotation } from '@engine/state/render/physicsState.js';
import { getZoom } from '@engine/state/render/zoomState.js';
import { getModelCy } from '@engine/get/render/getModelCy.js';
import { getW } from '@engine/get/render/getW.js';
import { getH } from '@engine/get/render/getH.js';

/**
 * frameData - Computes or retrieves per-frame vertex transform data
 *
 * @param {Object} model - Model object with V (vertices) array
 * @returns {{ T: Array<Array<number>>, P2: Array<Array<number>>, zHalf: number }|null}
 *   Frame data with 3D transformed positions, 2D projected positions,
 *   and Z half-extent, or null if computation fails
 */
export function utilFrameData(model) {
  // Guard against empty or invalid models
  if (!model?.V?.length) return null;

  // Return cached data if this frame was already computed
  if (model._frameData?.id === state.RENDER_FRAME_ID) return model._frameData;

  const V = model.V;
  const vertexCount = V.length;

  // Get the current physics rotation matrix
  const Rmat = getRotation();
  if (!Rmat) return null;

  // Compute Z half-extent for wire color interpolation (scales with rotation magnitude)
  const zHalf = Math.max(0.1,
    Math.min(100, 0.5 * Math.hypot(Rmat[0], Rmat[3], Rmat[6])));

  // Compute projection parameters from viewport and zoom
  const w = getW();
  const h = getH();
  const fov = Math.min(w, h) * 0.9 * getZoom();
  const halfW = w * 0.5;
  const halfH = h * 0.5;
  const modelCy = getModelCy();

  let T, P2;

  // Flatten vertex array for efficient worker transfer
  const flatV = new Float32Array(vertexCount * 3);
  for (let i = 0; i < vertexCount; i++) {
    flatV[i * 3] = V[i][0];
    flatV[i * 3 + 1] = V[i][1];
    flatV[i * 3 + 2] = V[i][2];
  }

  // Send transform request to worker (async)
  const flatR = new Float32Array(Rmat);
  setSendToWorker(flatV, flatR, fov, halfW, halfH, modelCy, state.RENDER_FRAME_ID);

  // Check for cached worker result from a previous frame
  const cached = getCachedTransformResult();
  if (cached?.T && cached?.P2) {
    // Convert flat worker result back to nested arrays
    const converted = utilFlatNested(cached.T, cached.P2, vertexCount);
    T = converted.T;
    P2 = converted.P2;
  } else {
    // Fallback: compute synchronously on the main thread
    const result = utilTransformSync(V, Rmat, fov, halfW, halfH, modelCy, vertexCount);
    T = result.T;
    P2 = result.P2;
  }

  // Cache the results on the model for this frame
  model._cacheT = T;
  model._cacheP2 = P2;

  // Store frame data with ID for cache validation
  const id = state.RENDER_FRAME_ID;
  model._frameData = { id, T, P2, zHalf };
  return model._frameData;
}
