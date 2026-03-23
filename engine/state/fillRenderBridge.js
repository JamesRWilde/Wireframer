/**
 * fillRenderBridge.js - CPU Fill Render Worker State
 *
 * PURPOSE:
 *   Holds the shared mutable state for the CPU fill render pipeline,
 *   including the Web Worker instance, OffscreenCanvas, cached rendered
 *   frames, and error tracking counters.
 *
 * ARCHITECTURE ROLE:
 *   Central state module for the fill render bridge. Read and written by
 *   fillWorker.js (init), sendRenderCommand.js (post), fillCachedFrame.js
 *   (read), and isFillWorkerAvailable.js (read). Shared across the
 *   engine/set and engine/init layers.
 *
 * DETAILS:
 *   Uses a mutable object (not frozen) so importing modules can assign
 *   properties directly without creating new objects.
 */

"use strict";

/**
 * fillRenderState - Mutable state for the CPU fill render worker
 * @property {Worker|null} worker - The fill render Web Worker instance
 * @property {OffscreenCanvas|null} offscreenCanvas - Transferred canvas for worker rendering
 * @property {boolean} workerReady - Whether the worker has sent a 'ready' message
 * @property {boolean} workerAvailable - Whether a worker was successfully created
 * @property {ImageBitmap|null} cachedImageBitmap - Most recently rendered frame
 * @property {number} cachedFrameId - Frame ID of the cached image bitmap
 * @property {number} errorCount - Number of errors encountered (for throttling logs)
 */
export const fillRenderState = {
  worker: null,
  offscreenCanvas: null,
  workerReady: false,
  workerAvailable: false,
  cachedImageBitmap: null,
  cachedFrameId: -1,
  errorCount: 0,
};

/** Maximum number of error logs to emit before suppressing further warnings */
export const MAX_ERROR_LOGS = 3;
