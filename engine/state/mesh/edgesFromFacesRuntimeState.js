/**
 * edgesFromFacesRuntimeState.js - Mesh Edge Builder State
 *
 * PURPOSE:
 *   Store and expose a pluggable edge extraction function for mesh utils.
 *   Replaces the old `globalThis.edgesFromFacesRuntime` usage with module state.
 */

"use strict";

/** @type {function|null} Runtime edge extraction function */
let _edgesFromFacesRuntime = null;

/** @returns {function|null} Current runtime edge extraction function */
export function getEdgesFromFacesRuntime() {
  return _edgesFromFacesRuntime;
}

/** @param {function|null} fn - New edge extraction function */
export function setEdgesFromFacesRuntime(fn) {
  _edgesFromFacesRuntime = fn;
}
