/**
 * setStatFps.js - FPS Stat Setter
 * 
 * PURPOSE:
 *   Sets the global frames-per-second statistic value.
 *   Used by telemetry system to track rendering performance.
 * 
 * ARCHITECTURE ROLE:
 *   Called by updateTelemetry to record current FPS.
 *   Value is displayed in the stats HUD via updateTelemetryHud.
 */

/**
 * setStatFps - Sets FPS statistic
 * 
 * @param {number} val - Current frames per second
 * 
 * @returns {void}
 */
export function setStatFps(val) { globalThis.statFps = val; }
