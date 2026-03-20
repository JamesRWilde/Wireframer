/**
 * debugFlags.js - Debug Toggle State
 *
 * PURPOSE:
 *   Centralized mutable state for all debug flags. Flags default to false
 *   and can be toggled from the browser console:
 *     e.g.  import { setDebugFlag } from '...'
 *           setDebugFlag('RAF', true);
 *
 * ARCHITECTURE ROLE:
 *   Single import point for debug flags. Used by rendering, physics,
 *   quality, and UI modules that include debug logging/visualization.
 *
 * SETTING FLAGS FROM CONSOLE:
 *   import { setDebugFlag, getDebug } from '@engine/state/render/debugFlags.js';
 *   setDebugFlag('RAF', true);
 *   // or check the object directly:
 *   getDebug().RAF = true;
 *
 * FLAGS:
 *   LOG_PHYSICS  - Log physics calculations (rotation, friction, etc.)
 *   FORCE_FILL   - Force fill rendering mode
 *   FORCE_RED    - Force red wireframe colour
 *   FORCE_WIRE   - Force wireframe mode
 *   SHOW_FILL_LAYER - Show the fill layer canvas
 *   P2_POINTS    - Show P2 physics debug points
 *   CLEAR        - Clear canvas each frame
 *   BUDGET       - Log quality budget calculations
 *   LOG_TOGGLES  - Log render toggle changes
 *   RAF          - Log requestAnimationFrame timing
 *   PARTICLES    - Log particle spawning info
 *   P            - General purpose debug flag
 *   LOG_FILL     - Log fill rendering
 */

"use strict";

/**
 * debug - Mutable debug flag state.
 * Set properties directly from browser console after import.
 * All default to false.
 */
export const debug = {
  LOG_PHYSICS: false,
  FORCE_FILL: false,
  FORCE_RED: false,
  FORCE_WIRE: false,
  SHOW_FILL_LAYER: false,
  P2_POINTS: false,
  CLEAR: false,
  BUDGET: false,
  LOG_TOGGLES: false,
  RAF: false,
  PARTICLES: false,
  P: false,
  LOG_FILL: false,
};

// ══════════════════════════════════════════════
// Getters
// ══════════════════════════════════════════════

/** @returns {boolean} Log physics calculations */
export function getDebugLogPhysics() { return debug.LOG_PHYSICS; }

/** @returns {boolean} Force fill rendering */
export function getDebugForceFill() { return debug.FORCE_FILL; }

/** @returns {boolean} Force red wireframe */
export function getDebugForceRed() { return debug.FORCE_RED; }

/** @returns {boolean} Force wireframe mode */
export function getDebugForceWire() { return debug.FORCE_WIRE; }

/** @returns {boolean} Show fill layer canvas */
export function getDebugShowFillLayer() { return debug.SHOW_FILL_LAYER; }

/** @returns {boolean} Show P2 physics debug points */
export function getDebugP2Points() { return debug.P2_POINTS; }

/** @returns {boolean} Clear canvas each frame */
export function getDebugClear() { return debug.CLEAR; }

/** @returns {boolean} Log render toggle changes */
export function getDebugLogToggles() { return debug.LOG_TOGGLES; }

/** @returns {boolean} Log rAF timing */
export function getDebugRaf() { return debug.RAF; }

/** @returns {boolean} Log particle info */
export function getDebugParticles() { return debug.PARTICLES; }

/** @returns {boolean} General purpose flag */
export function getDebugP() { return debug.P; }

/** @returns {boolean} Log fill rendering */
export function getDebugLogFill() { return debug.LOG_FILL; }

// ══════════════════════════════════════════════
// Setters
// ══════════════════════════════════════════════

/**
 * Set a debug flag by key (case-insensitive).
 * @param {string} key - Flag name (e.g., 'RAF', 'BUDGET')
 * @param {boolean} value - New value
 */
export function setDebugFlag(key, value) {
  debug[key.toUpperCase()] = value;
}

// ══════════════════════════════════════════════
// Convenience setters
// ══════════════════════════════════════════════

export function setDebugLogPhysics(v) { debug.LOG_PHYSICS = v; }
export function setDebugForceFill(v) { debug.FORCE_FILL = v; }
export function setDebugForceRed(v) { debug.FORCE_RED = v; }
export function setDebugForceWire(v) { debug.FORCE_WIRE = v; }
export function setDebugShowFillLayer(v) { debug.SHOW_FILL_LAYER = v; }
export function setDebugP2Points(v) { debug.P2_POINTS = v; }
export function setDebugClear(v) { debug.CLEAR = v; }
export function setDebugBudget(v) { debug.BUDGET = v; }
export function setDebugLogToggles(v) { debug.LOG_TOGGLES = v; }
export function setDebugRaf(v) { debug.RAF = v; }
export function setDebugParticles(v) { debug.PARTICLES = v; }
export function setDebugP(v) { debug.P = v; }
export function setDebugLogFill(v) { debug.LOG_FILL = v; }

// ══════════════════════════════════════════════
// CPU Perf Telemetry (per-frame timing, in ms)
// ══════════════════════════════════════════════

/** @type {number} Last frame sort duration (ms) */
let _cpuSortMs = 0;

/** @type {number} Last frame lighting phase duration (ms) */
let _cpuLightMs = 0;

/** @type {number} Last frame fill phase duration (ms) */
let _cpuFillMs = 0;

/** @type {number} Last frame stroke phase duration (ms) */
let _cpuStrokeMs = 0;

/** @returns {number} Last frame sort duration (ms) */
export function getCpuSortMs() { return _cpuSortMs; }

/** @returns {number} Last frame lighting duration (ms) */
export function getCpuLightMs() { return _cpuLightMs; }

/** @returns {number} Last frame fill duration (ms) */
export function getCpuFillMs() { return _cpuFillMs; }

/** @returns {number} Last frame stroke duration (ms) */
export function getCpuStrokeMs() { return _cpuStrokeMs; }

/** @param {number} v - Sort duration (ms) */
export function setCpuSortMs(v) { _cpuSortMs = v; }

/** @param {number} v - Lighting duration (ms) */
export function setCpuLightMs(v) { _cpuLightMs = v; }

/** @param {number} v - Fill duration (ms) */
export function setCpuFillMs(v) { _cpuFillMs = v; }

/** @param {number} v - Stroke duration (ms) */
export function setCpuStrokeMs(v) { _cpuStrokeMs = v; }
