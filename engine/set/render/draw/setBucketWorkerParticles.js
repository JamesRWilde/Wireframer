/**
 * setBucketWorkerParticles.js - Bucket worker particle data by alpha for batch rendering
 *
 * PURPOSE:
 *   Groups background particle paint calls into coarse alpha bins to reduce
 *   draw calls and state changes when rendering with CPU fill rectangles.
 *
 * ARCHITECTURE ROLE:
 *   Called by CPU background rendering pipeline after worker data is received.
 *   Prepares particles for batched draw loops by alpha bucket.
 *
 * WHY THIS EXISTS:
 *   Improves CPU background rendering performance by enabling grouped draw
 *   operations instead of per-particle style updates.
 */

"use strict";

import { setEnsureBucketArrays } from '@engine/set/render/draw/setEnsureBucketArrays.js';

/**
 * setBucketWorkerParticles - Groups particle data into 16 alpha buckets for batched rendering
 *
 * @param {Float32Array} data - Packed particle data (x, y, size, alpha per particle)
 * @param {number} count - Number of particles
 * @param {number} opacity - Global opacity multiplier
 * @returns {Array<Array<number>>} 16 buckets of [x, y, size] triples sorted by alpha
 */
export function setBucketWorkerParticles(data, count, opacity) {
  const buckets = setEnsureBucketArrays();
  for (let i = 0; i < count; i++) {
    const idx = i * 4;
    const x = data[idx];
    const y = data[idx + 1];
    const size = data[idx + 2];
    const alpha = Math.max(0, Math.min(1, data[idx + 3] * opacity));
    if (alpha <= 0) continue;
    const bucketIdx = Math.min(15, Math.floor(alpha * 16));
    const bucket = buckets[bucketIdx];
    bucket.push(x, y, size);
  }
  return buckets;
}
