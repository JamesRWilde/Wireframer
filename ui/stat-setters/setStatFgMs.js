/**
 * setStatFgMs.js - Foreground Render Time Stat Setter
 * 
 * PURPOSE:
 *   Sets the global foreground render time statistic value.
 *   Used by telemetry system to track foreground rendering performance.
 * 
 * ARCHITECTURE ROLE:
 *   Called by updateTelemetry to record foreground render duration.
 *   Value is displayed in the stats HUD via updateTelemetryHud.
 */

/**
 * setStatFgMs - Sets foreground render time statistic
 * 
 * @param {number} val - Foreground render time in milliseconds
 * 
 * @returns {void}
 */
export function setStatFgMs(val) { globalThis.statFgMs = val; }
