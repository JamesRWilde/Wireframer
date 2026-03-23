/**
 * edgesFromFacesRuntimeState.js - Mesh Edge Builder State
 *
 * PURPOSE:
 *   Store and expose a pluggable edge extraction function for mesh utils.
 *   Replaces the old edgesFromFacesRuntime usage with module state.
 */

"use strict";

export const edgesFromFacesRuntimeState = {
  value: /** @type {function|null} */ (null),
};
