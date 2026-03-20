/**
 * morphState.js - Morph pipeline state storage
 *
 * PURPOSE:
 *   Holds the runtime morph API handlers and duration configuration.
 *   Replaces globalThis.morph and globalThis.MORPH_DURATION_MS usage.
 */

"use strict";

/** @type {Object|null} Morph API object containing startMorph, advanceMorphFrame, currentMorph, isMorphing */
let _morphApi = null;

/** @type {number} Morph duration in milliseconds */
let _morphDurationMs = 1600;

export function getMorphApi() { return _morphApi; }
export function setMorphApi(api) { _morphApi = api; }

export function getMorphDurationMs() { return _morphDurationMs; }
export function setMorphDurationMs(ms) { _morphDurationMs = ms; }
