/**
 * collectEdges.js - Edge Collection from Adjacency Graph
 * 
 * PURPOSE:
 *   Extracts a list of unique edges from a vertex adjacency graph. Each edge
 *   is represented as a pair of vertex indices [i, j] where i < j to ensure
 *   uniqueness (no duplicate edges in opposite directions).
 * 
 * ARCHITECTURE ROLE:
 *   Used by LOD algorithms to convert adjacency graphs back to edge lists
 *   after mesh processing. The edge list format is used by the rendering
 *   pipeline for wireframe drawing.
 * 
 * WHY I < J:
 *   By enforcing i < j, we ensure each edge appears only once in the list.
 *   Without this, we'd have both [i,j] and [j,i] for every edge, doubling
 *   the edge count and causing rendering issues.
 */

"use strict";

/**
 * collectEdges - Extracts unique edges from adjacency graph
 * 
 * @param {Array<Set<number>>} adjacency - Vertex adjacency graph
 *   adjacency[i] is a Set of vertices connected to vertex i
 * 
 * @returns {Array<Array<number>>} Array of edge pairs [i, j] where i < j
 *   Each edge appears exactly once in the list
 */
export function collectEdges(adjacency) {
  const edges = [];
  
  // Iterate over all vertices and their neighbors
  adjacency.forEach((neighbors, idx) => {
    neighbors.forEach((neighbor) => {
      // Only add edge if idx < neighbor to avoid duplicates
      // This ensures each edge appears exactly once
      if (idx < neighbor) edges.push([idx, neighbor]);
    });
  });
  
  return edges;
}
