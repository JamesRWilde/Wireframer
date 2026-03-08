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
import { bucketWorkerParticles } from '@engine/set/render/draw/bucketWorkerParticles.js';
import { drawWorkerParticlesCpu } from '@engine/set/render/draw/drawWorkerParticlesCpu.js';

export function renderWorkerParticles(ctx, data, count, opacity, particleColor, themeMode) {
  if (count === 0) return;

  const colorRgb = getCachedColorRgb(particleColor);
  const buckets = bucketWorkerParticles(data, count, opacity);

  drawWorkerParticlesCpu(ctx, buckets, colorRgb);
}

