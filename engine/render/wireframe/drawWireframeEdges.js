/**
 * drawWireframeEdges.js - Wireframe Edge Rendering
 * 
 * PURPOSE:
 *   Draws wireframe edges on a 2D canvas context.
 *   Supports edge filtering and alpha blending for selective rendering.
 * 
 * ARCHITECTURE ROLE:
 *   Called by drawWireframeModel to render edges.
 *   Low-level rendering primitive for wireframe display.
 */

/**
 * drawWireframeEdges - Draws wireframe edges on canvas
 * 
 * @param {Object} params - Rendering parameters
 * @param {Object} params.model - Model with edge array E
 * @param {Array<Array<number>>} params.P2 - Projected 2D vertex positions
 * @param {CanvasRenderingContext2D} params.ctx - 2D canvas context
 * @param {number} params.wireAlpha - Alpha value for edge opacity
 * @param {string} params.edgeColor - CSS color string for edges
 * @param {Function} params.shouldDrawEdge - Filter function for edge visibility
 * 
 * @returns {void}
 * 
 * The function:
 * 1. Sets thin line width for wireframe appearance
 * 2. Iterates through all edges
 * 3. Skips edges filtered by shouldDrawEdge
 * 4. Draws line between projected vertex positions
 */
export function drawWireframeEdges({ model, P2, ctx, wireAlpha, edgeColor, shouldDrawEdge }) {
  // Thin line width for wireframe appearance
  ctx.lineWidth = 0.1;

  // Draw each edge
  for (const edge of model.E) {
    // Skip filtered edges
    if (!shouldDrawEdge(edge)) continue;
    
    // Set alpha and color
    ctx.globalAlpha = wireAlpha;
    ctx.strokeStyle = edgeColor;
    
    // Draw line between projected vertices
    ctx.beginPath();
    ctx.moveTo(P2[edge[0]][0], P2[edge[0]][1]);
    ctx.lineTo(P2[edge[1]][0], P2[edge[1]][1]);
    ctx.stroke();
  }
}
