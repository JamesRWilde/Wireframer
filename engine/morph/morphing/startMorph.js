import { morphState } from '../morphState.js';
import { cloneMesh } from './cloneMesh.js';

export function startMorph(fromMesh, toMesh, durationMs, onComplete) {
  morphState.active = true;
  morphState.startTime = performance.now();
  morphState.duration = durationMs;
  morphState.fromMesh = cloneMesh(fromMesh);
  morphState.toMesh = cloneMesh(toMesh);
  morphState.currentMesh = cloneMesh(fromMesh);
  morphState.progress = 0;
  morphState.onComplete = typeof onComplete === 'function' ? onComplete : null;
}