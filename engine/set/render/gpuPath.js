/**
 * renderGpuPath.js - GPU (WebGL) Foreground Rendering Path
 * 
 * PURPOSE:
 *   Implements the GPU-based rendering path for the 3D model. This path uses
 *   WebGL for hardware-accelerated rendering and is the preferred path when
 *   available. It falls back to CPU rendering if GPU initialization fails.
 * 
 * ARCHITECTURE ROLE:
 *   Called by the frame loop when foregroundRenderMode is 'gpu'. Delegates to
 *   drawGpuSceneModel which handles shader compilation, buffer management, and
 *   WebGL draw calls. Manages canvas visibility and fallback logic.
 * 
 * GPU VS CPU:
 *   - GPU path: Faster, uses WebGL shaders for fill and wire rendering
 *   - CPU path: Fallback, uses Canvas 2D for all rendering
 *   - The app automatically selects GPU when available, falls back to CPU
 */

"use strict";

// Import the GPU scene renderer - handles all WebGL operations
// This includes shader compilation, buffer setup, and draw calls
import { drawSceneModel as drawGpuSceneModel }from '@engine/set/gpu/drawSceneModel.js';

// Import the fallback function to switch to CPU mode when GPU fails
// This updates the render mode and HUD display
import { cpuForegroundMode as fallbackToCpuForegroundMode }from '@engine/set/engine/cpuForegroundMode.js';

// Import canvas visibility toggles
// GPU path shows the GPU canvas and hides the CPU canvas
import { canvasHidden }from '@engine/set/gpu/canvasHidden.js';
import { canvasCpuHidden }from '@engine/set/cpu/canvasCpuHidden.js';
import { getRotation }from '@engine/state/render/physicsState.js';

/**
 * renderGpuPath - Renders the 3D model using the GPU (WebGL) rendering path
 * 
 * @param {Object} meshToRender - The mesh object to render { V, F, E }
 * @param {boolean} morphing - Whether a morph animation is in progress
 *   When true, geometry is marked as dynamic for buffer updates
 * 
 * @returns {boolean} Whether GPU rendering succeeded
 *   true: GPU rendering completed successfully
 *   false: GPU rendering failed, CPU fallback was triggered
 * 
 * This function:
 * 1. Calls drawGpuSceneModel with all rendering parameters
 * 2. Updates canvas visibility based on success/failure
 * 3. Falls back to CPU mode if GPU rendering fails
 */
import { getFillOpacity, getWireOpacity, getTheme }from '@engine/state/render/renderState.js';

export function gpuPath(meshToRender, morphing) {
  // Call the GPU renderer with all necessary parameters
  // These are gathered from renderState and passed as a config object
  let gpuDrawn = drawGpuSceneModel(meshToRender, {
    // Opacity controls - modulate fill and wire visibility
    fillAlpha: getFillOpacity(),
    wireAlpha: getWireOpacity(),
    
    // Camera parameters - control view and projection
    zoom: globalThis.ZOOM,
    modelCy: globalThis.MODEL_CY,  // Model vertical center for projection
    zHalf: globalThis.Z_HALF,      // Half-depth for depth calculations
    
    // Rotation matrix - applied to all vertices
    rotation: getRotation(),
    
    // Viewport dimensions
    width: globalThis.W,
    height: globalThis.H,
    
    // Visual parameters
    theme: getTheme(),       // Color theme for fill/wire
    lightDir: globalThis.LIGHT_DIR, // Light direction for shading
    viewDir: globalThis.VIEW_DIR,  // View direction for specular
    
    // Dynamic geometry flag - true during morphing for buffer updates
    dynamic: morphing,
  });
  
  // Update canvas visibility based on GPU rendering success
  // If GPU succeeded: show GPU canvas, hide CPU canvas
  // If GPU failed: hide GPU canvas, show CPU canvas (for fallback)
  canvasHidden(!gpuDrawn);
  canvasCpuHidden(gpuDrawn);
  
  // If GPU rendering failed, trigger fallback to CPU mode
  // This updates foregroundRenderMode so subsequent frames use CPU path
  if (!gpuDrawn) fallbackToCpuForegroundMode();
  
  // Return success/failure status for the frame loop
  return gpuDrawn;
}
