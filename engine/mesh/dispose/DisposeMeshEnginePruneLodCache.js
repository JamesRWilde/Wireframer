/**
 * DisposeMeshEnginePruneLodCache.js - LOD Cache Pruning
 * 
 * PURPOSE:
 *   Removes old entries from the LOD cache when it exceeds a maximum size.
 *   This prevents memory bloat from caching too many LOD variations while
 *   still providing fast access to recently used detail levels.
 * 
 * ARCHITECTURE ROLE:
 *   Called by InitMeshEngineGreedyClusterDecimator after adding a new cache entry.
 *   Implements a simple FIFO (First In, First Out) eviction policy.
 * 
 * WHY PRUNE:
 *   The LOD cache stores decimated meshes for fast retrieval. Without
 *   pruning, the cache would grow indefinitely as the user adjusts
 *   the detail slider, eventually consuming excessive memory.
 * 
 * WHY FIFO:
 *   FIFO is simple and effective. The most recently added entries are
 *   the most likely to be needed again (user adjusting slider nearby),
 *   while older entries are less likely to be reused.
 */

"use strict";

/**
 * DisposeMeshEnginePruneLodCache - Removes oldest cache entry if cache exceeds max size
 * 
 * @param {Map} cache - The LOD cache Map to prune
 * @param {number} [maxSize=12] - Maximum number of entries to keep
 * 
 * The function removes the first (oldest) entry if the cache size
 * exceeds the maximum. This is a simple FIFO eviction policy.
 */
export function DisposeMeshEnginePruneLodCache(cache, maxSize = 12) {
  // If cache is within size limit, nothing to do
  if (cache.size <= maxSize) return;
  
  // Get the first (oldest) key in the cache
  // Map maintains insertion order, so keys().next().value is the oldest
  const firstKey = cache.keys().next().value;
  
  // Remove the oldest entry
  cache.delete(firstKey);
}
