"use strict";

import { getModelFrameData } from '../camera/projection/getModelFrameData.js';
import { rgbA } from '../../../ui/color-utils/rgbA.js';
import { relativeLuminance } from '../../../ui/color-utils/relativeLuminance.js';
import { classifyEdges } from './classifyEdges.js';
import { createEdgeFilter } from './createEdgeFilter.js';
import { drawWireframeEdges } from './drawWireframeEdges.js';

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

  let fillRgb = globalThis.THEME?.fill ?? [0, 200, 120];
  const fillLum = relativeLuminance(fillRgb);
  const contrastWire = fillLum > 0.5 ? [0, 0, 0] : [255, 255, 255];

  const edgeColorA = globalThis.DEBUG_FORCE_RED ? 'rgba(255,0,0,0.5)' : rgbA(contrastWire, 1);
  const edgeColorB = globalThis.DEBUG_FORCE_RED ? 'rgba(255,0,0,0.8)' : rgbA(contrastWire, 1);
  const wireAlpha = globalThis.WIRE_OPACITY * wireStrength;

  const edgeClassification = mode === 'front' || mode === 'back' ? classifyEdges(model, T) : null;
  const shouldDrawEdge = createEdgeFilter(mode, edgeClassification);

  drawWireframeEdges({ model, P2, ctx, wireAlpha, edgeColor: globalThis.DEBUG_FORCE_WIRE ? 'rgba(255,255,255,0.9)' : edgeColorA, shouldDrawEdge });
  drawWireframeEdges({ model, P2, ctx, wireAlpha, edgeColor: globalThis.DEBUG_FORCE_WIRE ? 'rgba(255,255,255,0.9)' : edgeColorB, shouldDrawEdge });

  ctx.globalAlpha = 1;
  ctx.restore();

  if (globalThis.DEBUG_EDGE_COUNT) console.log('[drawWireframeModel] edges', model.E.length);
}
