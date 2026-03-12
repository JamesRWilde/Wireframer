export function drawGpuSceneModel(model, params) {
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
