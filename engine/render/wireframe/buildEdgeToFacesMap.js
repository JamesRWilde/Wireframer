/**
 * buildEdgeToFacesMap.js - Edge-to-Face Mapping
 * 
 * PURPOSE:
 *   Builds a map from edges to the faces that share each edge.
 *   Used for edge classification (front/back/silhouette) in wireframe rendering.
 * 
 * ARCHITECTURE ROLE:
 *   Called by classifyEdges to determine which faces share each edge.
 *   Essential for silhouette edge detection.
 * 
 * EDGE REPRESENTATION:
 *   Edges are stored as "lo|hi" strings where lo < hi to ensure
 *   consistent key regardless of edge direction.
 */

/**
 * buildEdgeToFacesMap - Builds map from edges to their adjacent faces
 * 
 * @param {Array<Array<number>>} triFaces - Array of triangle face indices
 * 
 * @returns {Map<string, Array<number>>} Map from edge key to array of face indices
 * 
 * The function:
 * 1. Iterates through all triangles
 * 2. Extracts three edges from each triangle
 * 3. Normalizes edge key (lower index first)
 * 4. Maps each edge to its adjacent faces
 */
export function buildEdgeToFacesMap(triFaces) {
  const edgeToFaces = new Map();
  
  // Process each triangle
  for (const [fi, tri] of triFaces.entries()) {
    // Extract three edges from triangle
    const edges = [
      [tri[0], tri[1]],
      [tri[1], tri[2]],
      [tri[2], tri[0]],
    ];
    
    // Add each edge to map
    for (const [a, b] of edges) {
      // Normalize edge key (lower index first for consistency)
      const lo = Math.min(a, b);
      const hi = Math.max(a, b);
      const key = `${lo}|${hi}`;
      
      // Add face to edge's face list
      if (!edgeToFaces.has(key)) edgeToFaces.set(key, []);
      edgeToFaces.get(key).push(fi);
    }
  }
  
  return edgeToFaces;
}
