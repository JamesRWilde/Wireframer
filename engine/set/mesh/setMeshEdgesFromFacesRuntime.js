import { edgesFromFacesRuntimeState } from '@engine/state/mesh/stateEdgesFromFacesRuntimeState.js';

/**
 * Registers the edge extraction function for mesh processing.
 */
export function setMeshEdgesFromFacesRuntime(fn) {
  edgesFromFacesRuntimeState.value = fn;
}
