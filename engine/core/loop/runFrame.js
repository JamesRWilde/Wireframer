import { state } from './loopState.js';
import { updatePhysics } from './updatePhysics.js';
import { renderScene } from './renderScene.js';
import { updateTelemetryHud } from './updateTelemetryHud.js';
import { shouldRunFrame } from './shouldRunFrame.js';
import { updateTelemetry } from './updateTelemetry.js';

export function runFrame(nowMs = 0) {
  // entry log removed
  const frameStartMs = performance.now();

  const frameIntervalMs = shouldRunFrame(nowMs);
  if (frameIntervalMs === null) return;
  state.lastPresentedFrameMs = nowMs;
  state.lastFrameMs = nowMs;
  state.RENDER_FRAME_ID++;

  const physMs = updatePhysics();
  // note: we used to guard against zero values here, but that forced the
  // sliders to jump back to opaque when the user dragged them to 0.  The
  // sliders themselves now initialise correctly in startApp, so keep the
  // frame loop pure and allow genuine transparency.
  const { bgMs, fgMs, drewCpuForeground, backgroundOnSeparateCanvas } = renderScene(nowMs);

  const frameMs = performance.now() - frameStartMs;

  updateTelemetry(nowMs, frameMs, physMs, bgMs, fgMs, frameIntervalMs);
  updateTelemetryHud(nowMs);
  globalThis.FRAME_LOOP_STATE.cpuForegroundDrawnOnMainCanvas = drewCpuForeground && backgroundOnSeparateCanvas;
  // exit log removed
}
