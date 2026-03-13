/**
 * statsState.js - Telemetry DOM Element Registry
 * 
 * PURPOSE:
 *   Manages references to DOM elements used for displaying performance
 *   statistics and telemetry data in the UI.
 * 
 * ARCHITECTURE ROLE:
 *   Provides getter/setter functions for stat display elements.
 *   Used by updateTelemetryHud to update displayed statistics.
 * 
 * STAT ELEMENTS:
 *   - Renderer: Current rendering mode (GPU/CPU)
 *   - FPS: Frames per second
 *   - FrameMs: Total frame time in milliseconds
 *   - PhysMs: Physics update time in milliseconds
 *   - BgMs: Background render time in milliseconds
 *   - FgMs: Foreground render time in milliseconds
 *   - V: Vertex count
 *   - E: Edge count
 */

/** @type {HTMLElement|null} Renderer mode display element */
let _statRenderer = null;

/** @type {HTMLElement|null} FPS display element */
let _statFps = null;

/** @type {HTMLElement|null} Frame time display element */
let _statFrameMs = null;

/** @type {HTMLElement|null} Physics time display element */
let _statPhysMs = null;

/** @type {HTMLElement|null} Background render time display element */
let _statBgMs = null;

/** @type {HTMLElement|null} Foreground render time display element */
let _statFgMs = null;

/** @type {HTMLElement|null} Vertex count display element */
let _statV = null;

/** @type {HTMLElement|null} Edge count display element */
let _statE = null;

// Setter functions for stat DOM elements
/** @param {HTMLElement} el - Renderer stat element */
export function setStatRenderer(el) { _statRenderer = el; }
/** @param {HTMLElement} el - FPS stat element */
export function setStatFps(el) { _statFps = el; }
/** @param {HTMLElement} el - Frame time stat element */
export function setStatFrameMs(el) { _statFrameMs = el; }
/** @param {HTMLElement} el - Physics time stat element */
export function setStatPhysMs(el) { _statPhysMs = el; }
/** @param {HTMLElement} el - Background time stat element */
export function setStatBgMs(el) { _statBgMs = el; }
/** @param {HTMLElement} el - Foreground time stat element */
export function setStatFgMs(el) { _statFgMs = el; }
/** @param {HTMLElement} el - Vertex count stat element */
export function setStatV(el) { _statV = el; }
/** @param {HTMLElement} el - Edge count stat element */
export function setStatE(el) { _statE = el; }

// Getter functions for stat DOM elements
/** @returns {HTMLElement|null} Renderer stat element */
export function getStatRenderer() { return _statRenderer; }
/** @returns {HTMLElement|null} FPS stat element */
export function getStatFps() { return _statFps; }
/** @returns {HTMLElement|null} Frame time stat element */
export function getStatFrameMs() { return _statFrameMs; }
/** @returns {HTMLElement|null} Physics time stat element */
export function getStatPhysMs() { return _statPhysMs; }
/** @returns {HTMLElement|null} Background time stat element */
export function getStatBgMs() { return _statBgMs; }
/** @returns {HTMLElement|null} Foreground time stat element */
export function getStatFgMs() { return _statFgMs; }
/** @returns {HTMLElement|null} Vertex count stat element */
export function getStatV() { return _statV; }
/** @returns {HTMLElement|null} Edge count stat element */
export function getStatE() { return _statE; }
