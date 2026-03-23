/**
 * Handles background worker ready signal.
 */
import { workerState as state } from '@engine/state/render/background/worker.js';

export function handleWorkerReady() {
  state.workerReady = true;
  state.workerAvailable = true;
}
