import { morphState } from '../morphState.js';
import { easeInOut } from './easeInOut.js';
import { interpolateMeshes } from './interpolateMeshes.js';
import { cloneMesh } from './cloneMesh.js';

export function morphStep(nowMs) {
  if (!morphState.active) return;
  const tRaw = Math.min(1, (nowMs - morphState.startTime) / morphState.duration);
  morphState.progress = tRaw;
  const t = easeInOut(tRaw);
  morphState.currentMesh = interpolateMeshes(morphState.fromMesh, morphState.toMesh, t);
  if (tRaw >= 1) {
    morphState.active = false;
    morphState.currentMesh = cloneMesh(morphState.toMesh);
    if (morphState.onComplete) morphState.onComplete();
  }
}