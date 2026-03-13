/**
 * setStatBgMs.js - Background Render Time Stat Setter
 * 
 * PURPOSE:
 *   Sets the global background render time statistic value.
 *   Used by telemetry system to track background rendering performance.
 * 
 * ARCHITECTURE ROLE:
 *   Called by updateTelemetry to record background render duration.
 *   Value is displayed in the stats HUD via updateTelemetryHud.
 */

/**
 * setStatBgMs - Sets background render time statistic
 * 
 * @param {number} val - Background render time in milliseconds
 * 
 * @returns {void}
 */
export function setStatBgMs(val) { globalThis.statBgMs = val; }
