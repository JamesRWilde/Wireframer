/**
 * setBackgroundGpu.js - GPU Background Rendering Pipeline
 *
 * PURPOSE:
 *   Renders the animated background particles using the GPU path when
 *   GPU mode is active. Worker updates particle data; GPU renderer draws
 *   to the GPU canvas.
 *
 * ARCHITECTURE ROLE:
 *   Used by main scene renderer in GPU mode.
 *   Separates GPU background pipeline from CPU background pipeline.
 */

"use strict";

import { isGpuMode as getIsGpuMode } from '@engine/get/render/getIsGpuMode.js';
import { bgState } from '@engine/state/render/background/backgroundState.js';
import { getColors } from '@engine/get/render/background/getColors.js';
import { createBackgroundRenderer } from '@engine/init/gpu/background/createBackgroundRenderer.js';
import { utilParsedCssColor } from '@engine/util/render/background/utilParsedCssColor.js';
import { getGpuBgCanvas } from '@engine/get/render/background/getGpuBgCanvas.js';
import { getGpuBgGl } from '@engine/get/render/background/getGpuBgGl.js';

/**
 * setBackgroundGpu - GPU background pipeline
 *
 * @param {number} [nowMs]
 * @returns {boolean}
 */
export function setBackgroundGpu(nowMs) {
  if (!getIsGpuMode()) {
    throw new Error('setBackgroundGpu executed while CPU mode active');
  }

  const bgCanvas = getGpuBgCanvas();
  if (!bgCanvas) return false;

  const w = bgCanvas.clientWidth || bgCanvas.width;
  const h = bgCanvas.clientHeight || bgCanvas.height;

  const gl = getGpuBgGl();
  if (!gl) return false;

  // Show GPU background canvas and hide CPU background canvas
  const cpuBgCanvas = document.getElementById('bg');
  if (cpuBgCanvas) cpuBgCanvas.style.visibility = 'hidden';
  bgCanvas.style.visibility = 'visible';

  // Clear background in WebGL before particle draw
  const { bgColor, particleColor } = getColors();

  // Decode particle color into numeric RGB directly to avoid parser edge cases.
  const decodedParticleColor = utilParsedCssColor(particleColor || '#ffffff');
  const activeParticleColor = [decodedParticleColor.r, decodedParticleColor.g, decodedParticleColor.b];

  const parsedColor = utilParsedCssColor(bgColor);
  gl.viewport(0, 0, w, h);
  gl.clearColor(parsedColor.r, parsedColor.g, parsedColor.b, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  let renderer = bgState.gpuBackgroundRenderer;
  if (!renderer) {
    renderer = createBackgroundRenderer(gl);
    bgState.gpuBackgroundRenderer = renderer;
  }

  if (!renderer?.draw) return false;

  renderer.draw(gl, {
    width: w,
    height: h,
    colorRgb: activeParticleColor,
    opacity: bgState.opacityPct,
    time: nowMs ?? performance.now(),
    velocityScale: bgState.velocityPct,
    density: bgState.densityPct,
  });

  return true;
}

