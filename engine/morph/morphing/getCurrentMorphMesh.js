import { morphState } from '../morphState.js';

export function getCurrentMorphMesh() {
  if (morphState.active) return morphState.currentMesh;
  return null;
}
