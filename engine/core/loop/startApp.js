import { initCanvas } from '../initCanvas.js';
// import physicsState early so its initialization code runs and sets up
// wx/wy/wz/AUTO_* defaults before the main loop starts.
import '../../physics/physicsState.js';
// bring in loader and mesh loader side-effects (globals) before any mesh operations
import '../../../loader.js';
import '../../mesh/loader/loadMesh.js';
import '../modelState.js';
// expose morph API globally for finalizeModel and renderScene
import '../../morph/initMorphApi.js';
import { initObjectSelector } from '../../../ui/controls/initObjectSelector.js';
import { frame } from './frame.js';
import { initializeRotation } from '../../math/math3d/initializeRotation.js';
import { R } from '../../math/math3d/R.js';
import { syncRenderToggles } from '../../../ui/controls/syncRenderToggles.js';
import { attachSliderListeners } from './attachSliderListeners.js';
import { initThemeControls } from './initThemeControls.js';
import { restoreStateAndAttachInput } from './restoreStateAndAttachInput.js';
import {
  bgDensity,
  bgVelocity,
  bgOpacity,
  fillOpacity,
  wireOpacity,
  lodSlider,
} from '../../../ui/dom-state.js';

export function startApp() {
  // initialize rotation matrix before starting the frame loop
  initializeRotation();
  // ensure zoom parameters exist so scrolling doesn't produce NaN
  if (typeof globalThis.ZOOM !== 'number' || !Number.isFinite(globalThis.ZOOM)) {
    globalThis.ZOOM = 1;
  }
  if (typeof globalThis.ZOOM_MIN !== 'number' || !Number.isFinite(globalThis.ZOOM_MIN)) {
    globalThis.ZOOM_MIN = 0.45;
  }
  if (typeof globalThis.ZOOM_MAX !== 'number' || !Number.isFinite(globalThis.ZOOM_MAX)) {
    globalThis.ZOOM_MAX = 2.75;
  }
  // note: pipeline mirrors referenceCode fill renderer and camera math
  // earlier we pulled directly from referenceCode/engine/core.js and
  // engine/fill/renderer.js to ensure parity with the working implementation.
  // physicsState.js may have already created the object; if not, provide
  // a minimal fallback with sane numeric defaults so the frame loop won't
  // blow up with NaNs.
  if (!globalThis.PHYSICS_STATE) {
    globalThis.PHYSICS_STATE = {
      wx:0, wy:0, wz:0,
      AUTO_WX:0.02, AUTO_WY:0.03, AUTO_WZ:0.005,
      R: null,
      dragging: false,
      HOLD_ROTATION_FRAMES: 0,
    };
  }
  globalThis.PHYSICS_STATE.R = R.value;

  // debug flags have been used heavily during development; disable all
  // of them now that the pipeline is behaving correctly.
  globalThis.DEBUG_FORCE_FILL = false;
  globalThis.DEBUG_FORCE_RED  = false;
  globalThis.DEBUG_FORCE_WIRE = false;
  globalThis.DEBUG_P2_POINTS = false;
  globalThis.DEBUG_SHOW_FILL_LAYER = false;
  globalThis.DEBUG_SHOW_AXES = false;
  globalThis.DEBUG_LOG_PHYSICS = false;
  globalThis.DEBUG_CLEAR = false;

  // ensure opacity sliders start full to avoid blank models
  if (fillOpacity) fillOpacity.value = '100';
  if (wireOpacity) wireOpacity.value = '100';

  // restore UI state (shape selection, theme, slider values) and attach input listeners
  const restoredShapeName = restoreStateAndAttachInput();
  initObjectSelector(restoredShapeName);

  // ensure sliders call syncRenderToggles when changed
  attachSliderListeners([
    { name: 'bgDensity', el: bgDensity },
    { name: 'bgVelocity', el: bgVelocity },
    { name: 'bgOpacity', el: bgOpacity },
    { name: 'fillOpacity', el: fillOpacity },
    { name: 'wireOpacity', el: wireOpacity },
  ], lodSlider, globalThis.setDetailLevel);
  // initialize render toggles (opacity/density/velocity) from UI
  try {
    console.debug('[startApp] calling syncRenderToggles');
    syncRenderToggles();
    console.debug('[startApp] syncRenderToggles done');
  } catch (e) {
    console.warn('[startApp] syncRenderToggles failed', e);
  }
  // Initialize UI theme controls (populate swatches and apply saved color)
  initThemeControls();

  requestAnimationFrame(frame);
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


