/**
 * edgesFromFacesRuntimeState.js - Mesh Edge Builder State
 *
 * PURPOSE:
 *   Store and expose a pluggable edge extraction function for mesh utils.
 *   Replaces the old edgesFromFacesRuntime usage with module state.
 *
 * ARCHITECTURE ROLE:
 *   Holds the runtime edge extraction implementation used by mesh decimation
 *   and render path selection.
 *
 * WHY THIS EXISTS:
 *   Decouples edge extraction implementation from dependent modules and
 *   supports dynamic updates without reloading all consumers.
 */

"use strict";

export const edgesFromFacesRuntimeState = {
  value: /** @type {function|null} */ (null),
};
