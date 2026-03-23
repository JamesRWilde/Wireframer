import { edgesFromFacesRuntimeState } from '@engine/state/mesh/stateEdgesFromFacesRuntimeState.js';

/**
 * Returns the configured edge extraction function, or null if not set.
 */
export function getMeshEdgesFromFacesRuntime() {
  return edgesFromFacesRuntimeState.value;
}
