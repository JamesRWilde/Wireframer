/**
 * getIsFillWorkerAvailable.js - Fill Worker Availability Check
 *
 * PURPOSE:
 *   Checks whether the CPU fill render worker is both created and
 *   ready to accept render commands. Used to decide between the
 *   async worker path and synchronous fallback.
 *
 * ARCHITECTURE ROLE:
 *   Called by setDrawSolidFillModel to determine which render path to
 *   use (worker vs. main thread).
 */

"use strict";

// Import shared fill state to check worker status
import { fillRenderState } from "@engine/state/fillRenderBridge.js";

/**
 * getIsFillWorkerAvailable - Checks if the fill worker is ready for commands
 *
 * @returns {boolean} True if the worker exists and has sent a 'ready' message
 */
export function getIsFillWorkerAvailable() {
  return fillRenderState.workerAvailable && fillRenderState.workerReady;
}
