/**
 * fillRenderBridge.js - Bridge to Fill Render Worker
 * 
 * PURPOSE:
 *   Manages the fill render Web Worker and OffscreenCanvas lifecycle.
 *   Implements one-frame latency pattern for non-blocking fill rendering.
 * 
 * ARCHITECTURE ROLE:
 *   Sits between drawSolidFillModel.js and fill-render-worker.js.
 *   Provides an API to send rendering commands to the worker and retrieve
 *   the rendered ImageBitmap for compositing on the main thread.
 * 
 * ONE-FRAME LATENCY:
 *   Frame N:   Send render command → Receive Frame N-1 ImageBitmap
 *   Frame N+1: Send render command → Receive Frame N ImageBitmap
 *   This keeps the main thread free but introduces ~16ms visual latency.
 * 
 * FALLBACK:
 *   If OffscreenCanvas or Worker is not supported, returns null so
 *   drawSolidFillModel can fall back to main-thread rendering.
 */

"use strict";

// Worker instance
let worker = null;

// OffscreenCanvas for worker rendering
let offscreenCanvas = null;

// Worker state
let workerReady = false;
let workerAvailable = false;

// Cached rendered frame
let cachedImageBitmap = null;
let cachedFrameId = -1;

// Error tracking
let errorCount = 0;
const MAX_ERROR_LOGS = 3;

/**
 * initFillWorker - Initializes the fill render worker and OffscreenCanvas
 * 
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * 
 * @returns {boolean} True if initialization succeeded
 */
export function initFillWorker(width, height) {
  if (worker) return true;

  // Check for OffscreenCanvas support
  if (typeof OffscreenCanvas === 'undefined') {
    console.warn('[fillRenderBridge] OffscreenCanvas not supported');
    workerAvailable = false;
    return false;
  }

  try {
    // Create OffscreenCanvas
    offscreenCanvas = new OffscreenCanvas(width, height);

    // Create worker
    worker = new Worker(
      new URL('../../../../workers/fill-render-worker.js', import.meta.url).href,
      { type: 'module' }
    );
    workerAvailable = true;

    worker.onmessage = (event) => {
      const { type, imageBitmap, frameId, message } = event.data;

      if (type === 'ready') {
        workerReady = true;
      } else if (type === 'rendered') {
        // Store the rendered frame
        // Close previous bitmap to free memory
        if (cachedImageBitmap) {
          cachedImageBitmap.close();
        }
        cachedImageBitmap = imageBitmap;
        cachedFrameId = frameId;
      } else if (type === 'error') {
        if (errorCount < MAX_ERROR_LOGS) {
          console.warn('[fillRenderBridge] Worker error:', message);
          errorCount++;
        }
      }
    };

    worker.onerror = (error) => {
      if (errorCount < MAX_ERROR_LOGS) {
        console.warn('[fillRenderBridge] Worker error:', error.message);
        errorCount++;
      }
    };

    // Send init message with canvas transfer
    worker.postMessage(
      { type: 'init', canvas: offscreenCanvas, width, height },
      [offscreenCanvas]
    );

    return true;
  } catch (error) {
    console.warn('[fillRenderBridge] Initialization failed:', error.message);
    workerAvailable = false;
    return false;
  }
}

/**
 * sendRenderCommand - Sends a render command to the worker
 * 
 * @param {Object} renderData - Data needed for rendering
 * @param {Array} renderData.T - Transformed vertex positions
 * @param {Array} renderData.P2 - Projected 2D coordinates
 * @param {Array} renderData.triFaces - Triangle face indices
 * @param {Array} renderData.triCornerNormals - Per-corner normals
 * @param {boolean} renderData.useSmoothShading - Smooth shading flag
 * @param {Object} renderData.theme - Theme colors
 * @param {number} renderData.fillAlpha - Fill opacity
 * @param {number} renderData.seamExpandPx - Seam expansion
 * @param {Array} renderData.R - Rotation matrix
 * @param {number} frameId - Current frame ID
 */
export function sendRenderCommand(renderData, frameId) {
  if (!worker || !workerReady) return;

  worker.postMessage({
    type: 'render',
    ...renderData,
    frameId
  });
}

/**
 * getCachedFrame - Gets the last rendered frame
 * 
 * @returns {{ imageBitmap: ImageBitmap, frameId: number } | null}
 */
export function getCachedFrame() {
  return cachedImageBitmap ? { imageBitmap: cachedImageBitmap, frameId: cachedFrameId } : null;
}

/**
 * resizeCanvas - Resizes the OffscreenCanvas
 * 
 * @param {number} width - New width
 * @param {number} height - New height
 */
export function resizeCanvas(width, height) {
  if (!worker || !workerReady) return;

  worker.postMessage({ type: 'resize', width, height });
}

/**
 * isFillWorkerAvailable - Checks if the fill worker is available
 * 
 * @returns {boolean}
 */
export function isFillWorkerAvailable() {
  return workerAvailable && workerReady;
}

/**
 * terminateFillWorker - Terminates the worker
 */
export function terminateFillWorker() {
  if (worker) {
    worker.terminate();
    worker = null;
    workerReady = false;
    workerAvailable = false;
  }
  if (cachedImageBitmap) {
    cachedImageBitmap.close();
    cachedImageBitmap = null;
  }
  offscreenCanvas = null;
}
