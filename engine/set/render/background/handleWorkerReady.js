/**
 * Handles background worker ready signal.
 */
import { backgroundWorkerState } from '@engine/state/render/background/worker.js';

export function handleWorkerReady() {
  backgroundWorkerState.workerReady = true;
  backgroundWorkerState.workerAvailable = true;
}
