/**
 * getGpuBgGl.js - Gets GPU Background WebGL Context
 *
 * PURPOSE:
 *   Returns or initializes the WebGL context for the GPU background canvas.
 *
 * ARCHITECTURE ROLE:
 *   Getter module in engine/get/render/background for GPU path context retrieval.
 *
 * WHY THIS EXISTS:
 *   Ensures there's a single, cached path for WebGL context creation and reuse.
 */

"use strict";

import { bgState } from '@engine/state/render/background/stateBackgroundState.js';
import { getGpuBgCanvas } from '@engine/get/render/background/getGpuBgCanvas.js';

/**
 * getGpuBgGl - Returns the GPU background WebGL context, creating it if needed
 *
 * @returns {WebGLRenderingContext|null} The WebGL context or null if unavailable
 */
export function getGpuBgGl() {
  if (bgState.gpuBackgroundGl) return bgState.gpuBackgroundGl;

  const canvas = getGpuBgCanvas();
  if (!canvas) return null;

  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) return null;

  bgState.gpuBackgroundGl = gl;
  return gl;
}
