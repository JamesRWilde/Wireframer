/**
 * getMeshEdgesFromFacesRuntime.js - Edge Extraction Function Getter
 *
 * PURPOSE:
 *   Returns the configured edge extraction function, or null if none is set.
 *
 * ARCHITECTURE ROLE:
 *   Part of one-function-per-file getter architecture for mesh utilities.
 *   Used by mesh preprocessing and render path that depends on runtime edge extraction.
 *
 * WHY THIS EXISTS:
 *   Provides a centralized access point for swapping runtime edge extraction
 *   implementations without leaking state variables.
 */

"use strict";

// Import state container that stores runtime edge function reference.
import { edgesFromFacesRuntimeState } from '@engine/state/mesh/stateEdgesFromFacesRuntimeState.js';

/**
 * Returns the configured edge extraction function, or null if not set.
 */
export function getMeshEdgesFromFacesRuntime() {
  return edgesFromFacesRuntimeState.value;
}
