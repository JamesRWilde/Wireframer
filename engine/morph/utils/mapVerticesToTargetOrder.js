/**
 * mapVerticesToTargetOrder.js - Vertex Correspondence Mapping
 * 
 * PURPOSE:
 *   Maps source mesh vertices to correspond with target mesh vertices for
 *   morphing. This is a complex algorithm that finds the best matching
 *   between vertices in two meshes with different topologies, enabling
 *   smooth morph transitions between unrelated shapes.
 * 
 * ARCHITECTURE ROLE:
 *   Used during morph preparation to establish vertex correspondences.
 *   This is one of the most complex parts of the morphing system.
 * 
 * ALGORITHM OVERVIEW:
 *   1. Sample random subsets from both meshes (max 300 points)
 *   2. Normalize both samples to unit cube for scale-invariant comparison
 *   3. Use greedy nearest-neighbor matching to pair source/target points
 *   4. Map all target vertices to their nearest matched source point
 * 
 * WHY NORMALIZE:
 *   Different meshes may have vastly different scales. Normalizing to
 *   unit cube makes the distance comparisons scale-invariant, so a
 *   small sphere can morph into a large cube meaningfully.
 */

/**
 * mapVerticesToTargetOrder - Maps source vertices to target vertex order
 * 
 * @param {Array<Array<number>>} sourceVertices - Source mesh vertices
 * @param {Array<Array<number>>} targetVertices - Target mesh vertices
 * 
 * @returns {Array<Array<number>>} Mapped source vertices in target order
 *   Each element is a source vertex position corresponding to the target
 *   vertex at the same index
 */
export function mapVerticesToTargetOrder(sourceVertices, targetVertices) {
  const nSource = sourceVertices.length;
  const nTarget = targetVertices.length;
  
  // Handle empty source: return copy of target
  if (!nSource) return targetVertices.map((v) => [v[0], v[1], v[2]]);

  // Limit sample size for performance
  const MAX_MORPH_POINTS = 300;
  const sampleCount = Math.min(MAX_MORPH_POINTS, nSource, nTarget);

  /**
   * randomSample - Randomly samples elements from an array
   * @param {Array} arr - Source array
   * @param {number} count - Number of samples
   * @returns {Array} Random sample of elements
   */
  function randomSample(arr, count) {
    const n = arr.length;
    if (count >= n) return arr.slice();
    const result = [];
    const used = new Set();
    while (result.length < count) {
      const idx = Math.floor(Math.random() * n);
      if (!used.has(idx)) {
        used.add(idx);
        result.push(arr[idx]);
      }
    }
    return result;
  }

  // Sample random subsets from both meshes
  const sourceSample = randomSample(sourceVertices, sampleCount);
  const targetSample = randomSample(targetVertices, sampleCount);

  /**
   * getBounds - Computes bounding box of vertices
   * @param {Array<Array<number>>} vertices - Vertex positions
   * @returns {Object} Bounding box with min/max and scale factors
   */
  function getBounds(vertices) {
    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
    for (const [x, y, z] of vertices) {
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (z < minZ) minZ = z;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
      if (z > maxZ) maxZ = z;
    }
    return {
      minX, minY, minZ,
      sx: Math.max(1e-6, maxX - minX),  // Scale factor X (avoid division by zero)
      sy: Math.max(1e-6, maxY - minY),  // Scale factor Y
      sz: Math.max(1e-6, maxZ - minZ),  // Scale factor Z
    };
  }

  /**
   * normalizePoint - Normalizes a point to unit cube
   * @param {Array<number>} v - Point [x, y, z]
   * @param {Object} b - Bounding box
   * @returns {Array<number>} Normalized point [0-1, 0-1, 0-1]
   */
  function normalizePoint(v, b) {
    return [
      (v[0] - b.minX) / b.sx,
      (v[1] - b.minY) / b.sy,
      (v[2] - b.minZ) / b.sz,
    ];
  }

  // Compute bounding boxes and normalize samples
  const sourceBounds = getBounds(sourceSample);
  const targetBounds = getBounds(targetSample);
  const sourceNorm = sourceSample.map((v) => normalizePoint(v, sourceBounds));
  const targetNorm = targetSample.map((v) => normalizePoint(v, targetBounds));

  // Greedy nearest-neighbor matching
  // For each target point, find the closest unused source point
  const used = new Array(sourceNorm.length).fill(false);
  const mapped = new Array(targetNorm.length);
  
  for (let j = 0; j < targetNorm.length; j++) {
    let bestIdx = 0;
    let bestDist = Infinity;
    
    // Find nearest unused source point
    for (let i = 0; i < sourceNorm.length; i++) {
      if (used[i]) continue;
      
      // Compute squared distance (avoid sqrt for performance)
      const dx = sourceNorm[i][0] - targetNorm[j][0];
      const dy = sourceNorm[i][1] - targetNorm[j][1];
      const dz = sourceNorm[i][2] - targetNorm[j][2];
      const d2 = dx * dx + dy * dy + dz * dz;
      
      if (d2 < bestDist) {
        bestDist = d2;
        bestIdx = i;
      }
    }
    
    // Mark source point as used and store mapping
    used[bestIdx] = true;
    mapped[j] = [sourceSample[bestIdx][0], sourceSample[bestIdx][1], sourceSample[bestIdx][2]];
  }

  // Map all target vertices to their nearest matched source point
  const mappedFull = new Array(nTarget);
  for (let j = 0; j < nTarget; j++) {
    let bestIdx = 0;
    let bestDist = Infinity;
    
    // Find nearest mapped source point
    for (let i = 0; i < mapped.length; i++) {
      const dx = mapped[i][0] - targetVertices[j][0];
      const dy = mapped[i][1] - targetVertices[j][1];
      const dz = mapped[i][2] - targetVertices[j][2];
      const d2 = dx * dx + dy * dy + dz * dz;
      
      if (d2 < bestDist) {
        bestDist = d2;
        bestIdx = i;
      }
    }
    
    mappedFull[j] = mapped[bestIdx];
  }
  
  return mappedFull;
}
