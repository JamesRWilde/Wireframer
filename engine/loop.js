function fallbackToCpuForegroundMode() {
  foregroundRenderMode = 'cpu';
  updateRendererHud(foregroundRenderMode);
}
'use strict';

// All globals declared in globalVars.js

function resolveForegroundRenderMode() {
  if (typeof foregroundRenderMode === 'undefined') foregroundRenderMode = 'unknown';
  if (foregroundRenderMode !== 'unknown') return foregroundRenderMode;
  const renderer = typeof getSceneGpuRenderer === 'function' ? getSceneGpuRenderer() : null;
  foregroundRenderMode = renderer ? 'gpu' : 'cpu';
  updateRendererHud(foregroundRenderMode);
  return foregroundRenderMode;
}

'use strict';

// All globals declared in globalVars.js

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

  function frame(nowMs = 0) {
    requestAnimationFrame(frame);

    const frameStartMs = performance.now();

    if (MIN_FRAME_INTERVAL_MS > 0 && lastFrameMs >= 0 && nowMs - lastFrameMs < MIN_FRAME_INTERVAL_MS) {
      return;
    }
    // Engine-owned mesh only: enforce modular pipeline
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

    // --- Morphing integration ---
    if (window.morph && window.morph.advanceMorphFrame) window.morph.advanceMorphFrame();

    const modeResolved = resolveForegroundRenderMode();
    const mode = MODEL && MODEL._shadingMode === 'flat' ? 'cpu' : modeResolved;

    const setCpuCanvasHidden = (hidden) => {
      if (!ctx || !ctx.canvas) return;
      const displayValue = hidden ? 'none' : 'block';
      if (ctx.canvas.style.display !== displayValue) {
        ctx.canvas.style.display = displayValue;
      }
    };

    const setGpuCanvasHidden = (hidden) => {
      if (!fgCanvas) return;
      const displayValue = hidden ? 'none' : 'block';
      if (fgCanvas.style.display !== displayValue) {
        fgCanvas.style.display = displayValue;
      }
    };

    // If morphing, render the morph mesh; else render MODEL
    const morphing = window.morph && window.morph.isMorphing && window.morph.isMorphing();
    const meshToRender = morphing && window.morph.getCurrentMorphMesh ? window.morph.getCurrentMorphMesh() : MODEL;

    let gpuDrawn = false;
    if (mode === 'gpu') {
      gpuDrawn = drawGpuSceneModel(meshToRender, {
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
        dynamic: morphing,
      });
      setGpuCanvasHidden(!gpuDrawn);
      setCpuCanvasHidden(gpuDrawn);
      if (!gpuDrawn) {
        fallbackToCpuForegroundMode();
      }
    }

    if (mode === 'cpu' || foregroundRenderMode === 'cpu') {
      setCpuCanvasHidden(false);
      setGpuCanvasHidden(true);
      if (gpuSceneDrawnLastFrame) {
        clearGpuSceneCanvas();
        gpuSceneDrawnLastFrame = false;
      }
      if (backgroundOnSeparateCanvas) ctx.clearRect(0, 0, W, H);
      drewCpuForeground = true;
      drawSolidFillModel(meshToRender, 1);
      if (WIRE_OPACITY > 0.001) drawWireframeModel(meshToRender, WIRE_OPACITY);
    } else if (backgroundOnSeparateCanvas && cpuForegroundDrawnOnMainCanvas) {
      ctx.clearRect(0, 0, W, H);
      gpuSceneDrawnLastFrame = true;
    } else {
      gpuSceneDrawnLastFrame = true;
      if (gpuDrawn) {
        setCpuCanvasHidden(true);
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

startApp();
