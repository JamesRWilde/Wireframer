import { initMeshEngineLoadState } from '@engine/state/mesh/initMeshEngineLoadState.js';

export function setInitMeshEngineLoad(fn) {
  initMeshEngineLoadState.value = fn;
}
