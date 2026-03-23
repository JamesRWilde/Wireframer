/**
 * setSwitchToGpuMode.js - Switch to GPU Rendering Mode
 *
 * PURPOSE:
 *   Disposes CPU pipeline and initializes GPU pipeline. Creates the WebGL
 *   context, sets up GPU rendering, and toggles canvas visibility for
 *   the GPU display mode.
 *
 * ARCHITECTURE ROLE:
 *   Internal helper for setToggleRenderMode. Called when the user clicks
 *   the GPU/CPU toggle while in CPU mode.
 *
 * WHY THIS EXISTS:
 *   Switching from CPU to GPU requires coordinated setup: creating the
 *   WebGL context, initializing GPU shaders/buffers, setting the render
 *   function pointer to the GPU path, and toggling canvas visibility.
 *   This function centralizes all of that in one place.
 */

"use strict";

// Import foreground render function setter — sets the render pointer to GPU path
import { setRenderForeground } from '@engine/set/render/setRenderForeground.js';
// Import GPU mode setter — marks GPU as active
import { setIsGpuMode } from '@engine/set/render/setIsGpuMode.js';
// Import GPU path renderer — the actual WebGL rendering function
import { setGpuPath } from '@engine/set/render/setGpuPath.js';
// Import mesh decimator — applies LOD reduction for GPU rendering
import { decimateByPercent } from '@engine/init/mesh/initDecimateByPercent.js';
// Import canvas visibility toggles — show GPU canvas, hide CPU canvas
import { setGpuCanvasHidden } from '@engine/set/gpu/setGpuCanvasHidden.js';
import { setCanvasCpuHidden } from '@engine/set/cpu/setCanvasCpuHidden.js';
// Import HUD setter — updates HUD display to show "GPU" mode
import { setHud } from '@engine/set/engine/setHud.js';
// Import GPU canvas setter — stores the GPU canvas reference
import { setGpuCanvas } from '@engine/set/render/setGpuCanvas.js';
// Import GPU GL context setter — stores the WebGL context reference
import { setGpuGl } from '@engine/set/gpu/setGpuGl.js';
// Import loop state — stores the active render mode string
import { state } from '@engine/state/stateLoop.js';
// Import model state — holds the base model for LOD decimation
import { modelState } from '@engine/state/render/stateModel.js';
// Import active model setter — updates the displayed model after LOD
import { setActiveModel } from '@engine/set/render/physics/setActiveModel.js';

/**
 * setSwitchToGpuMode - Disposes CPU pipeline and initializes GPU pipeline
 * @returns {boolean} true if GPU mode was successfully activated, false if WebGL unavailable
 */
export function setSwitchToGpuMode() {
  // Get the GPU canvas element from the DOM
  const gpuCanvas = document.getElementById('gpu');
  if (!gpuCanvas) {
    console.warn('[setSwitchToGpuMode] GPU canvas not found, cannot switch');
    return false;
  }

  // Create WebGL context (try WebGL2 first, fall back to WebGL1)
  const gl = gpuCanvas.getContext('webgl2') ||
             gpuCanvas.getContext('webgl') ||
             gpuCanvas.getContext('experimental-webgl');
  if (!gl) {
    console.warn('[setSwitchToGpuMode] WebGL not available, cannot switch to GPU');
    return false;
  }

  // Store WebGL context and canvas in shared state
  setGpuGl(gl);
  setGpuCanvas(gpuCanvas);

  // Set the foreground render function to the GPU path
  // The closure captures 'gl' so the GPU renderer has access to the context
  setRenderForeground((meshToRender, backgroundOnSeparateCanvas, morphing) => {
    return setGpuPath(gl, meshToRender, morphing);
  });
  setIsGpuMode(true);

  // Update loop state to reflect GPU mode
  state.foregroundRenderMode = 'gpu';
  setHud('gpu');

  // Confirm we are in GPU mode and CPU mode is inactive
  state.gpuSceneDrawnLastFrame = false;
  state.cpuForegroundDrawnOnMainCanvas = false;

  // Toggle canvas visibility: show GPU, hide CPU
  setGpuCanvasHidden(false);
  setCanvasCpuHidden(true);

  // GPU background canvas appears; CPU background is hidden
  const cpuBg = document.getElementById('bg');
  const gpuBg = document.getElementById('bg-gpu');
  if (cpuBg) cpuBg.style.visibility = 'hidden';
  if (gpuBg) gpuBg.style.visibility = 'visible';

  // Update modelState.model and HUD label to reflect what GPU will render
  if (modelState.baseModel) {
    const modelToShow = modelState.currentLodPct < 1
      ? decimateByPercent(modelState.baseModel, modelState.currentLodPct)
      : modelState.baseModel;
    setActiveModel(modelToShow, modelState.name);
  }

  return true;
}
