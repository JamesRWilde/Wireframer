/**
 * switchToCpuMode.js - Switch to CPU Rendering Mode
 *
 * PURPOSE:
 *   Disposes GPU pipeline and initializes CPU pipeline.
 *
 * ARCHITECTURE ROLE:
 *   Internal helper for toggleRenderMode. Not exported publicly.
 *
 * USAGE:
 *   Called by toggleRenderMode when switching from GPU to CPU.
 */

"use strict";

import { initializeCpuPipeline } from '@engine/init/render/pipeline/cpu.js';
import { applyCpuLodCap } from '@engine/set/mesh/applyCpuLodCap.js';
import { canvasHidden } from '@engine/set/gpu/canvasHidden.js';
import { canvasCpuHidden } from '@engine/set/cpu/canvasCpuHidden.js';
import { state } from '@engine/state/engine/loop.js';
import { sceneRenderer } from '@engine/get/gpu/sceneRenderer.js';
import { gpuState } from '@engine/state/gpu/scene.js';
import { bgState } from '@engine/state/render/background/backgroundState.js';
import { getGpuGl } from '@engine/get/gpu/getGpuGl.js';

export function switchToCpuMode() {
  // Dispose previous GPU pipeline (if any)
  const renderer = sceneRenderer();
  if (renderer?.dispose) renderer.dispose();

  // Clear cached GPU renderer
  gpuState.renderer = null;
  gpuState.failed = false;

  // Dispose GPU background renderer if initialized (GPU background pipeline)
  if (bgState.gpuBackgroundRenderer?.dispose) {
    const gl = getGpuGl();
    if (gl) bgState.gpuBackgroundRenderer.dispose(gl);
    bgState.gpuBackgroundRenderer = null;
  }

  // Initialize CPU pipeline and apply LOD cap
  initializeCpuPipeline();
  applyCpuLodCap();

  // Ensure correct canvas visibility
  canvasHidden(true);
  canvasCpuHidden(false);

  // Set backward compatible state
  state.foregroundRenderMode = 'cpu';

  // Confirm CPU mode for next frame and GPU mode turned off
  state.gpuSceneDrawnLastFrame = false;
  state.cpuForegroundDrawnOnMainCanvas = true;

  // applyCpuLodCap already sets cpuBaseModel and currentLodModel
  // No need to recap here - that would double-decimate

  return true;
}
