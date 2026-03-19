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
import { canvas } from '@engine/init/render/canvas.js';

// Loader side-effects (sets up globalThis.load)
import '@engine/init/mesh/load.js';

// OBJ loader side-effects (sets up globalThis.loadObjMesh)
import '@engine/init/mesh/loadObjMesh.js';

// Model state side-effect
import '@engine/state/render/model.js';

// Morph API side-effect (exposes globalThis.morph)
import '@engine/init/mesh/morphApi.js';

// UI init functions
import { initObjectSelector } from '@ui/init/objectSelector.js';

// Frame loop
import { animationFrame } from '@engine/set/engine/frame/animationFrame.js';

// Rotation
import { initialize as rotationInitialize } from '@engine/get/render/rotation/initialize.js';
import { R } from '@engine/state/render/rotationMatrixRef.js';
import { setRotation } from '@engine/state/render/physicsState.js';

// Render toggles
import { syncRenderToggles } from '@ui/set/syncRenderToggles.js';

// Restored state
import { restoredState } from '@engine/set/engine/restoredState.js';

// Input/slider listeners
import { inputListeners } from '@ui/init/attach/inputListeners.js';
import { sliderListeners } from '@ui/init/attach/sliderListeners.js';

// Theme controls
import { themeControls } from '@engine/init/engine/themeControls.js';

// Renderer toggle
import { rendererToggle } from '@engine/init/engine/rendererToggle.js';

// Render pipeline initialization (GPU/CPU selection)
import { initRenderPipeline } from '@engine/init/render/pipeline/init.js';

// Debug overlay (sphere outline + centre cross)
import { initDebugOverlay, toggleDebugOverlay } from '@engine/get/render/debugOverlay.js';
initDebugOverlay();
globalThis.toggleDebugOverlay = toggleDebugOverlay;

// Detail level
import { detailLevel } from '@engine/set/mesh/detailLevel.js';

// DOM element references
import {
  bgDensity,
  bgVelocity,
  bgOpacity,
  fillOpacity,
  wireOpacity,
  lodSlider,
} from '@ui/state/dom.js';

/**
 * startApp - Initializes all subsystems and starts the animation loop
 */
export function startApp() {
  // Step 1: Initialize rotation matrix
  rotationInitialize();
  
  // Step 2: Zoom state is self-initializing via zoomState.js import
  // (defaults: zoom=1, min=0.45, max=2.75)
  
  // Step 3: Set rotation matrix in physics state
  setRotation(R.value);

  // Step 4: Debug flags self-initialize via debugFlags.js import (all default false)

  // Step 5: Ensure opacity sliders start at full opacity
  if (fillOpacity) fillOpacity.value = '100';
  if (wireOpacity) wireOpacity.value = '100';

  // Step 6: Restore UI state and attach input listeners
  const shapeName = restoredState();
  inputListeners();
  
  // Step 7: Initialize the object selector with the restored shape
  initObjectSelector(shapeName);

  // Step 8: Attach slider listeners
  sliderListeners([
    { name: 'bgDensity', el: bgDensity },
    { name: 'bgVelocity', el: bgVelocity },
    { name: 'bgOpacity', el: bgOpacity },
    { name: 'fillOpacity', el: fillOpacity },
    { name: 'wireOpacity', el: wireOpacity },
  ], lodSlider, detailLevel);
  
  // Step 9: Initialize render toggles from UI state
  syncRenderToggles();
  
  // Step 10: Initialize UI theme controls
  themeControls();

  // Step 11: Initialize the render pipeline (GPU or CPU based on WebGL availability)
  // This is a one-time initialization that sets the active renderer
  initRenderPipeline();

  // Step 12: Initialize renderer toggle functionality
  rendererToggle();

  // Step 13: Start the animation loop
  try {
    requestAnimationFrame(animationFrame);
  } catch (e) {
    console.error('[startApp] Failed to start animation loop', e);
  }
  
}

// When loaded as the application entry point, initialize canvas and start.
if (typeof document !== 'undefined') {
  try {
    canvas();
  } catch (e) {
    console.warn('[startApp] canvas init failed', e);
  }
  startApp();
}
