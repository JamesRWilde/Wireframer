/**
 * getCanvasCtx.js - Get Canvas 2D Context
 *
 * PURPOSE:
 *   Exposes the active 2D canvas rendering context from centralized state.
 *
 * ARCHITECTURE ROLE:
 *   Getter module in engine/get/render for rendering pipeline initialization.
 *
 * WHY THIS EXISTS:
 *   Provides a safe, single source of truth for canvas context access,
 *   avoiding direct state object coupling across UI modules.
 */

"use strict";

// Import the shared canvas context state container
// Used by render loop and drawing utilities needing 2D context.
import { canvasContext } from '@engine/state/render/stateCanvasContextState.js';

/**
 * getCanvasCtx - return the current 2D canvas rendering context.
 * @returns {CanvasRenderingContext2D|null}
 */
export function getCanvasCtx() {
  // Use shared state accessor; the context can be null if not setup yet.
  return canvasContext.ctx;
}
