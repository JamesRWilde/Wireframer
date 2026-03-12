'use strict';

let SCENE_GPU = null;
let SCENE_GPU_FAILED = false;

function getSceneGpuRenderer() {
  if (SCENE_GPU || SCENE_GPU_FAILED) return SCENE_GPU;
  if (!fgCanvas) {
    SCENE_GPU_FAILED = true;
    return null;
  }

  SCENE_GPU = createSceneGpuRenderer(fgCanvas);
  if (!SCENE_GPU) SCENE_GPU_FAILED = true;
  return SCENE_GPU;
}

function disableSceneGpuRenderer(err) {
  if (SCENE_GPU && typeof SCENE_GPU.dispose === 'function') {
    try {
      SCENE_GPU.dispose();
    } catch {
      // Ignore cleanup failures.
    }
  }
  SCENE_GPU = null;
  SCENE_GPU_FAILED = true;
  console.warn('Wireframer: GPU scene renderer disabled, falling back to 2D.', err);
}

function drawGpuSceneModel(model, params) {
  const renderer = getSceneGpuRenderer();
  if (!renderer) return false;

  try {
    // Engine-owned mesh only
    return renderer.renderModel(model, params);
  } catch (err) {
    disableSceneGpuRenderer(err);
    return false;
  }
}

function clearGpuSceneCanvas() {
  const renderer = getSceneGpuRenderer();
  if (!renderer || typeof renderer.clear !== 'function') return;

  try {
    renderer.clear();
  } catch (err) {
    disableSceneGpuRenderer(err);
  }
}
