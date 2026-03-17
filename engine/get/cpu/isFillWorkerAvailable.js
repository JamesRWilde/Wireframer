/**
 * isFillWorkerAvailable.js - Fill Worker Availability Check
 *
 * PURPOSE:
 *   Checks whether the CPU fill render worker is both created and
 *   ready to accept render commands. Used to decide between the
 *   async worker path and synchronous fallback.
 *
 * ARCHITECTURE ROLE:
 *   Called by drawSolidFillModel to determine which render path to
 *   use (worker vs. main thread).
 */

"use strict";

// Import shared fill state to check worker status
import { fillState } from "@engine/state/cpu/fillRenderBridge.js";

/**
 * isFillWorkerAvailable - Checks if the fill worker is ready for commands
 *
 * @returns {boolean} True if the worker exists and has sent a 'ready' message
 */
export function isFillWorkerAvailable() {
  return fillState.workerAvailable && fillState.workerReady;
}
