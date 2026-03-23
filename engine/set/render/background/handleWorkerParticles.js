/**
 * Handles received particle data from background worker.
 */
import { workerState as state } from '@engine/state/render/background/worker.js';

export function handleWorkerParticles(data, count) {
  state.pendingWorkerParticles = { data, count };
}
