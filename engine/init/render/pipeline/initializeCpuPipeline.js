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
import { setRenderForeground } from '@engine/set/render/setRenderForeground.js';
import { setIsGpuMode } from '@engine/set/render/setIsGpuMode.js';

// Import CPU path function
import { cpuPath } from '@engine/set/render/cpuPath.js';

// Import canvas visibility controls
import { canvasHidden } from '@engine/set/gpu/canvasHidden.js';
import { canvasCpuHidden } from '@engine/set/cpu/canvasCpuHidden.js';

// Import HUD updater
import { hud } from '@engine/set/engine/renderer/hud.js';

// Import loop state for backward compatibility
import { state } from '@engine/state/engine/loop.js';


// Import CPU detail cap for performance safety
import { applyCpuLodCap } from '@engine/set/mesh/applyCpuLodCap.js';

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

  // CPU background canvas appears; GPU background is hidden.
  const cpuBg = document.getElementById('bg');
  const gpuBg = document.getElementById('bg-gpu');
  if (cpuBg) cpuBg.style.visibility = 'visible';
  if (gpuBg) gpuBg.style.visibility = 'hidden';

  // Apply CPU LOD cap
  applyCpuLodCap();
}
