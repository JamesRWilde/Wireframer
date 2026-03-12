import { morphState } from '../morphState.js';

export function isMorphing() {
  return morphState.active;
}
