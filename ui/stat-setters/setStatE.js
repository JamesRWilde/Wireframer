/**
 * setStatE.js - Edge Count Stat Setter
 * 
 * PURPOSE:
 *   Sets the global edge count statistic value.
 *   Used by telemetry system to display mesh complexity.
 * 
 * ARCHITECTURE ROLE:
 *   Called by updateTelemetry to record current model edge count.
 *   Value is displayed in the stats HUD via updateTelemetryHud.
 */

/**
 * setStatE - Sets edge count statistic
 * 
 * @param {number} val - Number of edges in current model
 * 
 * @returns {void}
 */
export function setStatE(val) { globalThis.statE = val; }
