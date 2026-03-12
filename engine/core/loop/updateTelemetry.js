import { state, TELEMETRY_ALPHA } from './loopState.js';

export function updateTelemetry(nowMs, frameMs, physMs, bgMs, fgMs, frameIntervalMs) {
  if (state.emaFrameMs === 0) {
    state.emaFrameMs = frameMs;
    let initialFps;
    if (frameIntervalMs > 0) {
      initialFps = frameIntervalMs;
    } else if (typeof TELEMETRY_ALPHA === 'number' && TELEMETRY_ALPHA > 0) {
      initialFps = TELEMETRY_ALPHA; // fallback usage
    } else {
      initialFps = 16.67;
    }
    state.emaFpsFrameIntervalMs = initialFps;
    state.emaPhysMs = physMs;
    state.emaBgMs = bgMs;
    state.emaFgMs = fgMs;
  } else {
    const a = TELEMETRY_ALPHA;
    state.emaFrameMs = state.emaFrameMs + (frameMs - state.emaFrameMs) * a;
    if (frameIntervalMs > 0) state.emaFpsFrameIntervalMs = state.emaFpsFrameIntervalMs + (frameIntervalMs - state.emaFpsFrameIntervalMs) * a;
    state.emaPhysMs = state.emaPhysMs + (physMs - state.emaPhysMs) * a;
    state.emaBgMs = state.emaBgMs + (bgMs - state.emaBgMs) * a;
    state.emaFgMs = state.emaFgMs + (fgMs - state.emaFgMs) * a;
  }
}
