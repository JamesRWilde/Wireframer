import { setGpuEngineClearSceneCanvas } from ''../../gpu/set/setGpuEngineClearSceneCanvas.js'';
import { setCpuEngineRenderMeshUnified } from ''../../cpu/set/setCpuEngineRenderMeshUnified.js'';
import { setCpuEngineCanvasHidden } from ''../../cpu/set/setCpuEngineCanvasHidden.js'';
import { setGpuEngineCanvasHidden } from ''../../gpu/set/setGpuEngineCanvasHidden.js'';
import { setRenderEngineDrawAxes } from ''./setRenderEngineDrawAxes.js'';

export function setRenderEngineCpuPath(meshToRender, backgroundOnSeparateCanvas) {
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
