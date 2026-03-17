/**
 * pendingWorkerParticles.js - Pending Worker Particles Getter
 *
 * PURPOSE:
 *   Returns the most recently received particle data from the background
 *   worker thread. The data is a Float32Array packed as [x, y, size, alpha]
 *   per particle.
 *
 * ARCHITECTURE ROLE:
 *   Called by the background renderer to retrieve worker-computed particle
 *   data for main-thread rendering on the background canvas.
 */

"use strict";

// Import background worker state to access pending particle data
import { workerState } from '@engine/state/render/background/worker.js';

/**
 * pendingWorkerParticles - Returns the latest worker particle data
 *
 * @returns {{ data: Float32Array, count: number }|null}
 *   Particle data and count, or null if no data is pending
 */
export function pendingWorkerParticles() { return workerState.pendingWorkerParticles; }
