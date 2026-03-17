import { sceneRenderer } from '@engine/get/gpu/sceneRenderer.js';
import { sceneCanvas }from '@engine/set/gpu/clear/sceneCanvas.js';
import { renderMeshUnified }from '@engine/set/cpu/renderMeshUnified.js';
import { canvasCpuHidden }from '@engine/set/cpu/canvasCpuHidden.js';
import { canvasHidden }from '@engine/set/gpu/canvasHidden.js';
import { axes }from '@engine/set/render/draw/axes.js';

export function cpuPath(meshToRender, backgroundOnSeparateCanvas) {
  const ctx = globalThis.ctx;
  
  // Show CPU canvas, hide GPU canvas (matching original renderCpuPath)
  canvasCpuHidden(false);
  canvasHidden(true);
  
  if (globalThis.FRAME_LOOP_STATE.gpuSceneDrawnLastFrame) {
    const _r = sceneRenderer(); if (_r?.gl) sceneCanvas(_r.gl, globalThis.gpuCanvas);
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
