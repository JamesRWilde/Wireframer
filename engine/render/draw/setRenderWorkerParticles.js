/**
 * setRenderWorkerParticles.js - Render Particles from Background Worker
 *
 * PURPOSE:
 *   Renders particle data received from the background worker using optimized
 *   bucketed fillRect calls. Used when Web Worker is available.
 *
 * ARCHITECTURE ROLE:
 *   Worker-path particle renderer for background layer.
 *
 * USAGE:
 *   import { setRenderWorkerParticles } from '@engine/render/draw/setRenderWorkerParticles.js';
 *   setRenderWorkerParticles(ctx, data, count, opacity, particleColor, themeMode);
 */

"use strict";

import { setGetCachedColorRgb } from '@engine/render/draw/setGetCachedColorRgb.js';
import { setBucketWorkerParticles } from '@engine/render/draw/setBucketWorkerParticles.js';
import { setDrawWorkerParticlesCpu } from '@engine/render/draw/setDrawWorkerParticlesCpu.js';

export function setRenderWorkerParticles(ctx, data, count, opacity, particleColor, themeMode) {
  if (count === 0) return;

  const colorRgb = setGetCachedColorRgb(particleColor);
  const buckets = setBucketWorkerParticles(data, count, opacity);

  setDrawWorkerParticlesCpu(ctx, buckets, colorRgb);
}

