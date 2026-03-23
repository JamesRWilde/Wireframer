/**
 * setSendRenderCommand.js - Fill Worker Render Command Sender
 *
 * PURPOSE:
 *   Sends a render command message to the CPU fill render worker with
 *   the current frame's vertex data, face data, and theme settings.
 *
 * ARCHITECTURE ROLE:
 *   Called by setDrawSolidFillModel to dispatch render work to the worker
 *   thread. The worker processes the command and returns an ImageBitmap
 *   for compositing.
 *
 * WHY THIS EXISTS:
 *   Provides a single gateway for worker command dispatch, ensuring payload
 *   format and readiness checks are consistent across render frames.
 *
 * DETAILS:
 *   Guards against sending commands when the worker is not ready.
 *   The message includes the frame ID for synchronization with the
 *   render loop.
 */

"use strict";

// Import shared fill state to check worker readiness
import { fillRenderState } from "@engine/state/stateFillRenderBridge.js";

/**
 * setSendRenderCommand - Posts a render command to the fill worker
 *
 * @param {Object} renderData - Render payload containing T, P2, triFaces, theme, etc.
 * @param {number} frameId - The current frame ID for synchronization
 * @returns {void}
 */
export function setSendRenderCommand(renderData, frameId) {
  // Guard: only send if worker exists and is ready
  if (!fillRenderState.worker || !fillRenderState.workerReady) return;

  // Post the render command with frame data and frame ID
  fillRenderState.worker.postMessage({
    type: 'render',
    ...renderData,
    frameId
  });
}
