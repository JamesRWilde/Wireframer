import { setMorphApi, setMorphDurationMs } from '@engine/state/mesh/morphState.js';

export function setMorph(api) {
  setMorphApi(api);
}

export function setMorphDuration(ms) {
  setMorphDurationMs(ms);
}
