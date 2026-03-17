import { state, TELEMETRY_UI_INTERVAL_MS } from '../loopState.js';
import { statsState } from '../../ui/statsState.js';
import { writeStat } from '../../ui/writeStat.js';

export function setTelemetryHud(nowMs) {
  if (nowMs - state.telemetryLastUiMs < TELEMETRY_UI_INTERVAL_MS) return;
  state.telemetryLastUiMs = nowMs;

  const stats = [
    { el: statsState.statFps, val: state.emaFpsFrameIntervalMs > 0.0001 ? String(Math.round(1000 / state.emaFpsFrameIntervalMs)) : '--' },
    { el: statsState.statFrameMs, val: state.emaFrameMs > 0 ? state.emaFrameMs.toFixed(2) : '--' },
    { el: statsState.statPhysMs, val: state.emaPhysMs > 0 ? state.emaPhysMs.toFixed(2) : '--' },
    { el: statsState.statBgMs, val: state.emaBgMs > 0 ? state.emaBgMs.toFixed(2) : '--' },
    { el: statsState.statFgMs, val: state.emaFgMs > 0 ? state.emaFgMs.toFixed(2) : '--' },
  ];
  
  if (globalThis._perf && globalThis._perf.frameCount > 0) {
    const avgFill = (globalThis._perf.fillMs / globalThis._perf.frameCount).toFixed(2);
    const avgWire = (globalThis._perf.wireMs / globalThis._perf.frameCount).toFixed(2);
    stats.push({ el: statsState.statFgMs, val: `fill:${avgFill} wire:${avgWire}` });
    globalThis._perf.fillMs = 0;
    globalThis._perf.wireMs = 0;
    globalThis._perf.frameCount = 0;
  }

  for (const {el, val} of stats) {
    writeStat(el, val);
  }
}
