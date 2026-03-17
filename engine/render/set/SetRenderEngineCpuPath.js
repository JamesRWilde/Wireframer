import { SetGpuEngineClearSceneCanvas } from '../../gpu/set/SetGpuEngineClearSceneCanvas.js';
import { SetCpuEngineRenderMeshUnified } from '../../cpu/set/SetCpuEngineRenderMeshUnified.js';
import { SetCpuEngineCanvasHidden } from '../../cpu/set/SetCpuEngineCanvasHidden.js';
import { SetGpuEngineCanvasHidden } from '../../gpu/set/SetGpuEngineCanvasHidden.js';
import { SetRenderEngineDrawAxes } from './SetRenderEngineDrawAxes.js';

export function SetRenderEngineCpuPath(meshToRender, backgroundOnSeparateCanvas) {
  const ctx = globalThis.ctx;
  
  SetCpuEngineCanvasHidden(false);
  SetGpuEngineCanvasHidden(true);
  
  if (globalThis.FRAME_LOOP_STATE.gpuSceneDrawnLastFrame) {
    SetGpuEngineClearSceneCanvas();
    globalThis.FRAME_LOOP_STATE.gpuSceneDrawnLastFrame = false;
  }
  
  if (ctx) {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, globalThis.W, globalThis.H);
    ctx.restore();
  }
  
  SetCpuEngineRenderMeshUnified(meshToRender, ctx);

  if (globalThis.DEBUG_SHOW_AXES && ctx) {
    SetRenderEngineDrawAxes(ctx);
  }

  return true;
}
