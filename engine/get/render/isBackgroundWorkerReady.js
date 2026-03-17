/**
 * isBackgroundWorkerReady.js - Background Worker Readiness Check
 *
 * PURPOSE:
 *   Checks whether the background particle worker has been initialized
 *   and has sent its 'ready' message, indicating it can accept update
 *   commands.
 *
 * ARCHITECTURE ROLE:
 *   Called by the background renderer to decide between the worker path
 *   and main-thread fallback for particle updates.
 */

"use strict";

// Import background worker state to check readiness
import { workerState } from '@engine/state/render/background/worker.js';

/**
 * isBackgroundWorkerReady - Checks if the background worker is ready
 *
 * @returns {boolean} True if the worker has sent a 'ready' message
 */
export function isBackgroundWorkerReady() { return workerState.workerReady; }
