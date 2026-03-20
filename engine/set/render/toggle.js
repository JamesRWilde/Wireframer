/**
 * toggle.js - Toggle Between GPU and CPU Rendering
 * 
 * PURPOSE:
 *   Switches between GPU and CPU rendering pipelines when the user
 *   clicks the renderer stat in the HUD. Disposes the current pipeline
 *   completely and initializes the other one.
 * 
 * ARCHITECTURE ROLE:
 *   Called by rendererToggle.js during app startup to attach the click
 *   handler. Manages the complete pipeline swap including cleanup.
 */

"use strict";

// Import the render function pointer module
import { setRenderForeground, setIsGpuMode, isGpuMode } from '@engine/set/render/renderForeground.js';

// Import GPU path function (for WebGL rendering)
import { gpuPath } from '@engine/set/render/gpuPath.js';

// Import decimation for GPU LOD matching
import { decimateByPercent } from '@engine/init/mesh/decimateByPercent.js';

// Import CPU pipeline initialization
import { initializeCpuPipeline, applyCpuLodCap } from '@engine/init/render/pipeline/cpu.js';

// Import canvas visibility controls
import { canvasHidden } from '@engine/set/gpu/canvasHidden.js';
import { canvasCpuHidden } from '@engine/set/cpu/canvasCpuHidden.js';

// Import HUD updater
import { hud } from '@engine/set/engine/renderer/hud.js';

// Import GPU renderer getter and shared GPU state
import { sceneRenderer } from '@engine/get/gpu/sceneRenderer.js';
import { gpuState } from '@engine/state/gpu/scene.js';

// Import loop state for backward compatibility
import { state } from '@engine/state/engine/loop.js';

// Import model state
import { modelState, setActiveModel } from '@engine/state/render/model.js';

// Import CPU model capping
import { capModelForCpu } from '@engine/set/mesh/cpuDetailCap.js';

/**
 * toggleRenderMode - Switches between GPU and CPU rendering
 *
 * Called when user clicks the renderer stat in the HUD. Disposes the
 * current pipeline completely and initializes the other one.
 *
 * @returns {boolean} true if toggle succeeded, false if not supported
 */
export function toggleRenderMode() {
  return isGpuMode() ? switchToCpuMode() : switchToGpuMode();
}

function switchToCpuMode() {
  console.log('[toggleRenderMode] Switching from GPU to CPU');

  // Dispose previous GPU pipeline (if any) so we can reinitialize cleanly later
  const renderer = sceneRenderer();
  if (renderer?.dispose) renderer.dispose();

  // Clear cached GPU renderer so it can be reinitialized later
  gpuState.renderer = null;
  gpuState.failed = false;

  // NOTE: We intentionally do NOT call WEBGL_lose_context here because some
  // browsers will not allow re-creating a new WebGL context after a context
  // has been lost. Keeping the canvas and letting the context persist allows
  // toggling back to GPU mode reliably.

  // Initialize CPU pipeline and ensure CPU LOD cap is applied
  initializeCpuPipeline();
  applyCpuLodCap();

  // Ensure correct canvas visibility
  canvasHidden(true);
  canvasCpuHidden(false);

  // Set backward compatible state
  state.foregroundRenderMode = 'cpu';

  // Ensure model state is capped for CPU
  if (modelState.baseModel) {
    modelState.cpuBaseModel = capModelForCpu(modelState.baseModel);
  }

  console.log('[toggleRenderMode] Switched to CPU mode');
  return true;
}

function switchToGpuMode() {
  console.log('[toggleRenderMode] Switching from CPU to GPU');

  const gpuCanvas = document.getElementById('gpu');
  if (!gpuCanvas) {
    console.warn('[toggleRenderMode] GPU canvas not found, cannot switch');
    return false;
  }

  const gl = gpuCanvas.getContext('webgl2') ||
             gpuCanvas.getContext('webgl') ||
             gpuCanvas.getContext('experimental-webgl');
  if (!gl) {
    console.warn('[toggleRenderMode] WebGL not available, cannot switch to GPU');
    return false;
  }

  globalThis.gpuGl = gl;
  globalThis.gpuCanvas = gpuCanvas;

  // Ensure we attempt renderer creation even if a prior failure was recorded.
  gpuState.failed = false;

  const renderer = sceneRenderer();
  if (!renderer) {
    console.warn('[toggleRenderMode] GPU renderer creation failed');
    return false;
  }

  setRenderForeground((meshToRender, backgroundOnSeparateCanvas, morphing) => {
    return gpuPath(gl, meshToRender, morphing);
  });
  setIsGpuMode(true);

  state.foregroundRenderMode = 'gpu';
  hud('gpu');

  canvasHidden(false);
  canvasCpuHidden(true);

  // Update modelState.model and HUD label to reflect what GPU will render
  if (modelState.baseModel) {
    const modelToShow = modelState.currentLodPct < 1
      ? decimateByPercent(modelState.baseModel, modelState.currentLodPct)
      : modelState.baseModel;
    setActiveModel(modelToShow, modelState.name);
  }

  console.log('[toggleRenderMode] Switched to GPU mode');
  return true;
}
