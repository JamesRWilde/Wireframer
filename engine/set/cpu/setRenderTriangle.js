'use strict';

/**
 * setRenderTriangle - Renders a single triangle with fill and stroke
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Array<number>} tri - Triangle vertex indices [a, b, c]
 * @param {Array<Array<number>>} P2 - 2D projected vertex positions
 * @param {Object} renderOpts - Render options { fillAlpha, edgeColor, wireAlpha }
 * @param {Object} lightingData - Normal and shade color data { shadeColor }
 * @param {string} lastFillStyle - Previous fillStyle (for caching)
 * @returns {string} Updated lastFillStyle
 */
export function setRenderTriangle(ctx, tri, P2, renderOpts, lightingData, lastFillStyle) {
  const { fillAlpha, edgeColor, wireAlpha } = renderOpts;
  const [a, b, c] = tri;
  const ax = P2[a][0], ay = P2[a][1];
  const bx = P2[b][0], by = P2[b][1];
  const cx = P2[c][0], cy = P2[c][1];

  const area2 = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
  if (Math.abs(area2) < 0.2) return lastFillStyle;

  const { shadeColor } = lightingData;

  ctx.beginPath();
  ctx.moveTo(ax, ay);
  ctx.lineTo(bx, by);
  ctx.lineTo(cx, cy);
  ctx.closePath();

  if (fillAlpha > 0.001) {
    ctx.globalAlpha = fillAlpha;
    const fillStyle = `rgb(${shadeColor[0]}, ${shadeColor[1]}, ${shadeColor[2]})`;
    if (fillStyle !== lastFillStyle) {
      ctx.fillStyle = fillStyle;
      lastFillStyle = fillStyle;
    }
    ctx.fill();
  }

  if (wireAlpha > 0.001) {
    ctx.globalAlpha = wireAlpha;
    ctx.strokeStyle = edgeColor;
    ctx.stroke();
  }

  return lastFillStyle;
}
