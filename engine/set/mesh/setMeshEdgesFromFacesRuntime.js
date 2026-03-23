/**
 * setMeshEdgesFromFacesRuntime.js - Set Runtime Edge Extractor
 *
 * PURPOSE:
 *   Stores the callback function that computes mesh edges from face indices
 *   at runtime. Called during mesh engine initialization.
 *
 * ARCHITECTURE ROLE:
 *   Setter for edgesFromFacesRuntimeState.value. The edge extraction logic
 *   lives in the mesh engine; this stores the function pointer for use
 *   when models are loaded or modified at runtime.
 *
 * WHY THIS EXISTS:
 *   Some models (e.g. OBJ imports) don't include edge data. The runtime
 *   edge builder extracts edges from face topology on demand. This setter
 *   registers the function once during initialization so it can be called
 *   whenever a model needs edge computation.
 */

"use strict";

// Import the runtime edge extractor state container
// Holds the callback function for computing edges from face indices
import { edgesFromFacesRuntimeState } from '@engine/state/mesh/stateEdgesFromFacesRuntimeState.js';

/**
 * setMeshEdgesFromFacesRuntime - Stores the runtime edge extraction callback
 * @param {Function} fn - The callback that takes a faces array and returns edges
 */
export function setMeshEdgesFromFacesRuntime(fn) {
  edgesFromFacesRuntimeState.value = fn;
}
