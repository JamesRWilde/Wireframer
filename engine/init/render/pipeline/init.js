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
import { setRenderForeground, setIsGpuMode } from '@engine/set/render/renderForeground.js';

// Import GPU path function (for WebGL rendering)
import { gpuPath } from '@engine/set/render/gpuPath.js';

// Import CPU path function (for Canvas 2D rendering)
import { cpuPath } from '@engine/set/render/cpuPath.js';

// Import canvas visibility controls
import { canvasHidden } from '@engine/set/gpu/canvasHidden.js';
import { canvasCpuHidden } from '@engine/set/cpu/canvasCpuHidden.js';

// Import HUD updater to display the current render mode
import { hud } from '@engine/set/engine/renderer/hud.js';

// Import GPU renderer getter (for WebGL context creation)
import { sceneRenderer } from '@engine/get/gpu/sceneRenderer.js';

// Import loop state to maintain backward compatibility
import { state } from '@engine/state/engine/loop.js';

// Import model state for LOD management
import { modelState } from '@engine/state/render/model.js';

// Import CPU pipeline initialization helper
import { initializeCpuPipeline } from '@engine/init/render/pipeline/cpu.js';

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
  console.log('[initRenderPipeline] Starting render pipeline initialization');
  
  // Get the GPU canvas element
  const gpuCanvas = globalThis.gpuCanvas;
  
  if (!gpuCanvas) {
    console.warn('[initRenderPipeline] No GPU canvas element, defaulting to CPU');
    initializeCpuPipeline();
    return false;
  }
  
  // Try to create WebGL context
  const gl = gpuCanvas.getContext('webgl2') || 
             gpuCanvas.getContext('webgl') || 
             gpuCanvas.getContext('experimental-webgl');
  
  if (!gl) {
    console.warn('[initRenderPipeline] WebGL not supported, using CPU pipeline');
    initializeCpuPipeline();
    return false;
  }
  
  // Store the WebGL context globally
  globalThis.gpuGl = gl;
  
  // Try to initialize GPU renderer
  console.log('[initRenderPipeline] WebGL available, initializing GPU pipeline');
  const renderer = sceneRenderer(gl);
  
  if (!renderer) {
    console.warn('[initRenderPipeline] GPU renderer creation failed, falling back to CPU');
    initializeCpuPipeline();
    return false;
  }
  
  // GPU pipeline successfully initialized
  console.log('[initRenderPipeline] GPU pipeline initialized successfully');
  
  // Set the render function pointer to GPU path
  setRenderForeground((meshToRender, backgroundOnSeparateCanvas, morphing) => {
    return gpuPath(gl, meshToRender, morphing);
  });
  setIsGpuMode(true);
  
  // Set state for backward compatibility
  state.foregroundRenderMode = 'gpu';
  
  // Update HUD to show GPU mode
  hud('gpu');
  
  // Show GPU canvas, hide CPU canvas
  canvasHidden(false);
  canvasCpuHidden(true);
  
  // Reset LOD to full detail for GPU mode (GPU should not apply CPU LOD caps)
  modelState.currentLodPct = 1;
  
  // Debug: log canvas states
  console.log('[initRenderPipeline] Canvas states:', {
    gpuCanvas: gpuCanvas ? { exists: true, visibility: gpuCanvas.style.visibility, width: gpuCanvas.width, height: gpuCanvas.height } : null,
    fgCanvas: globalThis.fgCanvas ? { exists: true, display: globalThis.fgCanvas.style.display, width: globalThis.fgCanvas.width, height: globalThis.fgCanvas.height } : null,
  });
  
  return true;
}
