/**
 * sortTriangles.js - Triangle Depth Sorting
 * 
 * PURPOSE:
 *   Sorts triangles by depth (Z coordinate) for correct painter's algorithm
 *   rendering. Further triangles are drawn first, closer ones on top.
 * 
 * ARCHITECTURE ROLE:
 *   Called by fill renderer before drawing triangles.
 *   Ensures correct occlusion for transparent and opaque fills.
 * 
 * PERFORMANCE OPTIMIZATION:
 *   Uses cached array to avoid allocating new objects every frame.
 *   Only allocates new cache if triangle count changes.
 */

/**
 * sortTriangles - Sorts triangles by depth for painter's algorithm
 * 
 * @param {Array<Array<number>>} triFaces - Array of triangle face indices
 * @param {Array<Array<number>>} T - Transformed vertex positions in view space
 * 
 * @returns {Array<Object>} Sorted array of triangle items with z-depth
 * 
 * The function:
 * 1. Reuses cached array to avoid per-frame allocation
 * 2. Computes average Z depth for each triangle
 * 3. Sorts by Z descending (furthest first)
 * 4. Returns sorted array for rendering
 */
export function sortTriangles(triFaces, T) {
  // Reuse cached array to avoid allocating objects every frame
  let triOrder = triFaces._triOrderCache;
  if (triOrder?.length !== triFaces.length) {
    // Allocate new cache if size changed
    triOrder = new Array(triFaces.length);
    for (let i = 0; i < triFaces.length; i++) {
      triOrder[i] = { tri: null, triIndex: 0, z: 0 };
    }
    triFaces._triOrderCache = triOrder;
  }
  
  // Update cache with current triangle data and depths
  for (let i = 0; i < triFaces.length; i++) {
    const tri = triFaces[i];
    triOrder[i].tri = tri;
    triOrder[i].triIndex = i;
    // Average Z of three vertices for depth sorting
    triOrder[i].z = (T[tri[0]][2] + T[tri[1]][2] + T[tri[2]][2]) / 3;
  }
  
  // Sort by Z descending (furthest first for painter's algorithm)
  triOrder.sort((a, b) => b.z - a.z);
  
  return triOrder;
}
