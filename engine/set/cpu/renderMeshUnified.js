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
import { relativeLuminance }from '@ui/get/color/relativeLuminance.js';
import { rgbaString }from '@ui/get/color/rgbaString.js';

// Pre-allocated sort scratch space (reused across frames to avoid per-frame allocation)
let sortZ = null;    // Float32Array of z-depths per triangle
let sortIdx = null;  // Uint32Array of triangle indices

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

  // Cache globals once (avoids repeated globalThis lookups in hot loop)
  const fillAlpha = globalThis.FILL_OPACITY ?? 1;
  const wireAlpha = globalThis.WIRE_OPACITY ?? 1;
  const fillRgb = globalThis.THEME?.fill ?? [0, 200, 120];

  // Pre-compute edge color (contrast with fill)
  const fillLum = relativeLuminance(fillRgb);
  const contrastWire = fillLum > 0.5 ? [0, 0, 0] : [255, 255, 255];
  const edgeColor = rgbaString(contrastWire, 1);

  const triCount = triFaces.length;

  // Re-allocate sort scratch arrays only if model grew
  if (!sortZ || sortZ.length < triCount) {
    sortZ = new Float32Array(triCount);
    sortIdx = new Uint32Array(triCount);
  }

  // ── Telemetry: sort ──
  performance.mark('cpu-sort-start');

  // Compute z-depths and fill index array
  for (let i = 0; i < triCount; i++) {
    const tri = triFaces[i];
    sortZ[i] = (T[tri[0]][2] + T[tri[1]][2] + T[tri[2]][2]) / 3;
    sortIdx[i] = i;
  }

  // Sort indices by z-depth (back-to-front) without allocating objects
  sortIdx.subarray(0, triCount).sort((a, b) => sortZ[b] - sortZ[a]);

  performance.mark('cpu-sort-end');
  performance.measure('cpu-sort', 'cpu-sort-start', 'cpu-sort-end');

  // ── Telemetry: per-phase timing ──
  let tLight = 0, tFill = 0, tStroke = 0;

  // Path2D for batched edge strokes (all edges drawn in one stroke() call)
  const wirePath = wireAlpha > 0.001 ? new Path2D() : null;

  // Render each triangle in sorted order
  ctx.save();
  ctx.lineWidth = 0.2;

  // Cache fillStyle to avoid redundant string creation
  let lastFillStyle = '';

  for (let si = 0; si < triCount; si++) {
    const triIdx = sortIdx[si];
    const tri = triFaces[triIdx];
    const [a, b, c] = tri;
    const ax = P2[a][0], ay = P2[a][1];
    const bx = P2[b][0], by = P2[b][1];
    const cx = P2[c][0], cy = P2[c][1];

    // Skip degenerate triangles
    const area2 = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
    if (Math.abs(area2) < 0.2) continue;

    // ── Lighting phase ──
    let t0 = performance.now();

    // Compute normal for lighting
    const normal = resolveTriangleNormal(tri, triIdx, T, triCornerNormals, useSmoothShading);
    if (!normal) continue;

    // Compute shade color
    const shadeColor = computeTriangleShadeColor(normal, useSmoothShading);

    tLight += performance.now() - t0;

    // ── Canvas fill phase ──
    t0 = performance.now();

    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.lineTo(cx, cy);
    ctx.closePath();

    if (fillAlpha > 0.001) {
      ctx.globalAlpha = fillAlpha;
      // Only update fillStyle if color actually changed
      const fillStyle = `rgb(${shadeColor[0]}, ${shadeColor[1]}, ${shadeColor[2]})`;
      if (fillStyle !== lastFillStyle) {
        ctx.fillStyle = fillStyle;
        lastFillStyle = fillStyle;
      }
      ctx.fill();
    }

    tFill += performance.now() - t0;

    // ── Edge accumulation (stroked later in one batch) ──
    if (wirePath) {
      t0 = performance.now();
      wirePath.moveTo(ax, ay);
      wirePath.lineTo(bx, by);
      wirePath.lineTo(cx, cy);
      wirePath.closePath();
      tStroke += performance.now() - t0;
    }
  }

  // ── Batch stroke: draw all edges in one call ──
  if (wirePath && wireAlpha > 0.001) {
    const t0 = performance.now();
    ctx.globalAlpha = wireAlpha;
    ctx.strokeStyle = edgeColor;
    ctx.stroke(wirePath);
    tStroke += performance.now() - t0;
  }

  ctx.globalAlpha = 1;
  ctx.restore();

  // Store telemetry for HUD
  const sortEntry = performance.getEntriesByName('cpu-sort').at(-1);
  globalThis._CPU_SORT_MS = sortEntry?.duration ?? 0;
  globalThis._CPU_LIGHT_MS = tLight;
  globalThis._CPU_FILL_MS = tFill;
  globalThis._CPU_STROKE_MS = tStroke;

  // Keep perf entries tidy
  if (performance.getEntriesByName('cpu-sort').length > 30) {
    performance.clearMarks('cpu-sort-start');
    performance.clearMarks('cpu-sort-end');
    performance.clearMeasures('cpu-sort');
  }
}
