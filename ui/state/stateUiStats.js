/**
 * statsState.js - Telemetry DOM Element Registry (Object Reference Version)
 *
 * PURPOSE:
 *   Exports a single object holding references to DOM elements used for displaying
 *   performance statistics and telemetry data in the UI. No getter/setter abstractions.
 *
 * ARCHITECTURE ROLE:
 *   Allows direct assignment and access to stat display elements from any module
 *   via a single shared object. Used by SetEngineTelemetryHud and stat-setter modules.
 *
 * USAGE:
 *   import { statsState } from './stateUiStats.js';
 *   statsState.statRenderer = document.getElementById('stat-renderer');
 *   statsState.statFps.textContent = '60';
 *
 * NOTE:
 *   All legacy getter/setter functions and named exports have been removed.
 *   Use the statsState object directly for all stat DOM element references.
 */

"use strict";

/**
 * @typedef {Object} StatsState
 * @property {HTMLElement|null} statRenderer - Renderer mode display element
 * @property {HTMLElement|null} statFps - FPS display element
 * @property {HTMLElement|null} statFrameMs - Frame time display element
 * @property {HTMLElement|null} statPhysMs - Physics time display element
 * @property {HTMLElement|null} statBgMs - Background render time display element
 * @property {HTMLElement|null} statFgMs - Foreground render time display element
 * @property {HTMLElement|null} statV - Vertex count display element
 * @property {HTMLElement|null} statE - Edge count display element
 */

/**
 * Shared stats state object for all stat DOM element references.
 * @type {StatsState}
 */
export const statsState = {
	statRenderer: null,
	statFps: null,
	statFrameMs: null,
	statPhysMs: null,
	statBgMs: null,
	statFgMs: null,
	statV: null,
	statE: null
};
