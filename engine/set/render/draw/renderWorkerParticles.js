/**
 * renderWorkerParticles.js - Render Particles from Background Worker
 *
 * PURPOSE:
 *   Renders particle data received from the background worker using optimized
 *   bucketed fillRect calls. Used when Web Worker is available.
 *
 * ARCHITECTURE ROLE:
 *   Worker-path particle renderer for background layer.
 *
 * USAGE:
 *   import { renderWorkerParticles } from '@engine/set/render/draw/renderWorkerParticles.js';
 *   renderWorkerParticles(ctx, data, count, opacity, particleColor, themeMode);
 */

"use strict";

import { getCachedColorRgb } from '@engine/set/render/draw/getCachedColorRgb.js';
import { ensureBucketArrays } from '@engine/set/render/draw/ensureBucketArrays.js';

export function renderWorkerParticles(ctx, data, count, opacity, particleColor, themeMode) {
  if (count === 0) return;

  const [baseR, baseG, baseB] = getCachedColorRgb(particleColor);
  const buckets = ensureBucketArrays();

  // Bucket particles by alpha (store as flat [x, y, size])
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

  // Render each bucket with fillRect (faster than arc)
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
