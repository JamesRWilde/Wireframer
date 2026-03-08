'use strict';

let cpuForegroundDrawnOnMainCanvas = false;
let gpuSceneDrawnLastFrame = false;
let foregroundRenderMode = 'unknown';

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

  // Physics
  if (HOLD_ROTATION_FRAMES > 0) {
    HOLD_ROTATION_FRAMES--;
  } else {
    R = mmul(mry(wy), mmul(mrx(wx), mmul(mrz(wz), R)));
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

  // Draw
  const backgroundOnSeparateCanvas = drawBackground(nowMs) === true;
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
