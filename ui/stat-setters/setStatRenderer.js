/**
 * setStatRenderer.js - Renderer Mode Stat Setter
 * 
 * PURPOSE:
 *   Sets the global renderer mode statistic value.
 *   Used by telemetry system to display current rendering backend.
 * 
 * ARCHITECTURE ROLE:
 *   Called by updateTelemetry to record renderer mode (GPU/CPU).
 *   Value is displayed in the stats HUD via updateTelemetryHud.
 */

/**
 * setStatRenderer - Sets renderer mode statistic
 * 
 * @param {string} val - Renderer mode string (e.g., 'gpu', 'cpu')
 * 
 * @returns {void}
 */
export function setStatRenderer(val) { globalThis.statRenderer = val; }
