/**
 * setStatPhysMs.js - Physics Time Stat Setter
 * 
 * PURPOSE:
 *   Sets the global physics update time statistic value.
 *   Used by telemetry system to track physics simulation performance.
 * 
 * ARCHITECTURE ROLE:
 *   Called by updateTelemetry to record physics update duration.
 *   Value is displayed in the stats HUD via updateTelemetryHud.
 */

/**
 * setStatPhysMs - Sets physics update time statistic
 * 
 * @param {number} val - Physics update time in milliseconds
 * 
 * @returns {void}
 */
export function setStatPhysMs(val) { globalThis.statPhysMs = val; }
