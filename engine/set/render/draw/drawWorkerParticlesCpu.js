/**
 * drawWorkerParticlesCpu.js - Draw bucketed worker particles using Canvas 2D fillRect
 *
 * One function per file module.
 */

"use strict";

/**
 * drawWorkerParticlesCpu - Renders bucketed particles using fillRect with alpha-based batching
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D rendering context
 * @param {Array<Array<number>>} buckets - 16 buckets of [x, y, size] triples
 * @param {Array<number>} colorRgb - Base color as [r, g, b] with values 0-255
 */
export function drawWorkerParticlesCpu(ctx, buckets, colorRgb) {
  const [baseR, baseG, baseB] = colorRgb;
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
