/**
 * setHandleWorkerReady.js - Background Worker Ready State Setter
 *
 * PURPOSE:
 *   Marks the background worker as ready and available when initialization completes.
 *
 * ARCHITECTURE ROLE:
 *   Called by worker initialization path when 'ready' is received from the worker.
 *   Signals the render pipeline that worker-based background rendering can start.
 *
 * WHY THIS EXISTS:
 *   Maintains a clear state transition boundary for worker readiness in shared state.
 */
import { backgroundWorkerState } from '@engine/state/render/background/stateWorker.js';

export function setHandleWorkerReady() {
  backgroundWorkerState.workerReady = true;
  backgroundWorkerState.workerAvailable = true;
}
