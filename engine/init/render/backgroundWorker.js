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

// Import background canvas getter to read current dimensions
import {canvas}from '@engine/get/render/background/canvas.js';

/**
 * backgroundWorker - Creates and initializes the background particle worker
 *
 * @returns {boolean} Whether the worker is ready or initialization succeeded
 */
export function backgroundWorker() {
  // Return current readiness if already initialized (idempotent)
  if (state.workerInitialized) return state.workerReady;
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
    state.worker.onmessage = (event) => {
      const { type, data, count } = event.data;
      if (type === 'ready') {
        // Worker has completed initialization
        state.workerReady = true;
      } else if (type === 'particles') {
        // New particle data received; store for main-thread rendering
        state.pendingWorkerParticles = { data, count };
      } else if (type === 'error') {
        console.error('[BackgroundWorker]', event.data.message);
        state.workerReady = false;
      }
    };

    // Handle fatal worker errors (e.g., script crash)
    state.worker.onerror = () => {
      state.workerReady = false;
    };

    // Get current canvas dimensions for worker initialization
    const canvasState = canvas();
    if (canvasState) {
      // Send init message with dimensions, density, speed, and theme
      state.worker.postMessage({
        type: 'init',
        width: canvasState.w,
        height: canvasState.h,
        density: globalThis.BG_PARTICLE_DENSITY_PCT ?? 1,
        speed: globalThis.BG_PARTICLE_VELOCITY_PCT ?? 1,
        themeMode: globalThis.THEME_MODE ?? 'dark'
      });
    }

    return true;
  } catch (error) {
    console.warn('[BackgroundWorker] Failed to initialize:', error);
    return false;
  }
}
