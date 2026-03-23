/**
 * Handles background worker errors — logs details and resets state for retry.
 */
import { backgroundWorkerState } from '@engine/state/render/background/worker.js';

export function setHandleWorkerError(message) {
  console.error('[BackgroundWorker]', message);
  backgroundWorkerState.workerReady = false;
  backgroundWorkerState.workerAvailable = false;
}
