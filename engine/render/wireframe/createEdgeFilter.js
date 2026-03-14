/**
 * createEdgeFilter.js - Edge Filter Factory
 * 
 * PURPOSE:
 *   Creates a filter function that determines which edges to draw based on
 *   their classification (front/back/silhouette) and the requested mode.
 * 
 * ARCHITECTURE ROLE:
 *   Called by drawWireframeModel to create edge filter for selective rendering.
 *   Returns a predicate function used by drawWireframeEdges.
 * 
 * FILTER MODES:
 *   - 'all': Draw all edges (no filtering)
 *   - 'front': Draw front-facing and silhouette edges
 *   - 'back': Draw back-facing and silhouette edges
 */

"use strict";

/**
 * createEdgeFilter - Creates edge filter function for selective rendering
 * 
 * @param {string} mode - Filter mode ('all', 'front', or 'back')
 * @param {Map<string, string>|null} edgeClassification - Edge classification map
 * 
 * @returns {Function} Predicate function that returns true if edge should be drawn
 * 
 * The function:
 * 1. Returns always-true filter if no classification available
 * 2. Creates filter that checks edge classification against mode
 * 3. Silhouette edges are always drawn (visible from both sides)
 */
export function createEdgeFilter(mode, edgeClassification) {
  // No classification: draw all edges
  if (!edgeClassification) return () => true;

  // Create filter function
  return (edge) => {
    // Normalize edge key (lower index first)
    const lo = Math.min(edge[0], edge[1]);
    const hi = Math.max(edge[0], edge[1]);
    const key = `${lo}|${hi}`;
    
    // Get edge classification
    const cls = edgeClassification.get(key);

    // Filter based on mode
    if (mode === 'front') return cls === 'front' || cls === 'silhouette';
    if (mode === 'back') return cls === 'back' || cls === 'silhouette';
    
    // Default: draw all edges
    return true;
  };
}
