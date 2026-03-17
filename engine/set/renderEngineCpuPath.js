import { gpuEngineClearSceneCanvas } from '../set/gpuEngineClearSceneCanvas.js';
import { cpuEngineRenderMeshUnified } from '../set/cpuEngineRenderMeshUnified.js';
import { cpuEngineCanvasHidden } from '../set/cpuEngineCanvasHidden.js';
import { gpuEngineCanvasHidden } from '../set/gpuEngineCanvasHidden.js';
import { renderEngineDrawAxes } from './renderEngineDrawAxes.js';

export function renderEngineCpuPath(meshToRender, backgroundOnSeparateCanvas) {
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
