/**
 * setRenderTriangle.js - Render a Single Triangle with Fill and Stroke
 *
 * PURPOSE:
 *   Draws a single triangle onto a canvas context with both fill color
 *   and wireframe stroke. Optimizes fillStyle changes by caching the
 *   previous value to avoid redundant style assignments.
 *
 * ARCHITECTURE ROLE:
 *   Low-level draw primitive called by setRenderMeshUnified for each
 *   visible triangle in the unified rendering path.
 *
 * WHY THIS EXISTS:
 *   The unified renderer needs to draw both fill and wire for each
 *   triangle in one pass. This function combines both operations and
 *   caches the fillStyle string to skip redundant DOM-style writes
 *   when consecutive triangles share the same color.
 */

'use strict';

/**
 * setRenderTriangle - Renders a single triangle with fill and stroke
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas context to draw into
 * @param {Array<number>} tri - Triangle vertex indices [a, b, c]
 * @param {Array<Array<number>>} P2 - 2D projected vertex positions [[x,y], ...]
 * @param {Object} renderOpts - Rendering parameters
 * @param {number} renderOpts.fillAlpha - Fill opacity (0-1)
 * @param {string} renderOpts.edgeColor - Wireframe stroke color (CSS string)
 * @param {number} renderOpts.wireAlpha - Wireframe opacity (0-1)
 * @param {Object} lightingData - Lighting computation results
 * @param {Array<number>} lightingData.shadeColor - RGB fill color [r, g, b] (0-255)
 * @param {string} lastFillStyle - Cached fillStyle from previous triangle (for reuse)
 * @returns {string} Updated lastFillStyle (may be unchanged if color matched)
 */
export function setRenderTriangle(ctx, tri, P2, renderOpts, lightingData, lastFillStyle) {
  const { fillAlpha, edgeColor, wireAlpha } = renderOpts;
  const [a, b, c] = tri;
  const ax = P2[a][0], ay = P2[a][1];
  const bx = P2[b][0], by = P2[b][1];
  const cx = P2[c][0], cy = P2[c][1];

  // Skip degenerate triangles (near-zero area)
  const area2 = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
  if (Math.abs(area2) < 0.2) return lastFillStyle;

  const { shadeColor } = lightingData;

  // Build the triangle path
  ctx.beginPath();
  ctx.moveTo(ax, ay);
  ctx.lineTo(bx, by);
  ctx.lineTo(cx, cy);
  ctx.closePath();

  // Fill with shade color if fill is visible
  if (fillAlpha > 0.001) {
    ctx.globalAlpha = fillAlpha;
    const fillStyle = `rgb(${shadeColor[0]}, ${shadeColor[1]}, ${shadeColor[2]})`;
    // Only update fillStyle if color changed (DOM style write is expensive)
    if (fillStyle !== lastFillStyle) {
      ctx.fillStyle = fillStyle;
      lastFillStyle = fillStyle;
    }
    ctx.fill();
  }

  // Stroke with wire color if wire is visible
  if (wireAlpha > 0.001) {
    ctx.globalAlpha = wireAlpha;
    ctx.strokeStyle = edgeColor;
    ctx.stroke();
  }

  return lastFillStyle;
}
