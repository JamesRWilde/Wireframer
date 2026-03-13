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
 * 
 * PERFORMANCE:
 *   Uses Path2D to batch all edges into a single path, then strokes once.
 *   Previously each edge was drawn individually with its own stroke() call,
 *   which caused excessive canvas state changes (globalAlpha, strokeStyle per edge).
 *   Batching reduces draw calls from O(edges) to O(1).
 */

/**
 * drawWireframeEdges - Draws wireframe edges on canvas using batched Path2D
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
 * 1. Builds a single Path2D containing all visible edges
 * 2. Sets canvas state once (alpha, color, line width)
 * 3. Strokes the entire path in one call
 */
export function drawWireframeEdges({ model, P2, ctx, wireAlpha, edgeColor, shouldDrawEdge }) {
  // Build a single Path2D for all visible edges
  // This batches all edge geometry into one path for efficient rendering
  const path = new Path2D();
  
  // Track if we added any edges to the path
  let hasEdges = false;
  
  // Add each visible edge to the path
  for (const edge of model.E) {
    // Skip filtered edges
    if (!shouldDrawEdge(edge)) continue;
    
    // Add line segment to path
    path.moveTo(P2[edge[0]][0], P2[edge[0]][1]);
    path.lineTo(P2[edge[1]][0], P2[edge[1]][1]);
    hasEdges = true;
  }
  
  // Only stroke if we have edges to draw
  if (hasEdges) {
    // Set canvas state once for all edges
    ctx.globalAlpha = wireAlpha;
    ctx.strokeStyle = edgeColor;
    ctx.lineWidth = 0.1;
    
    // Stroke the entire path in one call
    ctx.stroke(path);
  }
}
