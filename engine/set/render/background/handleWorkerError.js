/**
 * Handles background worker errors — logs details and resets state for retry.
 */
import { workerState as state } from '@engine/state/render/background/worker.js';

export function handleWorkerError(message) {
  console.error('[BackgroundWorker]', message);
  state.workerReady = false;
  state.workerAvailable = false;
}
