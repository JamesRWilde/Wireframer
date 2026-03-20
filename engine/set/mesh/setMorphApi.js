import { morphState } from '@engine/state/mesh/morphState.js';

export function setMorph(api) {
  morphState.api = api;
}

export function setMorphDuration(ms) {
  morphState.durationMs = ms;
}
