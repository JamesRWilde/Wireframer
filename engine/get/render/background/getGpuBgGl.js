/**
 * gpuBackgroundGl.js - Get GPU background WebGL context
 *
 * One function per file module.
 */

"use strict";

import { bgState } from '@engine/state/render/background/stateBackgroundState.js';
import { getGpuBgCanvas } from '@engine/get/render/background/getGpuBgCanvas.js';

/**
 * gpuBackgroundGl - Returns the GPU background WebGL context, creating it if needed
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
