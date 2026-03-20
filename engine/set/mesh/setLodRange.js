import { lodRangeState } from '@engine/state/mesh/lodRangeState.js';

export function setLodRange(range) {
  lodRangeState.value = range;
}
