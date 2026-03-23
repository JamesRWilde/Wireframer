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

import { initializeCpuPipeline } from '@engine/init/render/pipeline/initializeCpuPipeline.js';
import { applyCpuLodCap } from '@engine/set/mesh/applyCpuLodCap.js';
import { setGpuCanvasHidden } from '@engine/set/gpu/setGpuCanvasHidden.js';
import { setCanvasCpuHidden } from '@engine/set/cpu/setCanvasCpuHidden.js';
import { state } from '@engine/state/loop.js';
import { getSceneRendererGpu } from '@engine/get/gpu/getSceneRendererGpu.js';
import { gpuState } from '@engine/state/gpu/scene.js';
import { bgState } from '@engine/state/render/background/backgroundState.js';
import { initBackgroundWorker } from '@engine/init/render/initBackgroundWorker.js';

export function switchToCpuMode() {
  // Dispose previous GPU pipeline (if any)
  const renderer = getSceneRendererGpu();
  if (renderer?.dispose) renderer.dispose();

  // Clear cached GPU renderer
  gpuState.renderer = null;
  gpuState.failed = false;

  // Dispose GPU background renderer if initialized (GPU background pipeline)
  if (bgState.gpuBackgroundRenderer?.dispose) {
    const bgGl = bgState.gpuBackgroundGl;
    if (bgGl) bgState.gpuBackgroundRenderer.dispose(bgGl);
    bgState.gpuBackgroundRenderer = null;
    bgState.gpuBackgroundGl = null;
  }

  // Reset GPU background pipeline context to avoid stale references
  bgState.gpuBackgroundGl = null;

  // Initialize CPU pipeline and apply LOD cap
  initializeCpuPipeline();
  applyCpuLodCap();

  // Initialize CPU background worker pipeline now that GPU has been disabled.
  initBackgroundWorker('cpu');

  // Ensure correct canvas visibility
  setGpuCanvasHidden(true);
  setCanvasCpuHidden(false);

  // Set backward compatible state
  state.foregroundRenderMode = 'cpu';

  // Confirm CPU mode for next frame and GPU mode turned off
  state.gpuSceneDrawnLastFrame = false;
  state.cpuForegroundDrawnOnMainCanvas = true;

  // applyCpuLodCap already sets cpuBaseModel and currentLodModel
  // No need to recap here - that would double-decimate

  return true;
}
