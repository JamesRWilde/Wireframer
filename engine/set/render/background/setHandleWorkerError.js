/**
 * setHandleWorkerError.js - Background Worker Error Handler
 *
 * PURPOSE:
 *   Handles errors from the background worker by logging and resetting state.
 *
 * ARCHITECTURE ROLE:
 *   Called by background worker message/error handlers when a worker fault occurs.
 *   Resets readiness flags so worker can be reinitialized or fallback paths can run.
 *
 * WHY THIS EXISTS:
 *   Centralizes worker error handling to ensure all fail states are handled
 *   consistently and avoid stale ready flags.
 */
import { backgroundWorkerState } from '@engine/state/render/background/stateWorker.js';

export function setHandleWorkerError(message) {
  console.error('[BackgroundWorker]', message);
  backgroundWorkerState.workerReady = false;
  backgroundWorkerState.workerAvailable = false;
}
