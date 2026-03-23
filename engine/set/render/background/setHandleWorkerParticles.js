/**
 * Handles received particle data from background worker.
 */
import { backgroundWorkerState } from '@engine/state/render/background/stateWorker.js';

export function setHandleWorkerParticles(data, count) {
  backgroundWorkerState.pendingWorkerParticles = { data, count };
}
