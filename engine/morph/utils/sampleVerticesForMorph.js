/**
 * sampleVerticesForMorph.js - Random Vertex Sampling for Morphing
 * 
 * PURPOSE:
 *   Randomly samples a subset of vertices from a mesh for use in morphing.
 *   When meshes have different vertex counts, we sample a fixed number of
 *   points from each to create corresponding point sets for interpolation.
 * 
 * ARCHITECTURE ROLE:
 *   Used during morph preparation to create point sets that can be
 *   interpolated between source and target meshes. Sampling reduces
 *   the number of points to a manageable count for real-time morphing.
 * 
 * WHY RANDOM SAMPLING:
 *   Random sampling provides a representative subset of the mesh's
 *   geometry without bias toward any particular region. This works
 *   well for most mesh pairs and is simple to implement.
 * 
 * WHY LIMIT COUNT:
 *   Morphing requires interpolating every point each frame. Limiting
 *   the sample count ensures real-time performance even for complex meshes.
 */

/**
 * sampleVerticesForMorph - Randomly samples vertices from a mesh
 * 
 * @param {Array<Array<number>>} vertices - Full vertex array
 * @param {number} count - Number of vertices to sample
 * 
 * @returns {Array<Array<number>>} Sampled vertex positions
 *   Returns full array if count >= vertex count
 *   Otherwise returns random subset of specified size
 */
export function sampleVerticesForMorph(vertices, count) {
  const n = vertices.length;
  
  // If requested count >= available vertices, return copy of full array
  if (count >= n) return vertices.slice();
  
  // Random sampling without replacement
  const result = [];
  const used = new Set();  // Track used indices to avoid duplicates
  
  while (result.length < count) {
    // Generate random index
    const idx = Math.floor(Math.random() * n);
    
    // Add if not already used
    if (!used.has(idx)) {
      used.add(idx);
      result.push(vertices[idx]);
    }
  }
  
  return result;
}
