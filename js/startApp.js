/**
 * startApp.js - Application Initialization and Startup
 * 
 * PURPOSE:
 *   Initializes all application subsystems and starts the animation loop.
 *   This is the main entry point called once when the app loads. It sets up
 *   canvas, physics, UI controls, theme, and kicks off requestAnimationFrame.
 * 
 * ARCHITECTURE ROLE:
 *   Called by the frame loop entry point after all modules are loaded.
 *   Orchestrates the startup sequence to ensure proper initialization order.
 */

"use strict";

// Canvas init
import { initCanvas } from '@engine/init/render/initCanvas.js';

// Mesh loader side-effects (registers load APIs in state modules)
import '@engine/init/mesh/initLoad.js';
import '@engine/init/mesh/initLoadObjMesh.js';

// Model state side-effect
import '@engine/state/render/stateModel.js';

// Morph API side-effect (registers morph API in state modules)
import '@engine/init/mesh/initMorphApi.js';

// UI init functions
import { initObjectSelector } from '@ui/init/initObjectSelector.js';

// Frame loop
import { setAnimationFrame } from '@engine/set/engine/frame/setAnimationFrame.js';

// Rotation
import { getRotationInit } from '@engine/get/render/rotation/getRotationInit.js';
import { R } from '@engine/state/render/stateRotationMatrixRef.js';
import { setRotation } from '@engine/state/render/statePhysicsState.js';

// Render toggles
import { setSyncRenderToggles } from '@ui/set/setSyncRenderToggles.js';

// Restored state
import { setRestoredState } from '@engine/set/engine/setRestoredState.js';

// Input/slider listeners
import { initInputListeners } from '@ui/init/attach/initInputListeners.js';
import { initAttachSliderListeners } from '@ui/init/attach/initAttachSliderListeners.js';

// Theme controls
import { initThemeControls } from '@engine/init/engine/initThemeControls.js';

// Renderer toggle
import { initRendererToggle } from '@engine/init/engine/initRendererToggle.js';

// Render pipeline initialization (GPU/CPU selection)
import { initRenderPipeline } from '@engine/init/render/pipeline/initRenderPipeline.js';

// Background worker initialization (dedicated background pipeline)
import { initBackgroundWorker } from '@engine/init/render/initBackgroundWorker.js';
import { getIsGpuMode } from '@engine/get/render/getIsGpuMode.js';

// Debug overlay removed for production build
// (no longer supported)

// Detail level
import { setDetailLevel } from '@engine/set/mesh/setDetailLevel.js';

// DOM element references
import {
  bgDensity,
  bgVelocity,
  bgOpacity,
  fillOpacity,
  wireOpacity,
  lodSlider,
} from '@ui/state/stateDom.js';

/**
 * startApp - Initializes all subsystems and starts the animation loop
 */
export function startApp() {
  // Step 1: Initialize rotation matrix
  getRotationInit();
  
  // Step 2: Zoom state is self-initializing via zoomState.js import
  // (defaults: zoom=1, min=0.45, max=2.75)
  
  // Step 3: Set rotation matrix in physics state
  setRotation(R.value);

  // Step 5: Ensure opacity sliders start at full opacity
  if (fillOpacity) fillOpacity.value = '100';
  if (wireOpacity) wireOpacity.value = '100';

  // Step 6: Restore UI state and attach input listeners
  const shapeName = setRestoredState();
  initInputListeners();
  
  // Step 7: Initialize the object selector with the restored shape
  initObjectSelector(shapeName);

  // Step 8: Attach slider listeners
  initAttachSliderListeners([
    { name: 'bgDensity', el: bgDensity },
    { name: 'bgVelocity', el: bgVelocity },
    { name: 'bgOpacity', el: bgOpacity },
    { name: 'fillOpacity', el: fillOpacity },
    { name: 'wireOpacity', el: wireOpacity },
  ], lodSlider, setDetailLevel);
  
  // Step 9: Initialize render toggles from UI state
  try {
    setSyncRenderToggles();
  } catch (e) {
    console.warn('[startApp] setSyncRenderToggles failed', e);
  }
  
  // Step 10: Initialize UI theme controls
  initThemeControls();

  // Step 11: Initialize the render pipeline (GPU or CPU based on WebGL availability)
  // This is a one-time initialization that sets the active renderer
  initRenderPipeline();

  // Step 12: Initialize the background worker pipeline for CPU particle updates only.
  // GPU background is handled through dedicated WebGL pipeline in bgState.gpuBackgroundRenderer.
  if (!getIsGpuMode()) {
    initBackgroundWorker('cpu');
  }

  // Step 13: Initialize renderer toggle functionality
  initRendererToggle();

  // Step 13: Start the animation loop
  try {
    requestAnimationFrame(setAnimationFrame);
  } catch (e) {
    console.error('[startApp] Failed to start animation loop', e);
  }
  
}

// When loaded as the application entry point, initialize canvas and start.
if (typeof document !== 'undefined') {
  try {
    initCanvas();
  } catch (e) {
    console.warn('[startApp] canvas init failed', e);
  }
  startApp();
}
