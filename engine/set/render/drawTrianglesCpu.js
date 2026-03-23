/**
 * trianglesCpu.js - CPU Triangle Rasterizer
 *
 * PURPOSE:
 *   Rasterizes a sorted list of 3D triangles onto a 2D canvas context
 *   using CPU-based fill rendering. Handles triangle area culling,
 *   normal-based shading, and optional seam expansion.
 *
 * ARCHITECTURE ROLE:
 *   Called by drawSolidFillModel for synchronous (main-thread) triangle
 *   fill rendering. Operates on pre-sorted triangles from the painter's
 *   algorithm pass.
 */

"use strict";

// Import per-triangle computation helper
import {triangleCpu}from '@engine/get/render/getTriangleCpu.js';

// Import triangle normal resolution helper
import {triangleNormalCpu}from '@engine/get/render/getTriangleNormalCpu.js';

// Import seam expansion helper for gap prevention
import {getSeamCpu}from '@engine/get/render/getSeamCpu.js';

// Import single triangle rasterizer
import {fillTriangleOnLayer}from '@engine/set/cpu/fill/fillTriangleOnLayer.js';

/**
 * trianglesCpu - Rasterizes sorted triangles onto a fill layer canvas
 *
 * @param {Object} params - Rasterization parameters
 * @param {Array<Object>} params.triOrder - Back-to-front sorted triangles { tri, triIndex, z }
 * @param {Array<Array<number>>} params.P2 - 2D projected vertex positions
 * @param {Array<Array<number>>} params.T - 3D transformed vertex positions
 * @param {Array<Array<Array<number>>>|null} params.triCornerNormalsResult - Per-corner normals
 * @param {boolean} params.useSmoothShading - Whether smooth shading is active
 * @param {number} params.seamExpandPx - Seam expansion in pixels (0 = disabled)
 * @param {CanvasRenderingContext2D} params.fillLayerCtx - Canvas context to draw into
 * @param {number} params.fillAlpha - Opacity for fill rendering (0-1)
 * @returns {void}
 */
export function drawTrianglesCpu({
  triOrder,
  P2,
  T,
  triCornerNormalsResult,
  useSmoothShading,
  seamExpandPx,
  fillLayerCtx,
  fillAlpha,
}) {
  for (const item of triOrder) {
    // Extract triangle vertex indices
    const [a, b, c] = item.tri;

    // Get 2D projected positions for each vertex
    const ax = P2[a][0], ay = P2[a][1];
    const bx = P2[b][0], by = P2[b][1];
    const cx = P2[c][0], cy = P2[c][1];

    // Compute signed area * 2 to detect degenerate triangles
    const area2 = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
    if (Math.abs(area2) < 0.2) continue; // Skip degenerate triangles (too small to render)

    // Resolve the triangle normal for lighting
    const normal = resolveTriangleNormal(item.tri, item.triIndex, T, triCornerNormalsResult, useSmoothShading);
    if (!normal) continue;

    // Compute the shaded color from the normal
    const shadeColor = computeTriangleShadeColor(normal, useSmoothShading);

    // Expand triangle vertices to prevent seams between adjacent faces
    const tri2d = expandTriangleForSeam([[ax, ay], [bx, by], [cx, cy]], seamExpandPx);

    // Rasterize the filled triangle onto the canvas
    fillTriangleOnLayer(fillLayerCtx, tri2d, shadeColor, fillAlpha);
  }
}
