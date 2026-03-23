/**
 * createParticleBufferData.js - Generate packed particle buffer data for GPU
 *
 * One function per file module.
 */

"use strict";

import { getRandomFloat } from '@engine/get/render/background/getRandomFloat.js';

/**
 * createParticleBufferData - Creates a packed Float32Array of particle data
 *
 * Each particle has 8 attributes: x, y, vx, vy, size, alphaBase, speed, phase.
 *
 * @param {number} width - Canvas width in pixels
 * @param {number} height - Canvas height in pixels
 * @param {number} density - Density multiplier (0-1+)
 * @param {number} baseSpeed - Base animation speed multiplier
 * @returns {{count: number, data: Float32Array}} Particle count and packed buffer data
 */
export function createParticleBufferData(width, height, density, baseSpeed) {
  const baseCount = Math.max(32, Math.round((width * height) / 90000));
  const count = Math.max(8, Math.round(baseCount * Math.min(2.5, 1 + density)));
  const data = new Float32Array(count * 8);

  for (let i = 0; i < count; i++) {
    const valueOffset = i * 8;
    const angle = Math.random() * Math.PI * 2;
    const velocityMag = 0.03 + Math.random() * 0.08;
    const spatialVelocityScale = 0.12;

    data[valueOffset] = Math.random() * width;
    data[valueOffset + 1] = Math.random() * height;
    data[valueOffset + 2] = Math.cos(angle) * velocityMag * width * spatialVelocityScale;
    data[valueOffset + 3] = Math.sin(angle) * velocityMag * height * spatialVelocityScale;
    data[valueOffset + 4] = getRandomFloat(1.2, 3.8);
    data[valueOffset + 5] = getRandomFloat(0.35, 0.95);
    data[valueOffset + 6] = getRandomFloat(0.9, 1.3) * baseSpeed;
    data[valueOffset + 7] = Math.random() * Math.PI * 2;
  }

  return { count, data };
}
