import { setEdgesFromFacesRuntime } from '@engine/state/mesh/edgesFromFacesRuntimeState.js';

/**
 * Registers the edge extraction function for mesh processing.
 */
export function setMeshEdgesFromFacesRuntime(fn) {
  setEdgesFromFacesRuntime(fn);
}
