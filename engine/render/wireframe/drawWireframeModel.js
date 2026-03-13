"use strict";

import { getModelFrameData } from '../camera/projection/getModelFrameData.js';
import { rgbA } from '../../../ui/color-utils/rgbA.js';
import { relativeLuminance } from '../../../ui/color-utils/relativeLuminance.js';
import { classifyEdges } from './classifyEdges.js';

const DEPTH_BUCKETS = 12;
const buckets = Array.from({ length: DEPTH_BUCKETS }, () => []);

export function drawWireframeModel(model, alphaScale = 1, ctxOverride = null, mode = 'all') {
  if (!model?.V?.length || !model?.E?.length) return;
  if (alphaScale <= 0.001 || globalThis.WIRE_OPACITY <= 0.001) return;
  const wireStrength = Math.max(0, Math.min(1, alphaScale));
  const frameData = getModelFrameData(model);
  if (!frameData) return;
  const { T, P2 } = frameData;
  const ctx = ctxOverride || globalThis.ctx;
  ctx.save();
  // Compute a high-contrast wireframe color based on the fill color
  let fillRgb = globalThis.THEME?.fill ?? [0, 200, 120];
  let fillLum = relativeLuminance(fillRgb);
  // Use white for dark fills, black for bright fills
  let contrastWire = fillLum > 0.5 ? [0,0,0] : [255,255,255];
  const edgeColorA = globalThis.DEBUG_FORCE_RED ? 'rgba(255,0,0,0.5)' : rgbA(contrastWire, 1);
  const edgeColorB = globalThis.DEBUG_FORCE_RED ? 'rgba(255,0,0,0.8)' : rgbA(contrastWire, 1);
  // Apply both WIRE_OPACITY slider and alphaScale for proper compositing
  const wireAlpha = globalThis.WIRE_OPACITY * wireStrength;

  // Classify edges if mode filtering is needed
  let edgeClassification = null;
  if (mode === 'front' || mode === 'back') {
    edgeClassification = classifyEdges(model, T);
  }

  function shouldDrawEdge(edge) {
    if (!edgeClassification) return true;
    const lo = Math.min(edge[0], edge[1]);
    const hi = Math.max(edge[0], edge[1]);
    const key = `${lo}|${hi}`;
    const cls = edgeClassification.get(key);
    if (mode === 'front') return cls === 'front' || cls === 'silhouette';
    if (mode === 'back') return cls === 'back' || cls === 'silhouette';
    return true;
  }

  ctx.lineWidth = 0.1;
  for (const edge of model.E) {
    if (!shouldDrawEdge(edge)) continue;
    ctx.globalAlpha = wireAlpha;
    ctx.strokeStyle = globalThis.DEBUG_FORCE_WIRE ? 'rgba(255,255,255,0.9)' : edgeColorA;
    ctx.beginPath();
    ctx.moveTo(P2[edge[0]][0], P2[edge[0]][1]);
    ctx.lineTo(P2[edge[1]][0], P2[edge[1]][1]);
    ctx.stroke();
  }
  ctx.lineWidth = 0.1;
  for (const edge of model.E) {
    if (!shouldDrawEdge(edge)) continue;
    ctx.globalAlpha = wireAlpha;
    ctx.strokeStyle = globalThis.DEBUG_FORCE_WIRE ? 'rgba(255,255,255,0.9)' : edgeColorB;
    ctx.beginPath();
    ctx.moveTo(P2[edge[0]][0], P2[edge[0]][1]);
    ctx.lineTo(P2[edge[1]][0], P2[edge[1]][1]);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.restore();
  if (globalThis.DEBUG_EDGE_COUNT) console.log('[drawWireframeModel] edges', model.E.length);
}
