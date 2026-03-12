export function disableSceneGpuRenderer(err) {
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
