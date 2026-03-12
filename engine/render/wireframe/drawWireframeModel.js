"use strict";

import { getModelFrameData } from '../camera/projection/getModelFrameData.js';
import { rgbA } from '../../../ui/color-utils/rgbA.js';
import { lerpColor } from '../../../ui/color-utils/lerpColor.js';

const DEPTH_BUCKETS = 12;
const buckets = Array.from({ length: DEPTH_BUCKETS }, () => []);

export function drawWireframeModel(model, alphaScale = 1) {
  if (!model?.V?.length) {
    return;
  }
  if (!model?.E?.length) {
    return;
  }
  if (window.DEBUG_FORCE_WIRE) {
    // always draw wire when debug override enabled
  } else {
    if (alphaScale <= 0.001 || globalThis.WIRE_OPACITY <= 0.001) {
      if (!globalThis.__warnedNoWire) {
        globalThis.__warnedNoWire = true;
      }
      return;
    }
  }
  const wireStrength = Math.max(0, Math.min(1, alphaScale));

  // Engine-owned mesh only
  const frameData = getModelFrameData(model);
  if (!frameData) return;
  const T = frameData.T;
  const P2 = frameData.P2;

  for (let i = 0; i < DEPTH_BUCKETS; i++) buckets[i].length = 0;
  // depth bucketing requires Z_HALF; default to 1 if missing
  const zHalf = (typeof globalThis.Z_HALF === 'number' && isFinite(globalThis.Z_HALF)) ? globalThis.Z_HALF : 1;
  for (const edge of model.E) {
    const a = edge[0];
    const b = edge[1];
    const z = (T[a][2] + T[b][2]) * 0.5;
    let t = (zHalf - z) / (zHalf * 2);
    if (!Number.isFinite(t)) t = 0;
    t = Math.max(0, Math.min(0.999, t));
    const idx = Math.floor(t * DEPTH_BUCKETS);
    if (idx >= 0 && idx < DEPTH_BUCKETS) {
      buckets[idx].push(edge);
    }
  }

  const ctx = globalThis.ctx;
  ctx.save();

  const edgeColorA = window.DEBUG_FORCE_RED ? 'rgba(255,0,0,0.5)' : rgbA(globalThis.THEME.wireA, 0.11 * wireStrength);
  const edgeColorB = window.DEBUG_FORCE_RED ? 'rgba(255,0,0,0.8)' : rgbA(globalThis.THEME.wireB, 0.17 * wireStrength);

  ctx.lineWidth = 4.5;
  ctx.strokeStyle = window.DEBUG_FORCE_WIRE ? 'rgba(255,255,255,0.9)' : edgeColorA;
  ctx.beginPath();
  for (const [a, b] of model.E) {
    ctx.moveTo(P2[a][0], P2[a][1]);
    ctx.lineTo(P2[b][0], P2[b][1]);
  }
  ctx.stroke();

  ctx.lineWidth = 1.8;
  ctx.strokeStyle = window.DEBUG_FORCE_WIRE ? 'rgba(255,255,255,0.9)' : edgeColorB;
  ctx.beginPath();
  for (const [a, b] of model.E) {
    ctx.moveTo(P2[a][0], P2[a][1]);
    ctx.lineTo(P2[b][0], P2[b][1]);
  }
  ctx.stroke();
  ctx.restore();

  if (window.DEBUG_EDGE_COUNT) console.log('[drawWireframeModel] edges', model.E.length);

  ctx.lineWidth = 0.82 + 0.3 * wireStrength;
  for (let i = 0; i < DEPTH_BUCKETS; i++) {
    if (!buckets[i].length) continue;
    const t = (i + 0.5) / DEPTH_BUCKETS;
    const edgeAlpha = (0.06 + Math.pow(t, 1.35) * 0.94) * wireStrength;
    const alp = edgeAlpha.toFixed(3);
    // Bias toward brighter depth tones so wireframe remains readable on black.
    const c = lerpColor(globalThis.THEME.wireNear, globalThis.THEME.wireFar, 0.2 + t * 0.8);
    ctx.strokeStyle = `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${alp})`;
    ctx.beginPath();
    for (const [a, bi] of buckets[i]) {
      ctx.moveTo(P2[a][0], P2[a][1]);
      ctx.lineTo(P2[bi][0], P2[bi][1]);
    }
    ctx.stroke();
  }
}
