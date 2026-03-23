/**
 * backgroundWorker.js - Background Particle Worker Initialization
 *
 * PURPOSE:
 *   Creates and initializes a Web Worker for background particle animation.
 *   The worker handles particle position updates and returns particle data
 *   for rendering on the main thread's background canvas.
 *
 * ARCHITECTURE ROLE:
 *   Called by the background render pipeline when the worker hasn't been
 *   initialized yet. Delegates particle computation to a dedicated worker
 *   thread, improving main-thread frame budget.
 *
 * SIDE EFFECTS:
 *   - Mutates backgroundWorkerState (worker, workerReady, workerInitialized, etc.)
 *   - Posts init message to worker with canvas dimensions and theme settings
 */

"use strict";

// Import background worker state to track worker lifecycle
import { backgroundWorkerState } from '@engine/state/render/background/worker.js';
import { isGpuMode } from '@engine/set/render/isGpuMode.js';
import { getThemeMode } from '@engine/get/render/getThemeMode.js';
import { handleWorkerReady } from '@engine/set/render/background/handleWorkerReady.js';
import { handleWorkerParticles } from '@engine/set/render/background/handleWorkerParticles.js';
import { handleWorkerError } from '@engine/set/render/background/handleWorkerError.js';

// Import background canvas getter to read current dimensions
import {getBgCanvas}from '@engine/get/render/background/getBgCanvas.js';
import { bgState } from '@engine/state/render/background/backgroundState.js';

/**
 * backgroundWorker - Creates and initializes the background particle worker
 *
 * @returns {boolean} Whether the worker is ready or initialization succeeded
 */
export function initBackgroundWorker(mode = 'cpu') {
  // This worker is CPU background-specific. GPU background is handled in a separate WebGL pipeline.
  if (mode !== 'cpu') {
    throw new Error('backgroundWorker called with non-cpu mode');
  }

  if (isGpuMode()) {
    throw new Error('backgroundWorker called while GPU mode is active');
  }

  // Update desired running mode in worker state
  backgroundWorkerState.workerMode = mode;

  // Return current readiness if already initialized (idempotent)
  if (backgroundWorkerState.workerInitialized) {
    return backgroundWorkerState.workerReady;
  }
  backgroundWorkerState.workerInitialized = true;

  // Guard against environments without Worker support
  if (typeof Worker === 'undefined') return false;

  try {
    // Instantiate the background worker from its module URL
    backgroundWorkerState.worker = new Worker(
      new URL('../../../workers/workersBackground.js', import.meta.url).href,
      { type: 'module' }
    );

    // Handle messages from the background worker
    backgroundWorkerState.worker.onmessage = (event) => {
      const { type, data, count, message } = event.data;
      if (type === 'ready') {
        handleWorkerReady();
        return;
      }

      if (type === 'particles') {
        handleWorkerParticles(data, count);
        return;
      }

      if (type === 'error') {
        handleWorkerError(message || event.data.message);
      }
    };

    // Handle fatal worker errors (e.g., script crash)
    backgroundWorkerState.worker.onerror = (event) => {
      backgroundWorkerState.workerReady = false;
      backgroundWorkerState.workerAvailable = false;
      console.error('[BackgroundWorker] worker error occurred', event);
      console.error('[BackgroundWorker] worker event info', {
        message: event?.message,
        filename: event?.filename,
        lineno: event?.lineno,
        colno: event?.colno,
        error: event?.error,
        type: event?.type,
      });

      // Retry with a new worker on next frame
      backgroundWorkerState.workerInitialized = false;
      if (backgroundWorkerState.worker) {
        backgroundWorkerState.worker.terminate();
        backgroundWorkerState.worker = null;
      }
    };

    // Get current canvas dimensions for worker initialization
    const canvasState = getBgCanvas();
    if (canvasState) {
      backgroundWorkerState.worker.postMessage({
        type: 'init',
        width: canvasState.w,
        height: canvasState.h,
        density: bgState.densityPct,
        speed: bgState.velocityPct,
        themeMode: getThemeMode(),
        mode,
      });
    }

    return true;
  } catch (error) {
    backgroundWorkerState.workerReady = false;
    backgroundWorkerState.workerAvailable = false;
    console.warn('[BackgroundWorker] Failed to initialize:', error);
    return false;
  }
}
