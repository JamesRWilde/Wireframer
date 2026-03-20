import { cloneState } from '@engine/state/mesh/cloneState.js';

export function setMeshClone(fn) {
  cloneState.value = fn;
}
