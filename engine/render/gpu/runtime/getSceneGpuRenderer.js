let SCENE_GPU = null;
let SCENE_GPU_FAILED = false;

export function getSceneGpuRenderer() {
  if (SCENE_GPU || SCENE_GPU_FAILED) return SCENE_GPU;
  const fg = globalThis.fgCanvas;
  if (!fg) {
    SCENE_GPU_FAILED = true;
    return null;
  }

  SCENE_GPU = createSceneGpuRenderer(fg);
  if (!SCENE_GPU) SCENE_GPU_FAILED = true;
  return SCENE_GPU;
}
