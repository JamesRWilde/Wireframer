/**
 * setSwitchToGpuMode.js - Switch to GPU Rendering Mode
 *
 * PURPOSE:
 *   Disposes CPU pipeline and initializes GPU pipeline.
 *
 * ARCHITECTURE ROLE:
 *   Internal helper for setToggleRenderMode. Not exported publicly.
 *
 * USAGE:
 *   Called by setToggleRenderMode when switching from CPU to GPU.
 */

"use strict";

import { setRenderForeground } from '@engine/set/render/setRenderForeground.js';
import { setIsGpuMode } from '@engine/set/render/setIsGpuMode.js';
import { setGpuPath } from '@engine/set/render/setGpuPath.js';
import { decimateByPercent } from '@engine/init/mesh/decimateByPercent.js';
import { setGpuCanvasHidden } from '@engine/set/gpu/setGpuCanvasHidden.js';
import { setCanvasCpuHidden } from '@engine/set/cpu/setCanvasCpuHidden.js';
import { setHud } from '@engine/set/engine/setHud.js';
import { setGpuCanvas } from '@engine/set/render/setGpuCanvas.js';
import { setGpuGl } from '@engine/set/gpu/setGpuGl.js';
import { state } from '@engine/state/loop.js';
import { modelState } from '@engine/state/render/model.js';
import { setActiveModel } from '@engine/set/render/physics/setActiveModel.js';

export function setSwitchToGpuMode() {
  const gpuCanvas = document.getElementById('gpu');
  if (!gpuCanvas) {
    console.warn('[setSwitchToGpuMode] GPU canvas not found, cannot switch');
    return false;
  }

  const gl = gpuCanvas.getContext('webgl2') ||
             gpuCanvas.getContext('webgl') ||
             gpuCanvas.getContext('experimental-webgl');
  if (!gl) {
    console.warn('[setSwitchToGpuMode] WebGL not available, cannot switch to GPU');
    return false;
  }

  setGpuGl(gl);
  setGpuCanvas(gpuCanvas);
  setRenderForeground((meshToRender, backgroundOnSeparateCanvas, morphing) => {
    return setGpuPath(gl, meshToRender, morphing);
  });
  setIsGpuMode(true);

  state.foregroundRenderMode = 'gpu';
  setHud('gpu');

  // Confirm we are in GPU mode and CPU mode is inactive
  state.gpuSceneDrawnLastFrame = false;
  state.cpuForegroundDrawnOnMainCanvas = false;

  setGpuCanvasHidden(false);
  setCanvasCpuHidden(true);

  // GPU background canvas appears; CPU background is hidden.
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
