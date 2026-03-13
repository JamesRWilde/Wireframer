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
 * 
 * INITIALIZATION ORDER:
 *   1. Canvas setup (initCanvas)
 *   2. Physics state (physicsState.js import)
 *   3. Mesh loader (loader.js, loadMesh.js imports)
 *   4. Model state (modelState.js import)
 *   5. Morph API (initMorphApi.js import)
 *   6. Rotation matrix initialization
 *   7. Zoom parameter defaults
 *   8. Physics state fallback
 *   9. Debug flag defaults
 *   10. UI state restoration and input listeners
 *   11. Object selector initialization
 *   12. Slider listener attachment
 *   13. Render toggle synchronization
 *   14. Theme control initialization
 *   15. Animation loop start
 */

// Import canvas initialization - sets up all canvas elements and resize handling
import { initCanvas } from '../initCanvas.js';

// Import physics state early so its initialization code runs and sets up
// wx/wy/wz/AUTO_* defaults before the main loop starts
import '../../physics/physicsState.js';

// Bring in loader and mesh loader side-effects (globals) before any mesh operations
// These set up globalThis.loadObjMesh and globalThis.loadMesh
import '../../../loader.js';
import '../../mesh/loader/loadMesh.js';

// Import model state to make setActiveModel available globally
import '../modelState.js';

// Expose morph API globally for finalizeModel and renderScene
import '../../morph/initMorphApi.js';

// Import UI initialization functions
import { initObjectSelector } from '../../../ui/controls/initObjectSelector.js';

// Import the frame loop entry point
import { frame } from './frame.js';

// Import rotation matrix initialization
import { initializeRotation } from '../../math/math3d/initializeRotation.js';

// Import the rotation matrix reference
import { R } from '../../math/math3d/R.js';

// Import render toggle synchronization
import { syncRenderToggles } from '../../../ui/controls/syncRenderToggles.js';

// Import slider listener attachment
import { attachSliderListeners } from './attachSliderListeners.js';

// Import theme control initialization
import { initThemeControls } from './initThemeControls.js';

// Import UI state restoration and input listener attachment
import { restoreStateAndAttachInput } from './restoreStateAndAttachInput.js';

// Import DOM element references for sliders
import {
  bgDensity,
  bgVelocity,
  bgOpacity,
  fillOpacity,
  wireOpacity,
  lodSlider,
} from '../../../ui/dom-state.js';

/**
 * startApp - Initializes all subsystems and starts the animation loop
 * 
 * This function is called once when the application loads. It performs all
 * initialization in the correct order and then starts the animation loop
 * via requestAnimationFrame(frame).
 */
export function startApp() {
  // Step 1: Initialize rotation matrix before starting the frame loop
  // This sets up the initial orientation (typically identity or slight tilt)
  initializeRotation();
  
  // Step 2: Ensure zoom parameters exist with sensible defaults
  // These guards prevent NaN errors if the user scrolls before values are set
  if (typeof globalThis.ZOOM !== 'number' || !Number.isFinite(globalThis.ZOOM)) {
    globalThis.ZOOM = 1;  // Default zoom level (1 = no zoom)
  }
  if (typeof globalThis.ZOOM_MIN !== 'number' || !Number.isFinite(globalThis.ZOOM_MIN)) {
    globalThis.ZOOM_MIN = 0.45;  // Minimum zoom (zoomed out)
  }
  if (typeof globalThis.ZOOM_MAX !== 'number' || !Number.isFinite(globalThis.ZOOM_MAX)) {
    globalThis.ZOOM_MAX = 2.75;  // Maximum zoom (zoomed in)
  }
  
  // Step 3: Ensure PHYSICS_STATE exists with fallback defaults
  // physicsState.js may have already created this object; if not, provide
  // a minimal fallback with sane numeric defaults so the frame loop won't
  // blow up with NaNs
  if (!globalThis.PHYSICS_STATE) {
    globalThis.PHYSICS_STATE = {
      wx:0, wy:0, wz:0,           // Angular velocities (initially zero)
      AUTO_WX:0.02, AUTO_WY:0.03, AUTO_WZ:0.005,  // Auto-rotation targets
      R: null,                      // Rotation matrix (set below)
      dragging: false,              // Whether user is currently dragging
      HOLD_ROTATION_FRAMES: 0,      // Frames to pause rotation (for interaction)
    };
  }
  // Set the rotation matrix reference
  globalThis.PHYSICS_STATE.R = R.value;

  // Step 4: Disable all debug flags
  // These were used heavily during development but should be off in production
  globalThis.DEBUG_FORCE_FILL = false;
  globalThis.DEBUG_FORCE_RED  = false;
  globalThis.DEBUG_FORCE_WIRE = false;
  globalThis.DEBUG_P2_POINTS = false;
  globalThis.DEBUG_SHOW_FILL_LAYER = false;
  globalThis.DEBUG_SHOW_AXES = false;
  globalThis.DEBUG_LOG_PHYSICS = false;
  globalThis.DEBUG_CLEAR = false;

  // Step 5: Ensure opacity sliders start at full opacity
  // This prevents the model from appearing invisible on first load
  if (fillOpacity) fillOpacity.value = '100';
  if (wireOpacity) wireOpacity.value = '100';

  // Step 6: Restore UI state and attach input listeners
  // This reads saved shape, theme, and slider values from localStorage
  // and sets up mouse/touch handlers for rotation and zoom
  const restoredShapeName = restoreStateAndAttachInput();
  
  // Step 7: Initialize the object selector with the restored shape
  // This populates the shape dropdown and selects the saved shape (if any)
  initObjectSelector(restoredShapeName);

  // Step 8: Attach slider listeners for all UI controls
  // Each slider gets an input event handler that updates render parameters
  attachSliderListeners([
    { name: 'bgDensity', el: bgDensity },
    { name: 'bgVelocity', el: bgVelocity },
    { name: 'bgOpacity', el: bgOpacity },
    { name: 'fillOpacity', el: fillOpacity },
    { name: 'wireOpacity', el: wireOpacity },
  ], lodSlider, globalThis.setDetailLevel);
  
  // Step 9: Initialize render toggles from UI state
  // This reads current slider values and updates global render parameters
  try {
    console.debug('[startApp] calling syncRenderToggles');
    syncRenderToggles();
    console.debug('[startApp] syncRenderToggles done');
  } catch (e) {
    console.warn('[startApp] syncRenderToggles failed', e);
  }
  
  // Step 10: Initialize UI theme controls
  // This creates preset swatches and applies saved custom colors
  initThemeControls();

  // Step 11: Start the animation loop
  // This kicks off requestAnimationFrame which will call frame() repeatedly
  requestAnimationFrame(frame);
  
  // Debug log showing which flags are enabled
  console.debug('[startApp] debug flags', {
    FORCE_FILL: globalThis.DEBUG_FORCE_FILL,
    FORCE_RED: globalThis.DEBUG_FORCE_RED,
    FORCE_WIRE: globalThis.DEBUG_FORCE_WIRE,
    SHOW_AXES: globalThis.DEBUG_SHOW_AXES,
    CLEAR: globalThis.DEBUG_CLEAR,
  });
}

// When loaded as the application entry point, initialize canvas and start.
if (typeof document !== 'undefined') {
  try {
    initCanvas();
  } catch (e) {
    console.warn('[startApp] initCanvas failed', e);
  }
  startApp();
}


