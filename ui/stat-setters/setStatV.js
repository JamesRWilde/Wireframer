/**
 * setStatV.js - Vertex Count Stat Setter
 * 
 * PURPOSE:
 *   Sets the global vertex count statistic value.
 *   Used by telemetry system to display mesh complexity.
 * 
 * ARCHITECTURE ROLE:
 *   Called by updateTelemetry to record current model vertex count.
 *   Value is displayed in the stats HUD via updateTelemetryHud.
 */

/**
 * setStatV - Sets vertex count statistic
 * 
 * @param {number} val - Number of vertices in current model
 * 
 * @returns {void}
 */
export function setStatV(val) { globalThis.statV = val; }
