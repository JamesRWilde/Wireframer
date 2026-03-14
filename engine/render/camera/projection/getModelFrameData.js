/**
 * getModelFrameData.js - Vertex Transformation and Projection
 * 
 * PURPOSE:
 *   Transforms 3D model vertices from model space to view space using the
 *   current rotation matrix, then projects them to 2D screen coordinates.
 *   This is the most performance-critical function in the CPU rendering path.
 * 
 * ARCHITECTURE ROLE:
 *   Called by drawSolidFillModel and drawWireframeModel to get transformed
 *   vertex positions for rendering. Results are cached per frame to avoid
 *   redundant computation when multiple renderers need the same data.
 * 
 * OPTIMIZATION:
 *   Uses Web Worker for parallel transformation when available, with
 *   double-buffering to avoid blocking the main thread. Falls back to
 *   synchronous transformation if worker is unavailable.
 */

import { state } from '../../../core/loop/loopState.js';
import { sendToWorker, getCachedResult } from './vertexTransformBridge.js';

/**
 * convertFlatToNested - Converts flat Float32Array to nested array format
 * 
 * @param {Float32Array} flatT - Flat transformed positions [tx0,ty0,tz0, ...]
 * @param {Float32Array} flatP2 - Flat projected coords [px0,py0, px1,py1, ...]
 * @param {number} vertexCount - Number of vertices
 * 
 * @returns {{ T: Array, P2: Array }} Nested array format for compatibility
 */
function convertFlatToNested(flatT, flatP2, vertexCount) {
  const T = new Array(vertexCount);
  const P2 = new Array(vertexCount);

  for (let i = 0; i < vertexCount; i++) {
    const ti = i * 3;
    const pi = i * 2;
    T[i] = [flatT[ti], flatT[ti + 1], flatT[ti + 2]];
    P2[i] = [flatP2[pi], flatP2[pi + 1]];
  }

  return { T, P2 };
}

/**
 * transformSync - Synchronous vertex transformation (fallback)
 * 
 * @param {Array} V - Vertex array (nested or flat)
 * @param {Array} Rmat - Rotation matrix
 * @param {number} fov - Field of view scale
 * @param {number} halfW - Half canvas width
 * @param {number} halfH - Half canvas height
 * @param {number} modelCy - Model center Y offset
 * @param {number} vertexCount - Number of vertices
 * 
 * @returns {{ T: Array, P2: Array }} Transformed and projected arrays
 */
function transformSync(V, Rmat, fov, halfW, halfH, modelCy, vertexCount) {
  const r00 = Rmat[0], r01 = Rmat[1], r02 = Rmat[2];
  const r10 = Rmat[3], r11 = Rmat[4], r12 = Rmat[5];
  const r20 = Rmat[6], r21 = Rmat[7], r22 = Rmat[8];

  const T = new Array(vertexCount);
  const P2 = new Array(vertexCount);

  for (let i = 0; i < vertexCount; i++) {
    const vx = V[i][0], vy = V[i][1], vz = V[i][2];

    const tx = r00 * vx + r01 * vy + r02 * vz;
    const ty = r10 * vx + r11 * vy + r12 * vz;
    const tz = r20 * vx + r21 * vy + r22 * vz;

    T[i] = [tx, ty, tz];

    const d = tz + 3;
    P2[i] = [halfW + tx * fov / d, halfH - (ty - modelCy) * fov / d];
  }

  return { T, P2 };
}

/**
 * getModelFrameData - Gets transformed and projected vertex data for a model
 * 
 * @param {Object} model - Model with V (vertices), F (faces), E (edges)
 * 
 * @returns {Object|null} Frame data with T (transformed), P2 (projected), zHalf, id
 *   or null if model is invalid or physics state is missing
 */
export function getModelFrameData(model) {
  if (!model?.V?.length) return null;
  if (model._frameData?.id === state.RENDER_FRAME_ID) return model._frameData;

  const V = model.V;
  const vertexCount = V.length;

  const Rmat = globalThis.PHYSICS_STATE?.R;
  if (!Rmat) return null;

  // Clamp ZOOM and Z_HALF to avoid degenerate projections
  const zHalf = Math.max(0.1,
    Math.min(100, 0.5 * Math.hypot(Rmat[0], Rmat[3], Rmat[6])));

  // Compute constants once per frame for projection
  const w = globalThis.innerWidth;
  const h = globalThis.innerHeight;
  const fov = Math.min(w, h) * 0.9 * globalThis.ZOOM;
  const halfW = w * 0.5;
  const halfH = h * 0.5;
  const modelCy = globalThis.MODEL_CY;

  let T, P2;

  // Convert nested vertex array to flat Float32Array for worker
  const flatV = new Float32Array(vertexCount * 3);
  for (let i = 0; i < vertexCount; i++) {
    const vi = i * 3;
    flatV[vi] = V[i][0];
    flatV[vi + 1] = V[i][1];
    flatV[vi + 2] = V[i][2];
  }

  // Convert rotation matrix to flat Float32Array
  const flatR = new Float32Array(Rmat);

  // Always try to send to worker (this initializes it on first call)
  sendToWorker(flatV, flatR, fov, halfW, halfH, modelCy, state.RENDER_FRAME_ID);

  // Try to get cached result from previous frame
  const cached = getCachedResult();
  if (cached?.T && cached?.P2) {
    // Convert flat arrays back to nested format for compatibility
    const converted = convertFlatToNested(cached.T, cached.P2, vertexCount);
    T = converted.T;
    P2 = converted.P2;
  } else {
    // No cached result yet (first frame or worker just started)
    // Fall back to synchronous transformation
    const result = transformSync(V, Rmat, fov, halfW, halfH, modelCy, vertexCount);
    T = result.T;
    P2 = result.P2;
  }

  // Cache results for this frame
  model._cacheT = T;
  model._cacheP2 = P2;

  const id = state.RENDER_FRAME_ID;
  model._frameData = { id, T, P2, zHalf };

  return model._frameData;
}