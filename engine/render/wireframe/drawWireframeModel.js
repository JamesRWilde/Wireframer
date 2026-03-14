/**
 * drawWireframeModel.js - Wireframe Edge Rendering
 *
 * PURPOSE:
 *   Renders the model's wireframe edges on a canvas using 2D drawing APIs.
 *   Used for the wireframe overlay in the CPU rendering path.
 *
 * ARCHITECTURE ROLE:
 *   Called by the CPU renderer and other debug rendering paths. It computes
 *   view-space projection for vertices, classifies edges (front/back), and
 *   draws edges with appropriate styling and alpha blending.
 *
 * DATA FORMAT:
 *   - model: { V: Array<[x,y,z]>, E: Array<[i,j]>, F: Array<[i,j,k]> }
 *   - frameData: { T: Array<[x,y,z]> (transformed vertices), P2: Array<[x,y]> (projected 2D points) }
 *   - Edge classification: Map<string, 'front'|'back'|'both'>
 */

"use strict";

import { getModelFrameData } from '../camera/projection/getModelFrameData.js';
import { rgbA } from '../../../ui/color-utils/rgbA.js';
import { relativeLuminance } from '../../../ui/color-utils/relativeLuminance.js';
import { classifyEdges } from './classifyEdges.js';
import { createEdgeFilter } from './createEdgeFilter.js';
import { drawWireframeEdges } from './drawWireframeEdges.js';

const DEPTH_BUCKETS = 12;
const buckets = Array.from({ length: DEPTH_BUCKETS }, () => []);

/**
 * drawWireframeModel - Draws wireframe edges for a 3D model
 * 
 * @param {Object} model - Model object with vertices V, edges E, faces F
 * @param {number} alphaScale - Alpha multiplier for wire opacity (default 1)
 * @param {CanvasRenderingContext2D} ctxOverride - Optional context to draw to (default: globalThis.ctx)
 * @param {string} mode - Edge filter mode: 'all', 'front', or 'back' (default 'all')
 * @param {Map<string, string>} precomputedClassification - Optional pre-computed edge classification
 *   When provided, skips the expensive classifyEdges() call. This is used when rendering
 *   both front and back edges in sequence to avoid computing classification twice.
 * 
 * @returns {void}
 */
export function drawWireframeModel(model, alphaScale = 1, ctxOverride = null, mode = 'all', precomputedClassification = null) {
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

  // Use pre-computed classification if provided, otherwise compute it
  // This avoids computing classification twice when rendering both front and back edges
  const edgeClassification = mode === 'front' || mode === 'back'
    ? (precomputedClassification || classifyEdges(model, T))
    : null;
  const shouldDrawEdge = createEdgeFilter(mode, edgeClassification);

  drawWireframeEdges({ model, P2, ctx, wireAlpha, edgeColor: globalThis.DEBUG_FORCE_WIRE ? 'rgba(255,255,255,0.9)' : edgeColorA, shouldDrawEdge });
  drawWireframeEdges({ model, P2, ctx, wireAlpha, edgeColor: globalThis.DEBUG_FORCE_WIRE ? 'rgba(255,255,255,0.9)' : edgeColorB, shouldDrawEdge });

  ctx.globalAlpha = 1;
  ctx.restore();

  if (globalThis.DEBUG_EDGE_COUNT) console.log('[drawWireframeModel] edges', model.E.length);
}
