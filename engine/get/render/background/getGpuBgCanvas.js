/**
 * gpuBackgroundCanvas.js - Get GPU background canvas element
 *
 * One function per file module.
 */

"use strict";

import { bgState } from '@engine/state/render/background/stateBackgroundState.js';

/**
 * gpuBackgroundCanvas - Returns the GPU background canvas element
 *
 * @returns {HTMLCanvasElement|null} The GPU background canvas or null
 */
export function getGpuBgCanvas() {
  return bgState.gpuBackgroundCanvas;
}
