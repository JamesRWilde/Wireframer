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
import { getEdgeColor, getFillOpacity, getWireOpacity }from '@engine/state/render/renderState.js';
let sortZ = null;    // Float32Array of z-depths per triangle
let sortIdx = null;  // Uint32Array of triangle indices

/**
 * sortTrianglesByDepth - Sorts triangle indices by average z-depth (back-to-front)
 *
 * @param {Array<Array<number>>} triFaces - Array of triangle face index arrays [a, b, c]
 * @param {Array<Array<number>>} T - Transformed vertex positions
 * @param {number} triCount - Number of triangles
 */
function sortTrianglesByDepth(triFaces, T, triCount) {
  // Re-allocate sort scratch arrays only if model grew
  if (!sortZ || sortZ.length < triCount) {
    sortZ = new Float32Array(triCount);
    sortIdx = new Uint32Array(triCount);
  }

  // Compute z-depths and fill index array
  for (let i = 0; i < triCount; i++) {
    const tri = triFaces[i];
    sortZ[i] = (T[tri[0]][2] + T[tri[1]][2] + T[tri[2]][2]) / 3;
    sortIdx[i] = i;
  }

  // Sort indices by z-depth (back-to-front)
  sortIdx.subarray(0, triCount).sort((a, b) => sortZ[b] - sortZ[a]);

  return sortIdx;
}

/**
 * renderTriangle - Renders a single triangle with fill and stroke
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Array<number>} tri - Triangle vertex indices [a, b, c]
 * @param {Array<Array<number>>} P2 - 2D projected vertex positions
 * @param {Object} renderOpts - Render options { fillAlpha, edgeColor, wireAlpha }
 * @param {Object} lightingData - Normal and shade color data { shadeColor }
 * @param {string} lastFillStyle - Previous fillStyle (for caching)
 * @returns {string} Updated lastFillStyle
 */
function renderTriangle(ctx, tri, P2, renderOpts, lightingData, lastFillStyle) {
  const { fillAlpha, edgeColor, wireAlpha } = renderOpts;
  const [a, b, c] = tri;
  const ax = P2[a][0], ay = P2[a][1];
  const bx = P2[b][0], by = P2[b][1];
  const cx = P2[c][0], cy = P2[c][1];

  // Skip degenerate triangles
  const area2 = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
  if (Math.abs(area2) < 0.2) return lastFillStyle;

  const { shadeColor } = lightingData;

  ctx.beginPath();
  ctx.moveTo(ax, ay);
  ctx.lineTo(bx, by);
  ctx.lineTo(cx, cy);
  ctx.closePath();

  // Fill phase
  if (fillAlpha > 0.001) {
    ctx.globalAlpha = fillAlpha;
    const fillStyle = `rgb(${shadeColor[0]}, ${shadeColor[1]}, ${shadeColor[2]})`;
    if (fillStyle !== lastFillStyle) {
      ctx.fillStyle = fillStyle;
      lastFillStyle = fillStyle;
    }
    ctx.fill();
  }

  // Stroke phase
  if (wireAlpha > 0.001) {
    ctx.globalAlpha = wireAlpha;
    ctx.strokeStyle = edgeColor;
    ctx.stroke();
  }

  return lastFillStyle;
}

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
  let tLight = 0, tFill = 0, tStroke = 0;

  // Render each triangle in sorted order
  ctx.save();
  ctx.lineWidth = 0.2;
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

  // Store telemetry for HUD
  const sortEntry = performance.getEntriesByName('cpu-sort').at(-1);
  setCpuSortMs(sortEntry?.duration ?? 0);
  setCpuLightMs(tLight);
  setCpuFillMs(tFill);
  setCpuStrokeMs(tStroke);

  // Keep perf entries tidy
  if (performance.getEntriesByName('cpu-sort').length > 30) {
    performance.clearMarks('cpu-sort-start');
    performance.clearMarks('cpu-sort-end');
    performance.clearMeasures('cpu-sort');
  }
}
