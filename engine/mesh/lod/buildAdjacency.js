/**
 * buildAdjacency.js - Vertex Adjacency Graph Construction
 * 
 * PURPOSE:
 *   Builds an adjacency graph from mesh faces. The adjacency graph represents
 *   which vertices are connected by edges, which is essential for mesh
 *   processing algorithms like decimation and smoothing.
 * 
 * ARCHITECTURE ROLE:
 *   Used by LOD algorithms to understand vertex connectivity. The adjacency
 *   graph enables efficient traversal of the mesh topology.
 * 
 * DATA STRUCTURE:
 *   Returns an array of Sets, where adj[i] contains all vertices connected
 *   to vertex i by an edge. Using Sets provides O(1) lookup and prevents
 *   duplicate entries.
 */

"use strict";

/**
 * buildAdjacency - Builds vertex adjacency graph from faces
 * 
 * @param {Array<Array<number>>} faces - Array of triangle faces [a,b,c]
 * @param {number} vertCount - Total number of vertices in the mesh
 * 
 * @returns {Array<Set<number>>} Adjacency graph
 *   adj[i] is a Set of vertex indices connected to vertex i
 * 
 * For each triangle [a,b,c], we add bidirectional edges:
 * - a <-> b
 * - a <-> c
 * - b <-> c
 */
export function buildAdjacency(faces, vertCount) {
  // Initialize adjacency array with empty Sets
  const adj = new Array(vertCount).fill(0).map(() => new Set());
  
  // Process each triangle face
  for (const [a, b, c] of faces) {
    // Add bidirectional edges for each pair of vertices
    adj[a].add(b); adj[a].add(c);  // a connects to b and c
    adj[b].add(a); adj[b].add(c);  // b connects to a and c
    adj[c].add(a); adj[c].add(b);  // c connects to a and b
  }
  
  return adj;
}
