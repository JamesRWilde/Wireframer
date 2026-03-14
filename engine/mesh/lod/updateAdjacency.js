/**
 * updateAdjacency.js - Adjacency Graph Update After Edge Collapse
 * 
 * PURPOSE:
 *   Updates the vertex adjacency graph after collapsing an edge between
 *   vertices u and v. All neighbors of v are transferred to u, and v
 *   is removed from the graph.
 * 
 * ARCHITECTURE ROLE:
 *   Used by mesh decimation algorithms to maintain the adjacency graph
 *   as edges are collapsed. The adjacency graph is essential for
 *   efficiently finding edges to collapse and updating connectivity.
 * 
 * HOW IT WORKS:
 *   1. For each neighbor of v (except u):
 *      - Remove v from neighbor's adjacency set
 *      - Add u to neighbor's adjacency set
 *      - Add neighbor to u's adjacency set
 *   2. Clear v's adjacency set (v is removed from the mesh)
 * 
 * WHY UPDATE ADJACENCY:
 *   After collapsing edge (u,v), vertex v no longer exists. All faces
 *   that referenced v now reference u. The adjacency graph must be
 *   updated to reflect this new connectivity.
 */

"use strict";

/**
 * updateAdjacency - Updates adjacency graph after edge collapse
 * 
 * @param {Array<Set<number>>} adjacency - Vertex adjacency graph
 * @param {number} u - Index of vertex that remains (target)
 * @param {number} v - Index of vertex being removed (source)
 * 
 * After this function:
 * - All neighbors of v are now neighbors of u
 * - v's adjacency set is empty (v is removed)
 * - All references to v in other vertices' sets are replaced with u
 */
export function updateAdjacency(adjacency, u, v) {
  // Transfer all neighbors of v to u
  adjacency[v].forEach((neighbor) => {
    // Skip u itself (don't create self-loop)
    if (neighbor !== u) {
      // Remove v from neighbor's adjacency set
      adjacency[neighbor].delete(v);
      // Add u to neighbor's adjacency set
      adjacency[neighbor].add(u);
      // Add neighbor to u's adjacency set
      adjacency[u].add(neighbor);
    }
  });
  
  // Clear v's adjacency set (v is removed from the mesh)
  adjacency[v].clear();
}
