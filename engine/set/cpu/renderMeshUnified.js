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

import { frameData }from '@engine/get/render/model/frameData.js';
import { triangles as modelTriangles }from '@engine/get/render/model/triangles.js';
import { shadingMode as getShadingMode }from '@engine/get/cpu/model/shadingMode.js';
import { triCornerNormals as getTriCornerNormals }from '@engine/get/render/model/triCornerNormals.js';
import { triangleNormalCpu as resolveTriangleNormal }from '@engine/get/render/resolve/triangleNormalCpu.js';
import { triangleCpu as computeTriangleShadeColor }from '@engine/get/render/compute/triangleCpu.js';
import { getEdgeColor } from '@engine/get/render/edgeColor.js';
import { getFillOpacity } from '@engine/get/render/fillOpacity.js';
import { getWireOpacity } from '@engine/get/render/wireOpacity.js';
import { renderState } from '@engine/state/render/renderState.js';
import { sortTrianglesByDepth } from '@engine/set/cpu/sortTrianglesByDepth.js';
import { renderTriangle } from '@engine/set/cpu/renderTriangle.js';

/**
 * renderMeshUnified - Renders mesh with per-triangle fill and edges
 *
 * @param {Object} model - Model with V, F, E data
 * @param {CanvasRenderingContext2D} ctx - Canvas context to draw to
 */
export function renderMeshUnified(model, ctx) {
  if (!model?.V?.length || !model?.F?.length || !ctx) return;

  // Get transformed vertices
  const fd = frameData(model);
  if (!fd) return;
  const { T, P2 } = fd;

  // Get triangle faces
  const triFaces = modelTriangles(model);
  if (!triFaces?.length) return;

  // Get shading mode and normals
  const shadingMode = getShadingMode(model, triFaces);
  const useSmoothShading = shadingMode === 'smooth';
  const triCornerNormals = useSmoothShading
    ? getTriCornerNormals(model, triFaces)
    : null;

  // Read cached derived values from renderState
  const fillAlpha = getFillOpacity();
  const wireAlpha = getWireOpacity();
  const edgeColor = getEdgeColor(); // precomputed, cached

  const triCount = triFaces.length;

  // ── Telemetry: sort ──
  performance.mark('cpu-sort-start');
  const sortedIndices = sortTrianglesByDepth(triFaces, T, triCount);
  performance.mark('cpu-sort-end');
  performance.measure('cpu-sort', 'cpu-sort-start', 'cpu-sort-end');

  // ── Telemetry: per-phase timing ──
  let tLight = 0;

  // Render each triangle in sorted order
  ctx.save();
  ctx.lineWidth = Number(renderState.wireWidth || 0.2);
  let lastFillStyle = '';

  for (let si = 0; si < triCount; si++) {
    const triIdx = sortedIndices[si];
    const tri = triFaces[triIdx];

    // ── Lighting phase ──
    let t0 = performance.now();

    // Compute normal for lighting
    const normal = resolveTriangleNormal(tri, triIdx, T, triCornerNormals, useSmoothShading);
    if (!normal) continue;

    // Compute shade color
    const shadeColor = computeTriangleShadeColor(normal, useSmoothShading);

    tLight += performance.now() - t0;

    // ── Render phase ──
    const renderOpts = { fillAlpha, edgeColor, wireAlpha };
    const lightingData = { shadeColor };
    lastFillStyle = renderTriangle(ctx, tri, P2, renderOpts, lightingData, lastFillStyle);
  }

  ctx.globalAlpha = 1;
  ctx.restore();
}
