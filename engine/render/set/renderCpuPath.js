import { clearGpuSceneCanvas } from '../../gpu/set/clearGpuSceneCanvas.js';
import { renderCpuMeshUnified } from '../../cpu/set/renderCpuMeshUnified.js';
import { setCpuCanvasHidden } from '../../cpu/set/setCpuCanvasHidden.js';
import { setGpuCanvasHidden } from '../../gpu/set/setGpuCanvasHidden.js';
import { drawAxes } from './drawAxes.js';

export function renderCpuPath(meshToRender, backgroundOnSeparateCanvas) {
  const ctx = globalThis.ctx;
  
  setCpuCanvasHidden(false);
  setGpuCanvasHidden(true);
  
  if (globalThis.FRAME_LOOP_STATE.gpuSceneDrawnLastFrame) {
    clearGpuSceneCanvas();
    globalThis.FRAME_LOOP_STATE.gpuSceneDrawnLastFrame = false;
  }
  
  if (ctx) {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, globalThis.W, globalThis.H);
    ctx.restore();
  }
  
  renderCpuMeshUnified(meshToRender, ctx);

  if (globalThis.DEBUG_SHOW_AXES && ctx) {
    drawAxes(ctx);
  }

  return true;
}
