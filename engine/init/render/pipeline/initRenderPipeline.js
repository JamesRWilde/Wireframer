/**
 * initRenderPipeline.js - One-Time Render Pipeline Initialization
 * 
 * PURPOSE:
 *   Detects WebGL support ONCE at startup and initializes ONLY the appropriate
 *   rendering pipeline (GPU or CPU). The other pipeline is never initialized,
 *   eliminating all per-frame checks and wasted resources.
 * 
 * ARCHITECTURE ROLE:
 *   Called during app startup (in startApp.js) after canvas initialization.
 *   This is the ONLY place where WebGL detection happens. It sets the
 *   renderForeground function pointer and initializes the chosen pipeline.
 *
 * WHY THIS EXISTS:
 *   Encapsulates the WebGL vs CPU path decision in a single function to
 *   avoid duplicated mode checks and initialization logic.
 *
 * INITIALIZATION FLOW:
 *   1. Check if GPU canvas exists and WebGL is available
 *   2. If WebGL available:
 *      - Create WebGL context
 *      - Initialize GPU renderer (shaders, buffers)
 *      - Set renderForeground = gpuPath
 *      - Set isGpuMode = true
 *      - Show GPU canvas, hide CPU canvas
 *   3. If WebGL NOT available:
 *      - Set renderForeground = cpuPath
 *      - Set isGpuMode = false
 *      - Show CPU canvas, hide GPU canvas
 * 
 * WHY THIS DESIGN:
 *   - Zero per-frame overhead: no conditionals, no function calls to check mode
 *   - Only one pipeline ever initialized (memory efficient)
 *   - Clear separation of concerns
 *   - Easy to toggle: just swap function pointer and dispose/init
 * 
 * @returns {boolean} Whether GPU rendering was initialized
 */

"use strict";

// Import the render function pointer module
import { setRenderForeground } from '@engine/set/render/setRenderForeground.js';
import { setIsGpuMode } from '@engine/set/render/setIsGpuMode.js';

// Import GPU path function (for WebGL rendering)
import { setGpuPath } from '@engine/set/render/setGpuPath.js';

// Import GPU UI canvas and context state helpers
import { getGpuCanvas } from '@engine/get/render/getGpuCanvas.js';
import { setGpuGl } from '@engine/set/gpu/setGpuGl.js';

// Import CPU path function (for Canvas 2D rendering)
import { setCpuPath } from '@engine/set/render/setCpuPath.js';

// Import canvas visibility controls
import { setGpuCanvasHidden } from '@engine/set/gpu/setGpuCanvasHidden.js';
import { setCanvasCpuHidden } from '@engine/set/cpu/setCanvasCpuHidden.js';

// Import HUD updater to display the current render mode
import { setHud } from '@engine/set/engine/setHud.js';

// Import GPU renderer getter (for WebGL context creation)
import { getSceneRendererGpu } from '@engine/get/gpu/getSceneRendererGpu.js';
import { bgState } from '@engine/state/render/background/stateBackgroundState.js';
import { createBackgroundRenderer } from '@engine/init/gpu/background/initCreateBackgroundRenderer.js';

// Import loop state to maintain backward compatibility
import { state } from '@engine/state/stateLoop.js';

// Import model state for LOD management
import { modelState } from '@engine/state/render/stateModel.js';

// Import CPU pipeline initialization helper
import { initCpuPipeline } from '@engine/init/render/pipeline/initCpuPipeline.js';

/**
 * initRenderPipeline - Detects WebGL and initializes the appropriate pipeline
 * 
 * This function is called once during app startup. It determines which
 * rendering path to use and sets up only that pipeline. The other pipeline
 * remains completely uninitialized.
 * 
 * @returns {boolean} true if GPU mode was initialized, false if CPU mode
 */
export function initRenderPipeline() {
  // Get the GPU canvas element
  const gpuCanvas = getGpuCanvas();
  
  if (!gpuCanvas) {
    initCpuPipeline();
    return false;
  }
  
  // Try to create WebGL context
  const gl = gpuCanvas.getContext('webgl2') || 
             gpuCanvas.getContext('webgl') || 
             gpuCanvas.getContext('experimental-webgl');
  
  if (!gl) {
    initCpuPipeline();
    return false;
  }
  
  // Store the WebGL context in shared state
  setGpuGl(gl);
  
  // Try to initialize GPU renderer
  const renderer = getSceneRendererGpu(gl);
  
  if (!renderer) {
    initCpuPipeline();
    return false;
  }
  
  // GPU pipeline successfully initialized

  // NOTE: do not create GPU background renderer using the foreground WebGL context.
  // GPU background is rendered on a separate canvas/context (#bg-gpu) for strict isolation.

  // Set the render function pointer to GPU path
  setRenderForeground((meshToRender, backgroundOnSeparateCanvas, morphing) => {
    return setGpuPath(gl, meshToRender, morphing);
  });
  setIsGpuMode(true);
  
  // Set state for backward compatibility
  state.foregroundRenderMode = 'gpu';
  
  // Update HUD to show GPU mode
  setHud('gpu');
  
  // Show GPU canvas, hide CPU canvas
  setGpuCanvasHidden(false);
  setCanvasCpuHidden(true);
  
  // Reset LOD to full detail for GPU mode (GPU should not apply CPU LOD caps)
  modelState.currentLodPct = 1;
  
  return true;
}
