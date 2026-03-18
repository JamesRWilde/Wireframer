/**
 * debugFlags.js - Debug Toggle State
 *
 * PURPOSE:
 *   Centralized state for all debug flags. Currently reads from globalThis
 *   (set by UI toggles) — will be converted to proper setters in a future pass.
 *
 * ARCHITECTURE ROLE:
 *   Single import point for debug flags instead of scattering globalThis reads
 *   throughout the codebase. Prepares for eventual UI-driven debug state module.
 */

"use strict";

// Debug flags — read from globalThis (set by UI toggle controls)
// These will be converted to proper state in a future refactor pass
export const DEBUG_LOG_PHYSICS = globalThis.DEBUG_LOG_PHYSICS || false;
export const DEBUG_FORCE_FILL = globalThis.DEBUG_FORCE_FILL || false;
export const DEBUG_FORCE_RED = globalThis.DEBUG_FORCE_RED || false;
export const DEBUG_FORCE_WIRE = globalThis.DEBUG_FORCE_WIRE || false;
export const DEBUG_SHOW_FILL_LAYER = globalThis.DEBUG_SHOW_FILL_LAYER || false;
export const DEBUG_P2_POINTS = globalThis.DEBUG_P2_POINTS || false;
export const DEBUG_CLEAR = globalThis.DEBUG_CLEAR || false;
export const DEBUG_BUDGET = globalThis.DEBUG_BUDGET || false;
export const DEBUG_LOG_TOGGLES = globalThis.DEBUG_LOG_TOGGLES || false;
export const DEBUG_RAF = globalThis.DEBUG_RAF || false;
export const DEBUG_PARTICLES = globalThis.DEBUG_PARTICLES || false;
export const DEBUG_P = globalThis.DEBUG_P || false;
export const DEBUG_LOG_FILL = globalThis.DEBUG_LOG_FILL || false;
