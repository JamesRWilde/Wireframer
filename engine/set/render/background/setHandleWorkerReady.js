/**
 * Handles background worker ready signal.
 */
import { backgroundWorkerState } from '@engine/state/render/background/stateWorker.js';

export function setHandleWorkerReady() {
  backgroundWorkerState.workerReady = true;
  backgroundWorkerState.workerAvailable = true;
}
