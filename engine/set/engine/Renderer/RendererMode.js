/**
 * SetEngineRendererMode.js - Toggle Between GPU and CPU Rendering Modes
 * 
 * PURPOSE:
 *   Provides a function to toggle between GPU (WebGL) and CPU (Canvas 2D) rendering
 *   modes. This allows users to manually switch rendering paths for debugging or
 *   preference purposes.
 * 
 * ARCHITECTURE ROLE:
 *   Called by the renderer stat click handler in InitEngineRendererToggle.js. Updates
 *   the loop state and HUD to reflect the new mode. Clears canvases as needed
 *   to prevent visual artifacts when switching.
 * 
 * BEHAVIOR:
 *   - If GPU is supported: toggles between 'gpu' and 'cpu' modes
 *   - If GPU is not supported: does nothing (CPU is the only option)
 *   - Clears the GPU canvas when switching to CPU to prevent stale content
 *   - Clears the CPU canvas when switching to GPU to prevent stale content
 */

"use strict";

// Import loop state to read/write the cached render mode
import { state } from '../state/engineLoop.js';

// Import HUD updater to display the current render mode
import { engineRendererHud } from './engineRendererHud.js';

// Import GPU canvas clearing for when switching from GPU to CPU
import { gpuEngineClearSceneCanvas } from '../set/gpuEngineClearSceneCanvas.js';

// Import GPU renderer getter to check if GPU is available
import { gpuEngineSceneRenderer } from '../get/gpuEngineSceneRenderer.js';

/**
 * SetEngineRendererMode - Toggles between GPU and CPU rendering modes
 * 
 * This function is called when the user clicks the renderer stat in the HUD.
 * It checks if GPU is supported before allowing the toggle, and updates the
 * rendering mode and HUD accordingly.
 * 
 * @returns {boolean} Whether the toggle was performed
 *   true: mode was toggled successfully
 *   false: toggle was not performed (GPU not supported or mode unchanged)
 */
export function engineRendererMode() {
  // Check if GPU renderer is available
  // If not, we can't toggle - CPU is the only option
  const renderer = GetGpuEngineSceneRenderer();
  if (!renderer) {
    // GPU not supported, cannot toggle
    return false;
  }

  // Get the current mode
  const currentMode = state.foregroundRenderMode;
  
  // Determine the new mode (toggle between gpu and cpu)
  const newMode = currentMode === 'gpu' ? 'cpu' : 'gpu';
  
  // If mode hasn't changed, nothing to do
  if (newMode === currentMode) {
    return false;
  }

  // Update the render mode in loop state
  state.foregroundRenderMode = newMode;
  
  // Update the HUD display
  SetEngineRendererHud(newMode);
  
  // Clear canvases based on the new mode
  if (newMode === 'cpu') {
    // Switching to CPU: clear GPU canvas to prevent stale content
    SetGpuEngineClearSceneCanvas();
  } else {
    // Switching to GPU: clear CPU canvas to prevent stale content
    // The GPU canvas will be cleared by the GPU renderer on next frame
    const ctx = globalThis.ctx;
    if (ctx?.canvas) {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }
  }
  
  // Toggle was successful
  return true;
}
