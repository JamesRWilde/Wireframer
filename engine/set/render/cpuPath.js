import { sceneCanvas }from '@engine/set/gpu/clear/sceneCanvas.js';
import { renderMeshUnified }from '@engine/set/cpu/renderMeshUnified.js';
import { canvasHidden }from '@engine/set/gpu/canvasHidden.js';
import { axes }from '@engine/set/render/draw/axes.js';

export function cpuPath(meshToRender, backgroundOnSeparateCanvas) {
  const ctx = globalThis.ctx;
  
  canvasHidden(false);
  canvasHidden(true);
  
  if (globalThis.FRAME_LOOP_STATE.gpuSceneDrawnLastFrame) {
    sceneCanvas();
    globalThis.FRAME_LOOP_STATE.gpuSceneDrawnLastFrame = false;
  }
  
  if (ctx) {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, globalThis.W, globalThis.H);
    ctx.restore();
  }
  
  renderMeshUnified(meshToRender, ctx);

  if (globalThis.DEBUG_SHOW_AXES && ctx) {
    axes(ctx);
  }

  return true;
}
