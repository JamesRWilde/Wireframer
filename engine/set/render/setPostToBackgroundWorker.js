/**
 * setPostToBackgroundWorker.js - Background Worker Message Sender
 *
 * PURPOSE:
 *   Sends a message to the background particle worker if it exists.
 *   A thin wrapper around Worker.postMessage with a null check guard.
 *
 * ARCHITECTURE ROLE:
 *   Called by the background renderer to send update commands to the
 *   worker thread. Centralizes the worker message posting to avoid
 *   duplicate null checks across the codebase.
 */

"use strict";

// Import background worker state to access the worker instance
import { backgroundWorkerState } from '@engine/state/render/background/stateWorker.js';

/**
 * setPostToBackgroundWorker - Sends a message to the background worker
 *
 * @param {Object} msg - The message object to post to the worker
 * @returns {void}
 */
export function setPostToBackgroundWorker(msg) { if (backgroundWorkerState.worker) backgroundWorkerState.worker.postMessage(msg); }
