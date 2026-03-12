import { state, TELEMETRY_UI_INTERVAL_MS } from './loopState.js';
import { getStatFps, getStatFrameMs, getStatPhysMs, getStatBgMs, getStatFgMs } from '../../../ui/statsState.js';

function writeStat(elem, value) {
  if (!elem) return;
  elem.textContent = value;
}

export function updateTelemetryHud(nowMs) {
  if (nowMs - state.telemetryLastUiMs < TELEMETRY_UI_INTERVAL_MS) return;
  state.telemetryLastUiMs = nowMs;

  const stats = [
    { el: getStatFps(), val: state.emaFpsFrameIntervalMs > 0.0001 ? String(Math.round(1000 / state.emaFpsFrameIntervalMs)) : '--' },
    { el: getStatFrameMs(), val: state.emaFrameMs > 0 ? state.emaFrameMs.toFixed(2) : '--' },
    { el: getStatPhysMs(), val: state.emaPhysMs > 0 ? state.emaPhysMs.toFixed(2) : '--' },
    { el: getStatBgMs(), val: state.emaBgMs > 0 ? state.emaBgMs.toFixed(2) : '--' },
    { el: getStatFgMs(), val: state.emaFgMs > 0 ? state.emaFgMs.toFixed(2) : '--' },
  ];
  // show breakdown when perf data is available
  if (globalThis._perf && globalThis._perf.frameCount > 0) {
    const avgFill = (globalThis._perf.fillMs / globalThis._perf.frameCount).toFixed(2);
    const avgWire = (globalThis._perf.wireMs / globalThis._perf.frameCount).toFixed(2);
    stats.push({ el: getStatFgMs(), val: `fill:${avgFill} wire:${avgWire}` });
    // reset counters for next epoch
    globalThis._perf.fillMs = 0;
    globalThis._perf.wireMs = 0;
    globalThis._perf.frameCount = 0;
  }

  for (const {el, val} of stats) {
    writeStat(el, val);
  }
}
