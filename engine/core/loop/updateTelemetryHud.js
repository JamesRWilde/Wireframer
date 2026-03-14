/**
 * updateTelemetryHud.js - Telemetry HUD Display Updates
 * 
 * PURPOSE:
 *   Updates the performance statistics display in the UI. This includes FPS,
 *   frame time, physics time, background render time, and foreground render time.
 *   Updates are throttled to avoid expensive DOM operations every frame.
 * 
 * ARCHITECTURE ROLE:
 *   Called by runFrame() each frame, but only updates the DOM when enough time
 *   has passed since the last update (TELEMETRY_UI_INTERVAL_MS = 250ms).
 *   Reads smoothed EMA values from loopState and writes them to DOM elements.
 * 
 * WHY THROTTLED:
 *   DOM updates are expensive and the stats don't need to update every frame.
 *   Updating 4 times per second (250ms interval) is readable without causing
 *   performance overhead that would skew the very stats we're measuring.
 */

"use strict";

// Import loop state and throttle interval
import { state, TELEMETRY_UI_INTERVAL_MS } from './loopState.js';

// Import DOM element references for stat displays
import { statsState } from '../../../ui/statsState.js';

/**
 * writeStat - Helper to safely update a DOM element's text content
 * 
 * @param {HTMLElement|null} elem - The DOM element to update
 * @param {string} value - The text value to display
 * 
 * Guards against null elements (if the DOM element doesn't exist).
 */
function writeStat(elem, value) {
  if (!elem) return;
  elem.textContent = value;
}

/**
 * updateTelemetryHud - Updates the telemetry display in the UI
 * 
 * @param {number} nowMs - Current timestamp from requestAnimationFrame
 *   Used to determine if enough time has passed to update the display
 * 
 * This function is throttled - it only updates the DOM when at least
 * TELEMETRY_UI_INTERVAL_MS (250ms) has passed since the last update.
 */
export function updateTelemetryHud(nowMs) {
  // Throttle: only update DOM if enough time has passed
  // This prevents expensive DOM operations from skewing performance stats
  if (nowMs - state.telemetryLastUiMs < TELEMETRY_UI_INTERVAL_MS) return;
  
  // Record the time of this update for next frame's throttle check
  state.telemetryLastUiMs = nowMs;

  // Build array of stat updates
  // Each entry has a DOM element and the formatted value to display
  const stats = [
    // FPS: calculated from frame interval (1000ms / interval = frames per second)
    { el: statsState.statFps, val: state.emaFpsFrameIntervalMs > 0.0001 ? String(Math.round(1000 / state.emaFpsFrameIntervalMs)) : '--' },
    { el: statsState.statFrameMs, val: state.emaFrameMs > 0 ? state.emaFrameMs.toFixed(2) : '--' },
    { el: statsState.statPhysMs, val: state.emaPhysMs > 0 ? state.emaPhysMs.toFixed(2) : '--' },
    { el: statsState.statBgMs, val: state.emaBgMs > 0 ? state.emaBgMs.toFixed(2) : '--' },
    { el: statsState.statFgMs, val: state.emaFgMs > 0 ? state.emaFgMs.toFixed(2) : '--' },
  ];
  
  // Show breakdown of foreground time (fill vs wire) when perf data is available
  // This provides more detailed insight into CPU rendering performance
  if (globalThis._perf && globalThis._perf.frameCount > 0) {
    // Calculate average fill and wire times over the measurement period
    const avgFill = (globalThis._perf.fillMs / globalThis._perf.frameCount).toFixed(2);
    const avgWire = (globalThis._perf.wireMs / globalThis._perf.frameCount).toFixed(2);
    
    // Add breakdown stat (overwrites the basic fgMs display)
    stats.push({ el: statsState.statFgMs, val: `fill:${avgFill} wire:${avgWire}` });
    
    // Reset counters for the next measurement epoch
    globalThis._perf.fillMs = 0;
    globalThis._perf.wireMs = 0;
    globalThis._perf.frameCount = 0;
  }

  // Apply all stat updates to the DOM
  for (const {el, val} of stats) {
    writeStat(el, val);
  }
}
