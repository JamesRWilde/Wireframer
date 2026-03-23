/**
 * cpu.js - CPU Pipeline Initialization
 * 
 * PURPOSE:
 *   Sets up the CPU (Canvas 2D) rendering pipeline. Called when WebGL
 *   is not available or when switching from GPU to CPU.
 * 
 * ARCHITECTURE ROLE:
 *   Called by initRenderPipeline() and setToggleRenderMode(). Configures
 *   the render function pointer to use CPU rendering and updates UI.
 */

"use strict";

// Import the render function pointer module
import { setRenderForeground } from '@engine/set/render/setRenderForeground.js';
import { setIsGpuMode } from '@engine/set/render/setIsGpuMode.js';

// Import CPU path function
import { setCpuPath } from '@engine/set/render/setCpuPath.js';

// Import canvas visibility controls
import { setGpuCanvasHidden } from '@engine/set/gpu/setGpuCanvasHidden.js';
import { setCanvasCpuHidden } from '@engine/set/cpu/setCanvasCpuHidden.js';

// Import HUD updater
import { setHud } from '@engine/set/engine/setHud.js';

// Import loop state for backward compatibility
import { state } from '@engine/state/loop.js';


// Import CPU detail cap for performance safety
import { setApplyCpuLodCap } from '@engine/set/mesh/setApplyCpuLodCap.js';

/**
 * initializeCpuPipeline - Sets up CPU (Canvas 2D) rendering path
 * 
 * Configures the render function pointer to use CPU rendering and
 * updates the HUD and canvas visibility accordingly.
 */
export function initializeCpuPipeline() {
  // Set the render function pointer to CPU path
  setRenderForeground((meshToRender, backgroundOnSeparateCanvas, morphing) => {
    return setCpuPath(meshToRender, backgroundOnSeparateCanvas, morphing);
  });
  setIsGpuMode(false);
  
  // Set state for backward compatibility
  state.foregroundRenderMode = 'cpu';
  
  // Update HUD to show CPU mode
  setHud('cpu');
  
  // Show CPU canvas, hide GPU canvas
  setGpuCanvasHidden(true);
  setCanvasCpuHidden(false);

  // CPU background canvas appears; GPU background is hidden.
  const cpuBg = document.getElementById('bg');
  const gpuBg = document.getElementById('bg-gpu');
  if (cpuBg) cpuBg.style.visibility = 'visible';
  if (gpuBg) gpuBg.style.visibility = 'hidden';

  // Apply CPU LOD cap
  setApplyCpuLodCap();
}
