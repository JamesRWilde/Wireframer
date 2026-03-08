'use strict';

let cpuForegroundDrawnOnMainCanvas = false;
let gpuSceneDrawnLastFrame = false;
let foregroundRenderMode = 'unknown';
// Keep uncapped by default so telemetry reflects actual workload scaling.
const MAX_FPS = 0;
const MIN_FRAME_INTERVAL_MS = MAX_FPS > 0 ? (1000 / MAX_FPS) : 0;
let lastFrameMs = -1;
let telemetryLastUiMs = 0;
const TELEMETRY_UI_INTERVAL_MS = 250;
let lastPresentedFrameMs = -1;
let emaFrameMs = 0;
let emaFpsFrameIntervalMs = 0;
let emaPhysMs = 0;
let emaBgMs = 0;
let emaFgMs = 0;
const TELEMETRY_ALPHA = 0.2;

function updateTelemetryHud(nowMs) {
  if (nowMs - telemetryLastUiMs < TELEMETRY_UI_INTERVAL_MS) return;
  telemetryLastUiMs = nowMs;

  if (statFps) statFps.textContent = emaFpsFrameIntervalMs > 0.0001 ? String(Math.round(1000 / emaFpsFrameIntervalMs)) : '--';
  if (statFrameMs) statFrameMs.textContent = emaFrameMs > 0 ? emaFrameMs.toFixed(2) : '--';
  if (statPhysMs) statPhysMs.textContent = emaPhysMs > 0 ? emaPhysMs.toFixed(2) : '--';
  if (statBgMs) statBgMs.textContent = emaBgMs > 0 ? emaBgMs.toFixed(2) : '--';
  if (statFgMs) statFgMs.textContent = emaFgMs > 0 ? emaFgMs.toFixed(2) : '--';
}

function updateRendererHud(mode) {
  if (!statRenderer) return;
  if (mode === 'gpu') {
    statRenderer.textContent = 'GPU';
  } else if (mode === 'cpu') {
    statRenderer.textContent = 'CPU';
  } else {
    statRenderer.textContent = '--';
  }
}

function resolveForegroundRenderMode() {
  if (foregroundRenderMode !== 'unknown') return foregroundRenderMode;
  const renderer = getSceneGpuRenderer();
  foregroundRenderMode = renderer ? 'gpu' : 'cpu';
  updateRendererHud(foregroundRenderMode);
  return foregroundRenderMode;
}

function fallbackToCpuForegroundMode() {
  foregroundRenderMode = 'cpu';
  updateRendererHud(foregroundRenderMode);
}

