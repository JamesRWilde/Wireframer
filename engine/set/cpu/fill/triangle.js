/**
 * fillTriangle.js - Canvas Triangle Filler
 *
 * PURPOSE:
 *   Rasters a single triangle into a 2D canvas context using a fill color and alpha.
 *
 * ARCHITECTURE ROLE:
 *   Low-level rasterization helper used by the fill-render worker to draw
 *   each triangle after lighting and seam expansion.
 *
 * DATA FORMAT:
 *   - tri2d: [[x0,y0], [x1,y1], [x2,y2]] coordinate pairs for triangle vertices
 *   - color: [r,g,b] 0-255 values
 *   - alpha: 0-1 opacity
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Array<[number,number]>} tri2d - Triangle vertices in screen space
 * @param {Array<number>} color - RGB color
 * @param {number} alpha - Alpha value
 */

"use strict";

export function triangle(ctx, tri2d, color, alpha) {
  // Draw a filled path for the triangle.
  ctx.beginPath();
  ctx.moveTo(tri2d[0][0], tri2d[0][1]);
  ctx.lineTo(tri2d[1][0], tri2d[1][1]);
  ctx.lineTo(tri2d[2][0], tri2d[2][1]);
  ctx.closePath();

  // Use rgba so we can apply per-triangle alpha blending.
  ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`;
  ctx.fill();
}
