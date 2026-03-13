import { initCanvas } from '../initCanvas.js';
// import physicsState early so its initialization code runs and sets up
// wx/wy/wz/AUTO_* defaults before the main loop starts.
import '../../physics/physicsState.js';
import { attachInputListeners } from '../../physics/input/attachInputListeners.js';
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
import { initPresetSwatches } from '../../../ui/theme/initPresetSwatches.js';
import { readCustomRgb } from '../../../ui/theme/readCustomRgb.js';
import { setCustomRgb } from '../../../ui/theme/setCustomRgb.js';
import { setThemeMode } from '../../../ui/theme/setThemeMode.js';
import { syncRenderToggles } from '../../../ui/controls/syncRenderToggles.js';
import { restoreUiState } from '../../../ui/controls/restoreUiState.js';
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
  if (typeof globalThis.ZOOM !== 'number' || !isFinite(globalThis.ZOOM)) {
    globalThis.ZOOM = 1.0;
  }
  if (typeof globalThis.ZOOM_MIN !== 'number' || !isFinite(globalThis.ZOOM_MIN)) {
    globalThis.ZOOM_MIN = 0.45;
  }
  if (typeof globalThis.ZOOM_MAX !== 'number' || !isFinite(globalThis.ZOOM_MAX)) {
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

  // restore previous UI state (shape selection, theme, slider values)
  // must happen before initObjectSelector so we can pass the saved shape
  let restoredShapeName = null;
  try {
    restoredShapeName = restoreUiState();
    if (restoredShapeName) {
      console.debug('[startApp] restored UI state, selected shape', restoredShapeName);
    }
  } catch (e) {
    console.warn('[startApp] restoreUiState failed', e);
  }

  initObjectSelector(restoredShapeName);
  // attach pointer listeners to rotate/zoom the model.  the reference
  // engine uses the cpu canvas (#c) because the foreground canvas (#fg) has
  // `pointer-events: none` and cannot receive events.  using the fg canvas
  // earlier broke drag/zoom entirely.
  try {
    const cpuCanvas = document.getElementById('c');
    attachInputListeners(cpuCanvas);
    // if the helper replaced the canvas node, don't change ctx; input lives on
    // cpuCanvas while drawing still happens on fg (via ctx), so no need to
    // update ctx at all.
  } catch (e) {
    console.warn('[startApp] attachInputListeners failed', e);
  }

  // ensure sliders call syncRenderToggles when changed
  try {
    const sliders = [
      {name:'bgDensity',el:bgDensity},
      {name:'bgVelocity',el:bgVelocity},
      {name:'bgOpacity',el:bgOpacity},
      {name:'fillOpacity',el:fillOpacity},
      {name:'wireOpacity',el:wireOpacity},
    ];
    sliders.forEach(({name,el}) => {
      if (!el) console.warn('[startApp] slider missing', name);
      else {
        el.addEventListener('input', () => {
          try { syncRenderToggles(); } catch (e) { console.warn('[startApp] slider syncRenderToggles error', e); }
        });
      }
    });
    // LOD slider needs special handling to trigger decimation
    if (lodSlider) {
      lodSlider.addEventListener('input', () => {
        try {
          syncRenderToggles();
          if (typeof globalThis.setDetailLevel === 'function') {
            globalThis.setDetailLevel(Number(lodSlider.value) / 100);
          }
        } catch (e) { console.warn('[startApp] lodSlider syncRenderToggles error', e); }
      });
    }
    console.debug('[startApp] attached slider listeners', sliders.map(s=>s.name));
  } catch (e) {
    console.warn('[startApp] failed to attach slider listeners', e);
  }
  // initialize render toggles (opacity/density/velocity) from UI
  try {
    console.debug('[startApp] calling syncRenderToggles');
    syncRenderToggles();
    console.debug('[startApp] syncRenderToggles done');
  } catch (e) {
    console.warn('[startApp] syncRenderToggles failed', e);
  }
  // Initialize UI theme controls (populate swatches and apply saved color)
  try {
    initPresetSwatches();
    const saved = readCustomRgb();
    if (saved) setCustomRgb(saved, { persist: false, apply: true });
    // set theme mode from DOM control if present
    if (typeof document !== 'undefined' && document.getElementById('theme-mode')) {
      const tm = document.getElementById('theme-mode');
      setThemeMode(tm.value, { apply: true });
      // listen for changes
      tm.addEventListener('input', () => {
        setThemeMode(tm.value, { apply: true });
        try { persistUiState(); } catch {};
      });
      tm.addEventListener('change', () => tm.dispatchEvent(new Event('input')));
    }
  } catch (e) {
    // Non-critical: keep app running if theme init fails
    // eslint-disable-next-line no-console
    console.warn('Theme init failed', e);
  }
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
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  try {
    initCanvas();
  } catch (e) {
    console.warn('[startApp] initCanvas failed', e);
  }
  startApp();
}


