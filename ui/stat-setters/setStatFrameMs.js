/**
 * setStatFrameMs.js - Frame Time Stat Setter
 * 
 * PURPOSE:
 *   Sets the global total frame time statistic value.
 *   Used by telemetry system to track overall frame performance.
 * 
 * ARCHITECTURE ROLE:
 *   Called by updateTelemetry to record total frame duration.
 *   Value is displayed in the stats HUD via updateTelemetryHud.
 */

/**
 * setStatFrameMs - Sets total frame time statistic
 * 
 * @param {number} val - Total frame time in milliseconds
 * 
 * @returns {void}
 */
export function setStatFrameMs(val) { globalThis.statFrameMs = val; }
