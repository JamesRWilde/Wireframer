/**
 * setFillTriangleOnLayer.js - Triangle Rasterization
 *
 * PURPOSE:
 *   Fills a single triangle on a 2D canvas context with the specified color.
 *   Handles alpha blending for transparent fill rendering.
 *
 * ARCHITECTURE ROLE:
 *   Called by fill renderer for each visible triangle.
 *   Low-level rasterization primitive for CPU-based fill rendering.
 *
 * WHY THIS EXISTS:
 *   Every filled triangle in the model must be rasterized individually.
 *   This is the lowest-level draw call in the CPU fill pipeline — called
 *   once per visible triangle per frame.
 */

"use strict";

/**
 * setFillTriangleOnLayer - Fills a triangle on the canvas with specified color
 * 
 * @param {CanvasRenderingContext2D} ctx2d - 2D canvas rendering context
 * @param {Array<Array<number>>} tri2d - Triangle vertices [[x1,y1], [x2,y2], [x3,y3]]
 * @param {Array<number>} shadeColor - RGB color [r, g, b] with values 0-255
 * @param {number} [alpha=1] - Optional alpha value (0-1), defaults to fully opaque
 * 
 * @returns {void}
 * 
 * The function:
 * 1. Creates path from triangle vertices
 * 2. Sets fill color with alpha
 * 3. Fills the triangle
 */
export function setFillTriangleOnLayer(ctx2d, tri2d, shadeColor) {
  // Accepts optional alpha as 4th argument (for backwards compatibility)
  let alpha = 1;
  if (arguments.length > 3 && typeof arguments[3] === 'number') {
    alpha = arguments[3];
  }
  
  // Create triangle path
  ctx2d.beginPath();
  ctx2d.moveTo(tri2d[0][0], tri2d[0][1]);
  ctx2d.lineTo(tri2d[1][0], tri2d[1][1]);
  ctx2d.lineTo(tri2d[2][0], tri2d[2][1]);
  ctx2d.closePath();
  
  // Set fill color with alpha and fill
  ctx2d.fillStyle = `rgba(${shadeColor[0]}, ${shadeColor[1]}, ${shadeColor[2]}, ${alpha})`;
  ctx2d.fill();
}
