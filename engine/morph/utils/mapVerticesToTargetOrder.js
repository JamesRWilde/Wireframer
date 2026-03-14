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

"use strict";

import { randomSample } from './randomSample.js';
import { getBounds } from './getBounds.js';
import { normalizePoint } from './normalizePoint.js';
import { findNearestIndex } from './findNearestIndex.js';


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

  // Sample random subsets from both meshes
  const sourceSample = randomSample(sourceVertices, sampleCount);
  const targetSample = randomSample(targetVertices, sampleCount);

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
    const bestIdx = findNearestIndex(sourceNorm, targetNorm[j], used);
    used[bestIdx] = true;
    mapped[j] = [sourceSample[bestIdx][0], sourceSample[bestIdx][1], sourceSample[bestIdx][2]];
  }

  // Map all target vertices to their nearest matched source point
  const mappedFull = new Array(nTarget);
  for (let j = 0; j < nTarget; j++) {
    const bestIdx = findNearestIndex(mapped, targetVertices[j]);
    mappedFull[j] = mapped[bestIdx];
  }
  return mappedFull;
}
