import { easeInOutCubic } from './easeInOutCubic.js';

export function getMorphNowVertices(nowMs) {
  if (!window.morph || !window.morph.active) return [];
  const tRaw = Math.max(0, Math.min(1, (nowMs - window.morph.startTime) / window.morph.duration));
  const t = easeInOutCubic(tRaw);
  const V = new Array(window.morph.sampleCount);
  for (let i = 0; i < window.morph.sampleCount; i++) {
    const a = window.morph.fromPts[i];
    const b = window.morph.toPts[i];
    V[i] = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  }
  return V;
}
