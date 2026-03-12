import { state, MIN_FRAME_INTERVAL_MS } from './loopState.js';

// Returns frameIntervalMs (number) when frame should run, or null to skip.
export function shouldRunFrame(nowMs) {
  if (MIN_FRAME_INTERVAL_MS > 0 && state.lastFrameMs >= 0 && nowMs - state.lastFrameMs < MIN_FRAME_INTERVAL_MS) return null;
  return state.lastPresentedFrameMs >= 0 ? (nowMs - state.lastPresentedFrameMs) : 0;
}
