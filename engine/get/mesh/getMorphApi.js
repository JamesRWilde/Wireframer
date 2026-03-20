import { getMorphApi, getMorphDurationMs } from '@engine/state/mesh/morphState.js';

export function getMorph() {
  return getMorphApi();
}

export function getMorphDuration() {
  return getMorphDurationMs();
}
