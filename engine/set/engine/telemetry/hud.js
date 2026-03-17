/**
 * hud.js - Telemetry HUD Updater
 *
 * PURPOSE:
 *   Updates the on-screen telemetry HUD with current performance metrics
 *   (FPS, frame time, physics time, background time, foreground time) at
 *   a throttled UI refresh rate to avoid excessive DOM writes.
 *
 * ARCHITECTURE ROLE:
 *   Called each frame by the render loop. Throttles updates to
 *   TELEMETRY_UI_INTERVAL_MS intervals to reduce DOM manipulation overhead.
 *   Writes computed EMA (exponential moving average) values to DOM elements.
 *
 * DETAILS:
 *   Also reports per-frame fill and wire breakdown from globalThis._perf
 *   accumulator, resetting it after each HUD update.
 */

"use strict";

// Import render loop state and telemetry update interval
import { state, TELEMETRY_UI_INTERVAL_MS }from '@engine/state/engine/loop.js';

// Import stats DOM element references
import {statsState} from '@ui/state/stats.js';

// Import stat writer utility
import { writeStat }from '@ui/set/writeStat.js';

/**
 * hud - Updates the telemetry HUD with current performance metrics
 *
 * @param {number} nowMs - Current timestamp in milliseconds
 * @returns {void}
 */
export function hud(nowMs) {
  // Throttle HUD updates to avoid excessive DOM writes
  if (nowMs - state.telemetryLastUiMs < TELEMETRY_UI_INTERVAL_MS) return;
  state.telemetryLastUiMs = nowMs;

  // Build the stats array with current EMA values
  const stats = [
    { el: statsState.statFps, val: state.emaFpsFrameIntervalMs > 0.0001 ? String(Math.round(1000 / state.emaFpsFrameIntervalMs)) : '--' },
    { el: statsState.statFrameMs, val: state.emaFrameMs > 0 ? state.emaFrameMs.toFixed(2) : '--' },
    { el: statsState.statPhysMs, val: state.emaPhysMs > 0 ? state.emaPhysMs.toFixed(2) : '--' },
    { el: statsState.statBgMs, val: state.emaBgMs > 0 ? state.emaBgMs.toFixed(2) : '--' },
    { el: statsState.statFgMs, val: state.emaFgMs > 0 ? state.emaFgMs.toFixed(2) : '--' },
  ];

  // Append detailed FG breakdown
  if (globalThis._perf && globalThis._perf.frameCount > 0) {
    // GPU mode: fill vs wire
    const avgFill = (globalThis._perf.fillMs / globalThis._perf.frameCount).toFixed(2);
    const avgWire = (globalThis._perf.wireMs / globalThis._perf.frameCount).toFixed(2);
    stats.push({ el: statsState.statFgMs, val: `fill:${avgFill} wire:${avgWire}` });
    globalThis._perf.fillMs = 0;
    globalThis._perf.wireMs = 0;
    globalThis._perf.frameCount = 0;
  } else if (globalThis._CPU_LIGHT_MS > 0) {
    // CPU mode: lighting vs fill vs stroke
    const light = (globalThis._CPU_LIGHT_MS || 0).toFixed(2);
    const fill = (globalThis._CPU_FILL_MS || 0).toFixed(2);
    const stroke = (globalThis._CPU_STROKE_MS || 0).toFixed(2);
    stats.push({ el: statsState.statFgMs, val: `L:${light} F:${fill} S:${stroke}` });
  }

  // Write all stats to their DOM elements
  for (const {el, val} of stats) {
    writeStat(el, val);
  }
}
