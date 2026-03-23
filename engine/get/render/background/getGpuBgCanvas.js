/**
 * getGpuBgCanvas.js - GPU Background Canvas Getter
 *
 * PURPOSE:
 *   Returns the GPU background canvas element.
 *
 * ARCHITECTURE ROLE:
 *   Getter module in engine/get/render/background for GPU path canvas access.
 *
 * WHY THIS EXISTS:
 *   Encapsulates canvas retrieval to avoid direct state usage in downstream modules.
 */

"use strict";

import { bgState } from '@engine/state/render/background/stateBackgroundState.js';

/**
 * getGpuBgCanvas - Returns the GPU background canvas element
 *
 * @returns {HTMLCanvasElement|null} The GPU background canvas or null
 */
export function getGpuBgCanvas() {
  return bgState.gpuBackgroundCanvas;
}