function frame(nowMs = 0) {
  requestAnimationFrame(frame);

  const frameStartMs = performance.now();

  if (MIN_FRAME_INTERVAL_MS > 0 && lastFrameMs >= 0 && nowMs - lastFrameMs < MIN_FRAME_INTERVAL_MS) {
    return;
  }
  const frameIntervalMs = lastPresentedFrameMs >= 0 ? (nowMs - lastPresentedFrameMs) : 0;
  lastPresentedFrameMs = nowMs;
  lastFrameMs = nowMs;
  RENDER_FRAME_ID++;

  // Physics
  const physStartMs = performance.now();
  if (HOLD_ROTATION_FRAMES > 0) {
    HOLD_ROTATION_FRAMES--;
  } else {
    applyEulerIncrementInPlace(R, wx, wy, wz);
    if (++frameCount % 120 === 0) R = reorthogonalize(R);

    if (!dragging) {
      wx += (AUTO_WX - wx) * 0.04;
      wy += (AUTO_WY - wy) * 0.04;
      wz += (AUTO_WZ - wz) * 0.04;
    } else {
      wx *= 0.85;
      wy *= 0.85;
    }
  }
  const physMs = performance.now() - physStartMs;

  // Draw
  const bgStartMs = performance.now();
  const backgroundOnSeparateCanvas = drawBackground(nowMs) === true;
  const bgMs = performance.now() - bgStartMs;

  const fgStartMs = performance.now();
  let drewCpuForeground = false;
  const mode = resolveForegroundRenderMode();

  if (MORPH && MORPH.active) {
    const tRaw = Math.max(0, Math.min(1, (nowMs - MORPH.startMs) / MORPH.durationMs));
    const t = easeInOutCubic(tRaw);

    // Proper point-to-point morph: each target-topology vertex moves from a mapped source point.
    const mesh = MORPH.meshModel;
    const fromPts = MORPH.meshFromPts;
    const toPts = MORPH.meshToPts;
    for (let i = 0; i < mesh.V.length; i++) {
      const a = fromPts[i];
      const b = toPts[i];
      const v = mesh.V[i];
      v[0] = a[0] + (b[0] - a[0]) * t;
      v[1] = a[1] + (b[1] - a[1]) * t;
      v[2] = a[2] + (b[2] - a[2]) * t;
    }

    const morphParams = computeFrameParams(mesh.V);
    MODEL_CY = morphParams.cy;
    Z_HALF = morphParams.zHalf;

    // Dynamic geometry requires fresh normals each frame.
    mesh._vertexNormals = null;

    if (mode === 'gpu') {
      const morphGpu = drawGpuSceneModel(mesh, {
        fillAlpha: FILL_OPACITY,
        wireAlpha: WIRE_OPACITY,
        zoom: ZOOM,
        modelCy: MODEL_CY,
        zHalf: Z_HALF,
        rotation: R,
        width: W,
        height: H,
        theme: THEME,
        lightDir: LIGHT_DIR,
        viewDir: VIEW_DIR,
        dynamic: true,
      });

      if (!morphGpu) {
        fallbackToCpuForegroundMode();
      } else {
        if (backgroundOnSeparateCanvas && cpuForegroundDrawnOnMainCanvas) {
          ctx.clearRect(0, 0, W, H);
        }
        gpuSceneDrawnLastFrame = true;
      }
    }

    if (foregroundRenderMode === 'cpu') {
      if (gpuSceneDrawnLastFrame) {
        clearGpuSceneCanvas();
        gpuSceneDrawnLastFrame = false;
      }
      if (backgroundOnSeparateCanvas) ctx.clearRect(0, 0, W, H);
      drewCpuForeground = true;
      drawSolidFillModel(mesh, 1);
      if (WIRE_OPACITY > 0.001) drawWireframeModel(mesh, WIRE_OPACITY);
    }

    finalizeMorphIfDone(tRaw);
  } else {
    let gpuDrawn = false;
    if (mode === 'gpu') {
      gpuDrawn = drawGpuSceneModel(MODEL, {
        fillAlpha: FILL_OPACITY,
        wireAlpha: WIRE_OPACITY,
        zoom: ZOOM,
        modelCy: MODEL_CY,
        zHalf: Z_HALF,
        rotation: R,
        width: W,
        height: H,
        theme: THEME,
        lightDir: LIGHT_DIR,
        viewDir: VIEW_DIR,
      });
      if (!gpuDrawn) fallbackToCpuForegroundMode();
    }

    if (foregroundRenderMode === 'cpu') {
      if (gpuSceneDrawnLastFrame) {
        clearGpuSceneCanvas();
        gpuSceneDrawnLastFrame = false;
      }
      if (backgroundOnSeparateCanvas) ctx.clearRect(0, 0, W, H);
      drewCpuForeground = true;
      drawSolidFillModel(MODEL, 1);
      if (WIRE_OPACITY > 0.001) drawWireframeModel(MODEL, WIRE_OPACITY);
    } else if (backgroundOnSeparateCanvas && cpuForegroundDrawnOnMainCanvas) {
      // Only clear once when switching back to full GPU rendering.
      ctx.clearRect(0, 0, W, H);
      gpuSceneDrawnLastFrame = true;
    } else {
      gpuSceneDrawnLastFrame = true;
    }
  }

  const fgMs = performance.now() - fgStartMs;
  const frameMs = performance.now() - frameStartMs;

  if (emaFrameMs === 0) {
    emaFrameMs = frameMs;
    emaFpsFrameIntervalMs = frameIntervalMs > 0 ? frameIntervalMs : (MIN_FRAME_INTERVAL_MS > 0 ? MIN_FRAME_INTERVAL_MS : 16.67);
    emaPhysMs = physMs;
    emaBgMs = bgMs;
    emaFgMs = fgMs;
  } else {
    const a = TELEMETRY_ALPHA;
    emaFrameMs += (frameMs - emaFrameMs) * a;
    if (frameIntervalMs > 0) {
      emaFpsFrameIntervalMs += (frameIntervalMs - emaFpsFrameIntervalMs) * a;
    }
    emaPhysMs += (physMs - emaPhysMs) * a;
    emaBgMs += (bgMs - emaBgMs) * a;
    emaFgMs += (fgMs - emaFgMs) * a;
  }
  updateTelemetryHud(nowMs);

  cpuForegroundDrawnOnMainCanvas = drewCpuForeground && backgroundOnSeparateCanvas;
}

function startApp() {
  initObjectSelector();
  requestAnimationFrame(frame);
}

const ready = window.WireframeObjectsReady || Promise.resolve();
ready.then(startApp).catch((err) => {
  console.error(err);
  document.getElementById('obj-label').textContent = 'Failed to load objects';
  requestAnimationFrame(frame);
});
