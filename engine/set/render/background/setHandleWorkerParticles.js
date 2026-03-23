/**
 * setHandleWorkerParticles.js - Background Worker Particle Data Handler
 *
 * PURPOSE:
 *   Stores particle data received from the background worker into shared state.
 *
 * ARCHITECTURE ROLE:
 *   Called by the worker message receiver when new particle batch data arrives.
 *   Enables the main background rendering loop to consume this data on the next frame.
 *
 * WHY THIS EXISTS:
 *   Decouples asynchronous worker data delivery from frame rendering state, so
 *   updates are safely buffered and applied in render order.
 */
import { backgroundWorkerState } from '@engine/state/render/background/stateWorker.js';

export function setHandleWorkerParticles(data, count) {
  backgroundWorkerState.pendingWorkerParticles = { data, count };
}
