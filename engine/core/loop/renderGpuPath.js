import { drawGpuSceneModel } from '../../render/gpu/runtime/drawGpuSceneModel.js';
import { fallbackToCpuForegroundMode } from './fallbackToCpuForegroundMode.js';
import { setGpuCanvasHidden } from './setGpuCanvasHidden.js';
import { setCpuCanvasHidden } from './setCpuCanvasHidden.js';

export function renderGpuPath(meshToRender, morphing) {
  let gpuDrawn = drawGpuSceneModel(meshToRender, {
    fillAlpha: globalThis.FILL_OPACITY,
    wireAlpha: globalThis.WIRE_OPACITY,
    zoom: globalThis.ZOOM,
    modelCy: globalThis.MODEL_CY,
    zHalf: globalThis.Z_HALF,
    rotation: globalThis.PHYSICS_STATE.R,
    width: globalThis.W,
    height: globalThis.H,
    theme: globalThis.THEME,
    lightDir: globalThis.LIGHT_DIR,
    viewDir: globalThis.VIEW_DIR,
    dynamic: morphing,
  });
  setGpuCanvasHidden(!gpuDrawn);
  setCpuCanvasHidden(gpuDrawn);
  if (!gpuDrawn) fallbackToCpuForegroundMode();
  return gpuDrawn;
}
