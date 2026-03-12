import { setCpuCanvasHidden } from './setCpuCanvasHidden.js';

export function handleOtherCases(backgroundOnSeparateCanvas, gpuDrawn) {
  const ctx = globalThis.ctx;
  if (backgroundOnSeparateCanvas && globalThis.FRAME_LOOP_STATE.cpuForegroundDrawnOnMainCanvas) {
    // intentionally do not clear the CPU canvas; leave whatever was drawn
    globalThis.FRAME_LOOP_STATE.gpuSceneDrawnLastFrame = true;
  } else {
    globalThis.FRAME_LOOP_STATE.gpuSceneDrawnLastFrame = true;
    // do not hide cpu canvas
  }
}
