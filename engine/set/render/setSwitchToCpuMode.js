/**
 * setSwitchToCpuMode.js - Switch to CPU Rendering Mode
 *
 * PURPOSE:
 *   Disposes GPU pipeline and initializes CPU pipeline. Handles the full
 *   teardown of GPU resources (renderer, background) and sets up the
 *   CPU canvas, background worker, and LOD cap.
 *
 * ARCHITECTURE ROLE:
 *   Internal helper for setToggleRenderMode. Called when the user clicks
 *   the GPU/CPU toggle while in GPU mode.
 *
 * WHY THIS EXISTS:
 *   Switching from GPU to CPU requires coordinated teardown and setup:
 *   dispose GPU renderer, clear cached state, init CPU pipeline, apply
 *   LOD cap, init background worker for CPU, and toggle canvas visibility.
 *   This function centralizes all of that in one place.
 */

"use strict";

// Import CPU pipeline initializer — sets up the CPU rendering path
import { initCpuPipeline } from '@engine/init/render/pipeline/initCpuPipeline.js';
// Import LOD cap applier — caps geometry detail for CPU performance
import { setApplyCpuLodCap } from '@engine/set/mesh/setApplyCpuLodCap.js';
// Import canvas visibility toggles — hide GPU canvas, show CPU canvas
import { setGpuCanvasHidden } from '@engine/set/gpu/setGpuCanvasHidden.js';
import { setCanvasCpuHidden } from '@engine/set/cpu/setCanvasCpuHidden.js';
// Import loop state — stores the active render mode string
import { state } from '@engine/state/stateLoop.js';
// Import GPU renderer getter — retrieves the current GPU renderer for disposal
import { getSceneRendererGpu } from '@engine/get/gpu/getSceneRendererGpu.js';
// Import GPU scene state — holds the cached renderer reference
import { gpuState } from '@engine/state/gpu/stateScene.js';
// Import background state — holds the GPU background renderer for disposal
import { bgState } from '@engine/state/render/background/stateBackgroundState.js';
// Import background worker initializer — sets up CPU background particle worker
import { initBackgroundWorker } from '@engine/init/render/initBackgroundWorker.js';

/**
 * setSwitchToCpuMode - Disposes GPU pipeline and initializes CPU pipeline
 * @returns {boolean} true to confirm CPU mode is now active
 */
export function setSwitchToCpuMode() {
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
  initCpuPipeline();
  setApplyCpuLodCap();

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

  return true;
}
