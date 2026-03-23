/**
 * setBucketWorkerParticles.js - Bucket worker particle data by alpha for batch rendering
 *
 * One function per file module.
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
