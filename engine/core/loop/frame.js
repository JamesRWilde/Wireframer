import { runFrame } from './runFrame.js';

// initialize shared frame flags
if (!globalThis.FRAME_LOOP_STATE) globalThis.FRAME_LOOP_STATE = { gpuSceneDrawnLastFrame: false, cpuForegroundDrawnOnMainCanvas: false };
let __lastRafMs = 0;
export function frame(nowMs = 0) {
  if (__lastRafMs) {
    const diff = nowMs - __lastRafMs;
    if (window.DEBUG_RAF) console.log('[frame] rAF interval', diff.toFixed(2));
  }
  __lastRafMs = nowMs;
  requestAnimationFrame(frame);
  return runFrame(nowMs);
}
