/**
 * switchToGpuMode.js - Switch to GPU Rendering Mode
 *
 * PURPOSE:
 *   Disposes CPU pipeline and initializes GPU pipeline.
 *
 * ARCHITECTURE ROLE:
 *   Internal helper for toggleRenderMode. Not exported publicly.
 *
 * USAGE:
 *   Called by toggleRenderMode when switching from CPU to GPU.
 */

"use strict";

import { setRenderForeground } from '@engine/set/render/setRenderForeground.js';
import { setIsGpuMode } from '@engine/set/render/setIsGpuMode.js';
import { gpuPath } from '@engine/set/render/gpuPath.js';
import { decimateByPercent } from '@engine/init/mesh/decimateByPercent.js';
import { canvasHidden } from '@engine/set/gpu/canvasHidden.js';
import { canvasCpuHidden } from '@engine/set/cpu/canvasCpuHidden.js';
import { hud } from '@engine/set/engine/renderer/hud.js';
import { setGpuCanvas } from '@engine/set/render/setGpuCanvas.js';
import { setGpuGl } from '@engine/set/gpu/setGpuGl.js';
import { state } from '@engine/state/engine/loop.js';
import { modelState } from '@engine/state/render/model.js';
import { setActiveModel } from '@engine/set/render/physics/model.js';

export function switchToGpuMode() {
  const gpuCanvas = document.getElementById('gpu');
  if (!gpuCanvas) {
    console.warn('[switchToGpuMode] GPU canvas not found, cannot switch');
    return false;
  }

  const gl = gpuCanvas.getContext('webgl2') ||
             gpuCanvas.getContext('webgl') ||
             gpuCanvas.getContext('experimental-webgl');
  if (!gl) {
    console.warn('[switchToGpuMode] WebGL not available, cannot switch to GPU');
    return false;
  }

  setGpuGl(gl);
  setGpuCanvas(gpuCanvas);
  setRenderForeground((meshToRender, backgroundOnSeparateCanvas, morphing) => {
    return gpuPath(gl, meshToRender, morphing);
  });
  setIsGpuMode(true);

  state.foregroundRenderMode = 'gpu';
  hud('gpu');

  // Confirm we are in GPU mode and CPU mode is inactive
  state.gpuSceneDrawnLastFrame = false;
  state.cpuForegroundDrawnOnMainCanvas = false;

  canvasHidden(false);
  canvasCpuHidden(true);

  // Update modelState.model and HUD label to reflect what GPU will render
  if (modelState.baseModel) {
    const modelToShow = modelState.currentLodPct < 1
      ? decimateByPercent(modelState.baseModel, modelState.currentLodPct)
      : modelState.baseModel;
    setActiveModel(modelToShow, modelState.name);
  }

  return true;
}
