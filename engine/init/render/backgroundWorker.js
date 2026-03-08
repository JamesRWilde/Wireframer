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
 *   - Mutates workerState (worker, workerReady, workerInitialized, etc.)
 *   - Posts init message to worker with canvas dimensions and theme settings
 */

"use strict";

// Import background worker state to track worker lifecycle
import { workerState as state } from '@engine/state/render/background/worker.js';
import { isGpuMode } from '@engine/set/render/isGpuMode.js';
import { getThemeMode } from '@engine/get/render/getThemeMode.js';

// Import background canvas getter to read current dimensions
import {canvas}from '@engine/get/render/background/canvas.js';
import { bgState } from '@engine/state/render/background/backgroundState.js';

/**
 * backgroundWorker - Creates and initializes the background particle worker
 *
 * @returns {boolean} Whether the worker is ready or initialization succeeded
 */
export function backgroundWorker(mode = 'cpu') {
  // This worker is CPU background-specific. GPU background is handled in a separate WebGL pipeline.
  if (mode !== 'cpu') {
    throw new Error('backgroundWorker called with non-cpu mode');
  }

  if (isGpuMode()) {
    throw new Error('backgroundWorker called while GPU mode is active');
  }

  // Update desired running mode in worker state
  state.workerMode = mode;

  // Return current readiness if already initialized (idempotent)
  if (state.workerInitialized) {
    return state.workerReady;
  }
  state.workerInitialized = true;

  // Guard against environments without Worker support
  if (typeof Worker === 'undefined') return false;

  try {
    // Instantiate the background worker from its module URL
    state.worker = new Worker(
      new URL('../../../workers/workersBackground.js', import.meta.url).href,
      { type: 'module' }
    );

    // Handle messages from the background worker
    function handleWorkerReady() {
      state.workerReady = true;
      state.workerAvailable = true;
    }

    function handleWorkerParticles(data, count) {
      state.pendingWorkerParticles = { data, count };
    }

    function handleWorkerError(message) {
      console.error('[BackgroundWorker]', message);
      state.workerReady = false;
      state.workerAvailable = false;
    }

    state.worker.onmessage = (event) => {
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
    state.worker.onerror = (event) => {
      state.workerReady = false;
      state.workerAvailable = false;
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
      state.workerInitialized = false;
      if (state.worker) {
        state.worker.terminate();
        state.worker = null;
      }
    };

    // Get current canvas dimensions for worker initialization
    const canvasState = canvas();
    if (canvasState) {
      state.worker.postMessage({
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
    state.workerReady = false;
    state.workerAvailable = false;
    console.warn('[BackgroundWorker] Failed to initialize:', error);
    return false;
  }
}
