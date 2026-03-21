import { cloneState } from '@engine/state/mesh/cloneState.js';

export function getMeshClone() {
  return cloneState.value;
}
