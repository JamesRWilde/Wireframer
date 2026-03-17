/**
 * renderMeshUnified.js - Unified Triangle Renderer
 * 
 * PURPOSE:
 *   Renders a mesh by drawing each triangle with fill and edges in a single pass.
 *   No offscreen canvases, no compositing, no workers. Just triangles with edges.
 * 
 * ARCHITECTURE ROLE:
 *   Replaces the 3-layer compositing approach (fill layer + back wire + front wire)
 *   with a simple per-triangle rendering loop. Each triangle is drawn completely
 *   (fill then edges) before moving to the next.
 * 
 * RENDERING APPROACH:
 *   1. Sort triangles back-to-front (painter's algorithm)
 *   2. For each triangle:
 *      a. Compute shade color using Blinn-Phong lighting
 *      b. Fill triangle with fill opacity
 *      c. Draw triangle edges with wire opacity
 *   3. Done - no compositing needed
 */

"use strict";

import { getModelFrameData } from '../render/getModelFrameData.js';
import { getModelTriangles } from './getModelTriangles.js';
import { getModelShadingMode } from './getModelShadingMode.js';
import { getModelTriCornerNormals } from './getModelTriCornerNormals.js';
import { resolveTriangleNormal } from './resolveTriangleNormal.js';
import { computeTriangleShadeColor } from './computeTriangleShadeColor.js';
import { relativeLuminance } from '../ui/relativeLuminance.js';
import { rgbA } from '../ui/rgbA.js';

/**
 * renderMeshUnified - Renders mesh with per-triangle fill and edges
 * 
 * @param {Object} model - Model with V, F, E data
 * @param {CanvasRenderingContext2D} ctx - Canvas context to draw to
 */
export function renderMeshUnified(model, ctx) {
  if (!model?.V?.length || !model?.F?.length || !ctx) return;

  // Get transformed vertices
  const frameData = getModelFrameData(model);
  if (!frameData) return;
  const { T, P2 } = frameData;

  // Get triangle faces
  const triFaces = getModelTriangles(model);
  if (!triFaces?.length) return;

  // Get shading mode and normals
  const shadingMode = getModelShadingMode(model, triFaces);
  const useSmoothShading = shadingMode === 'smooth';
  const triCornerNormals = useSmoothShading
    ? getModelTriCornerNormals(model, triFaces)
    : null;

  // Get opacities
  const fillAlpha = globalThis.FILL_OPACITY ?? 1;
  const wireAlpha = globalThis.WIRE_OPACITY ?? 1;

  // Get wire color (contrast with fill)
  let fillRgb = globalThis.THEME?.fill ?? [0, 200, 120];
  const fillLum = relativeLuminance(fillRgb);
  const contrastWire = fillLum > 0.5 ? [0, 0, 0] : [255, 255, 255];
  const edgeColor = rgbA(contrastWire, 1);

  // Sort triangles back-to-front (painter's algorithm)
  const triOrder = new Array(triFaces.length);
  for (let i = 0; i < triFaces.length; i++) {
    const tri = triFaces[i];
    triOrder[i] = {
      tri,
      triIndex: i,
      z: (T[tri[0]][2] + T[tri[1]][2] + T[tri[2]][2]) / 3,
    };
  }
  triOrder.sort((a, b) => b.z - a.z);

  // Render each triangle
  ctx.save();
  
  for (const item of triOrder) {
    const [a, b, c] = item.tri;
    const ax = P2[a][0], ay = P2[a][1];
    const bx = P2[b][0], by = P2[b][1];
    const cx = P2[c][0], cy = P2[c][1];

    // Skip degenerate triangles
    const area2 = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
    if (Math.abs(area2) < 0.2) continue;

    // Compute normal for lighting
    const normal = resolveTriangleNormal(item, T, triCornerNormals, useSmoothShading);
    if (!normal) continue;

    // Compute shade color
    const shadeColor = computeTriangleShadeColor(normal, useSmoothShading);

    // Draw triangle path
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.lineTo(cx, cy);
    ctx.closePath();

    // Fill triangle with fill opacity
    if (fillAlpha > 0.001) {
      ctx.globalAlpha = fillAlpha;
      ctx.fillStyle = `rgb(${shadeColor[0]}, ${shadeColor[1]}, ${shadeColor[2]})`;
      ctx.fill();
    }

    // Draw edges with wire opacity
    if (wireAlpha > 0.001) {
      ctx.globalAlpha = wireAlpha;
      ctx.strokeStyle = edgeColor;
      ctx.lineWidth = 0.2;
      ctx.stroke();
    }
  }

  ctx.globalAlpha = 1;
  ctx.restore();
}
