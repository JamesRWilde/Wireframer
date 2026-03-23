/**
 * setEnsureBucketArrays.js - Ensure Bucket Arrays Exist and Are Cleared
 *
 * PURPOSE:
 *   Provides reusable bucket arrays for particle bucketing optimization.
 *   Creates arrays on first use and clears them on subsequent calls.
 *
 * ARCHITECTURE ROLE:
 *   Memory allocation helper for background particle rendering.
 *
 * WHY THIS EXISTS:
 *   Provides a single reusable bucket storage and avoids per-frame array allocations
 *   for high-frequency particle rendering updates.
 *
 * USAGE:
 *   import { setEnsureBucketArrays } from '@engine/set/render/draw/setEnsureBucketArrays.js';
 *   const buckets = setEnsureBucketArrays();
 */

"use strict";

let particleBuckets = null;

export function setEnsureBucketArrays() {
  if (!particleBuckets) {
    particleBuckets = new Array(16);
    for (let i = 0; i < 16; i++) {
      particleBuckets[i] = [];
    }
  }
  for (let i = 0; i < 16; i++) {
    particleBuckets[i].length = 0;
  }
  return particleBuckets;
}
