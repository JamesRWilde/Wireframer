/**
 * sendRenderCommand.js - Fill Worker Render Command Sender
 *
 * PURPOSE:
 *   Sends a render command message to the CPU fill render worker with
 *   the current frame's vertex data, face data, and theme settings.
 *
 * ARCHITECTURE ROLE:
 *   Called by drawSolidFillModel to dispatch render work to the worker
 *   thread. The worker processes the command and returns an ImageBitmap
 *   for compositing.
 *
 * DETAILS:
 *   Guards against sending commands when the worker is not ready.
 *   The message includes the frame ID for synchronization with the
 *   render loop.
 */

"use strict";

// Import shared fill state to check worker readiness
import { fillState } from "@engine/state/fillRenderBridge.js";

/**
 * sendRenderCommand - Posts a render command to the fill worker
 *
 * @param {Object} renderData - Render payload containing T, P2, triFaces, theme, etc.
 * @param {number} frameId - The current frame ID for synchronization
 * @returns {void}
 */
export function sendRenderCommand(renderData, frameId) {
  // Guard: only send if worker exists and is ready
  if (!fillState.worker || !fillState.workerReady) return;

  // Post the render command with frame data and frame ID
  fillState.worker.postMessage({
    type: 'render',
    ...renderData,
    frameId
  });
}
