/**
 * cpu.js - CPU Pipeline Initialization
 * 
 * PURPOSE:
 *   Sets up the CPU (Canvas 2D) rendering pipeline. Called when WebGL
 *   is not available or when switching from GPU to CPU.
 * 
 * ARCHITECTURE ROLE:
 *   Called by initRenderPipeline() and toggleRenderMode(). Configures
 *   the render function pointer to use CPU rendering and updates UI.
 */

"use strict";

// Import the render function pointer module
import { setRenderForeground, setIsGpuMode } from '@engine/set/render/renderForeground.js';

// Import CPU path function
import { cpuPath } from '@engine/set/render/cpuPath.js';

// Import canvas visibility controls
import { canvasHidden } from '@engine/set/gpu/canvasHidden.js';
import { canvasCpuHidden } from '@engine/set/cpu/canvasCpuHidden.js';

// Import HUD updater
import { hud } from '@engine/set/engine/renderer/hud.js';

// Import loop state for backward compatibility
import { state } from '@engine/state/engine/loop.js';

// Import model state for LOD management
import { modelState } from '@engine/state/render/model.js';

// Import LOD detail level setter
import { detailLevel } from '@engine/set/mesh/detailLevel.js';
import { getDetailLevelValue } from '@engine/get/render/getDetailLevelValue.js';

// Import CPU detail cap for performance safety
import { capModelForCpu } from '@engine/set/mesh/cpuDetailCap.js';

/**
 * initializeCpuPipeline - Sets up CPU (Canvas 2D) rendering path
 * 
 * Configures the render function pointer to use CPU rendering and
 * updates the HUD and canvas visibility accordingly.
 */
export function initializeCpuPipeline() {
  // Set the render function pointer to CPU path
  setRenderForeground((meshToRender, backgroundOnSeparateCanvas, morphing) => {
    return cpuPath(meshToRender, backgroundOnSeparateCanvas, morphing);
  });
  setIsGpuMode(false);
  
  // Set state for backward compatibility
  state.foregroundRenderMode = 'cpu';
  
  // Update HUD to show CPU mode
  hud('cpu');
  
  // Show CPU canvas, hide GPU canvas
  canvasHidden(true);
  canvasCpuHidden(false);

  // Apply CPU LOD cap
  applyCpuLodCap();
}

// Refactored function to apply CPU LOD cap
export function applyCpuLodCap() {
  // Use the base model if set, otherwise fall back to the active model.
  // This protects against cases where setActiveModel() is called directly
  // and baseModel was not updated (e.g. legacy load paths).
  const baseModel = modelState.baseModel || modelState.model;
  if (!baseModel) return;

  // Ensure the LOD percentage matches the UI slider/last user setting.
  const detailLevelValue = getDetailLevelValue();
  if (typeof detailLevelValue === 'number') {
    modelState.currentLodPct = Math.max(0, Math.min(1, detailLevelValue));
  }

  // Recalculate the capped model (only decimates if over the cap)
  modelState.cpuBaseModel = capModelForCpu(baseModel);

  // Recompute current LOD model from capped base
  detailLevel(modelState.currentLodPct);
}
