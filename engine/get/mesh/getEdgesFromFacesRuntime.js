import { getEdgesFromFacesRuntime } from '@engine/state/mesh/edgesFromFacesRuntimeState.js';

/**
 * Returns the configured edge extraction function, or null if not set.
 */
export function getMeshEdgesFromFacesRuntime() {
  return getEdgesFromFacesRuntime();
}
