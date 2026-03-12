import { morphState } from '../morphState.js';

export function stopMorph() {
  morphState.active = false;
  morphState.currentMesh = null;
}