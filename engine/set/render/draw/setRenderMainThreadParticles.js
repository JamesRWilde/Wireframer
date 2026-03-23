/**
 * setRenderMainThreadParticles.js - Render Particles on Main Thread
 *
 * PURPOSE:
 *   Renders particle array on the main thread using optimized bucketed fillRect.
 *   Used as fallback when background worker is unavailable.
 *
 * ARCHITECTURE ROLE:
 *   Main-thread particle renderer for background layer.
 *
 * WHY THIS EXISTS:
 *   Provides the fallback renderer when worker-based background rendering is unavailable,
 *   preserving UX while disabling background worker mode.
 *
 * USAGE:
 *   import { setRenderMainThreadParticles } from '@engine/set/render/draw/setRenderMainThreadParticles.js';
 *   setRenderMainThreadParticles(ctx, particles, opacityScale, themeAlphaBoost, particleColor);
 */

"use strict";

import { getCachedColorRgb } from '@engine/get/render/draw/getCachedColorRgb.js';
import { setEnsureBucketArrays } from '@engine/set/render/draw/setEnsureBucketArrays.js';

export function setRenderMainThreadParticles(ctx, particles, opacityScale, themeAlphaBoost, particleColor) {
  if (particles.length === 0) return;

  const [baseR, baseG, baseB] = getCachedColorRgb(particleColor);
  const buckets = setEnsureBucketArrays();

  // Bucket particles
  for (const p of particles) {
    const alpha = Math.max(0, Math.min(1, p.alpha * opacityScale * themeAlphaBoost));
    if (alpha <= 0) continue;
    const bucketIdx = Math.min(15, Math.floor(alpha * 16));
    const bucket = buckets[bucketIdx];
    bucket.push(p.x, p.y, p.size);
  }

  // Render buckets
  for (let bucketIdx = 0; bucketIdx < 16; bucketIdx++) {
    const bucket = buckets[bucketIdx];
    const bucketLen = bucket.length;
    if (bucketLen === 0) continue;

    const alpha = (bucketIdx + 0.5) / 16;
    ctx.fillStyle = `rgba(${baseR},${baseG},${baseB},${alpha})`;

    for (let j = 0; j < bucketLen; j += 3) {
      const x = bucket[j];
      const y = bucket[j + 1];
      const size = bucket[j + 2];
      const radius = size * 0.5;
      ctx.fillRect(x - radius, y - radius, size, size);
    }
  }
}
