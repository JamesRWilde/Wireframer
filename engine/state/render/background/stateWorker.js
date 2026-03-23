/**
 * worker.js - Background Particle Worker State
 *
 * PURPOSE:
 *   Holds the shared mutable state for the background particle Web Worker,
 *   including the worker instance, readiness flags, and pending particle
 *   data received from the worker thread.
 *
 * ARCHITECTURE ROLE:
 *   Central state module for the background particle pipeline. Read and
 *   written by backgroundWorker.js (init), setPostToBackgroundWorker.js (post),
 *   pendingWorkerParticles.js (read), and isBackgroundWorkerReady.js (read).
 *
 * DETAILS:
 *   Uses a mutable object so importing modules can assign properties
 *   directly without creating new objects.
 */

"use strict";

/**
 * backgroundWorkerState - Mutable state for the background particle worker
 * @property {Worker|null} worker - The background particle Web Worker instance
 * @property {boolean} workerReady - Whether the worker has sent a 'ready' message
 * @property {boolean} workerInitialized - Whether initialization has been attempted
 * @property {Object|null} pendingWorkerParticles - Latest particle data { data: Float32Array, count: number }
 * @property {boolean} workerAvailable - Whether a worker was successfully created
 */
export const backgroundWorkerState = {
  worker: null,
  workerReady: false,
  workerInitialized: false,
  pendingWorkerParticles: null,
  workerAvailable: false,
  workerMode: 'cpu',
};
