import { morphState } from '@engine/state/mesh/morphState.js';

export function getMorph() {
  return morphState.api;
}

export function getMorphDuration() {
  return morphState.durationMs;
}
